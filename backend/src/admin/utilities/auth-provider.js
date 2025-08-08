import { DefaultAuthProvider } from 'adminjs';
import componentLoader from './component-loader.js';
import { User } from '../../models/user.model.js';
import bcrypt from 'bcrypt';

const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    try {
      console.log('🌴 Admin login attempt - Email:', email);
      
      // Find admin user in database (Mongoose syntax)
      const user = await User.findOne({ 
        email: email, 
        role: 'admin' 
      }).lean().exec();
      
      if (!user) {
        console.warn('🚫 Admin user not found:', email);
        return null;
      }
      
      console.log('🎯 Found admin user:', user.email);
      console.log('🔑 Attempting password verification...');
      
      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.warn('❌ Invalid password for admin:', email);
        return null;
      }
      
      console.log('✅ Admin authentication successful:', email);
      return { 
        email: user.email, 
        role: 'admin',
        userId: user._id.toString() // Required for AdminJS session
      };
    } catch (error) {
      console.error('💥 Admin authentication critical error:', error.message);
      console.error('Error stack:', error.stack);
      
      // Special handling for database connection errors
      if (error.name === 'MongoServerError') {
        console.error('⚠️ MongoDB connection error detected!');
      }
      
      return null;
    }
  },
});

export {authProvider};
