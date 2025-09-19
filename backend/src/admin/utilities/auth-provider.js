import { DefaultAuthProvider } from 'adminjs';
import componentLoader from './component-loader.js';
import { User } from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    try {
      // Find admin user in database
      const user = await User.findOne({ 
        email: "admin@geeklappy.com", 
        role: 'admin' 
      }).lean().exec();
      
      if (!user) return null;

      console.log('?? Admin login attempt:', email);
      console.log('?? Found admin user:', user.email);
      console.log('?? Stored password hash:', user.password);
      console.log('?? Provided password:', password);
  
      // const isValidPassword = user.password === password || await bcrypt.compare(password, user.password);

      const isValidPassword = user.password === password || await bcrypt.compare(password, user.password);
      if (!isValidPassword) return null;

      // Generate JWT token
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      // Return user object with token
      return { 
        email: user.email, 
        role: 'admin',
        userId: user._id.toString(),
        token // <-- Attach the token here
      };
    } catch (error) {
      console.error('💥 Admin authentication critical error:', error.message);
      return null;
    }
  },
});

export { authProvider };