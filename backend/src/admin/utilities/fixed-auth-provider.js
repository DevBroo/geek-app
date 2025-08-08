import { User } from '../../models/user.model.js';
import bcrypt from 'bcrypt';

// Simple authentication provider that uses the User model
const authProvider = {
  authenticate: async ({ email, password }) => {
    try {
      console.log('🔐 Admin login attempt - Email:', email);
      
      // Find admin user in database
      const user = await User.findOne({ 
        email: email, 
        role: 'admin' 
      }).lean();
      
      if (!user) {
        console.warn('🚫 Admin user not found:', email);
        
        // Fallback to environment variables if no admin user in database
        if (email === process.env.ADMIN_EMAIL && 
            password === process.env.ADMIN_PASSWORD) {
          console.log('✅ Admin authentication successful using environment variables');
          return { 
            email: process.env.ADMIN_EMAIL,
            role: 'admin',
            userId: 'env-admin' // Special ID for env-based admin
          };
        }
        
        return null;
      }
      
      console.log('🎯 Found admin user:', user.email);
      
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
        userId: user._id.toString()
      };
    } catch (error) {
      console.error('💥 Admin authentication error:', error.message);
      console.error('Error stack:', error.stack);
      return null;
    }
  }
};

export {authProvider};