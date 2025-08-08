import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AdminAuthService {
  constructor() {
    this.adminCredentials = {
      email: process.env.ADMIN_EMAIL || 'admin@geeklappy.com',
      password: process.env.ADMIN_PASSWORD || 'GeekLappy@2024#Admin',
    };
    this.sessionStore = new Map(); // In-memory session store (consider Redis for production)
  }

  async authenticate(email, password) {
    try {
      // Check against environment credentials
      if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
        const sessionToken = this.generateSessionToken(email);
        this.sessionStore.set(sessionToken, {
          email,
          role: 'admin',
          loginTime: new Date(),
          lastActivity: new Date()
        });

        return {
          email,
          role: 'admin',
          sessionToken
        };
      }

      return null;
    } catch (error) {
      console.error('Admin authentication error:', error);
      return null;
    }
  }

  generateSessionToken(email) {
    return jwt.sign(
      { 
        email, 
        role: 'admin',
        timestamp: Date.now()
      },
      process.env.SESSION_SECRET || 'default-session-secret',
      { 
        expiresIn: '24h'
      }
    );
  }

  validateSession(sessionToken) {
    try {
      const decoded = jwt.verify(sessionToken, process.env.SESSION_SECRET || 'default-session-secret');
      const session = this.sessionStore.get(sessionToken);
      
      if (session) {
        // Update last activity
        session.lastActivity = new Date();
        this.sessionStore.set(sessionToken, session);
        return session;
      }
      
      return null;
    } catch (error) {
      console.error('Session validation error:', error);
      this.sessionStore.delete(sessionToken);
      return null;
    }
  }

  logout(sessionToken) {
    this.sessionStore.delete(sessionToken);
  }

  // Clean up expired sessions (call this periodically)
  cleanupSessions() {
    const now = new Date();
    const oneHour = 60 * 60 * 1000;

    for (const [token, session] of this.sessionStore.entries()) {
      if (now - session.lastActivity > oneHour) {
        this.sessionStore.delete(token);
      }
    }
  }

  getActiveSessionsCount() {
    this.cleanupSessions();
    return this.sessionStore.size;
  }
}

export const adminAuthService = new AdminAuthService();

// Cleanup sessions every 30 minutes
setInterval(() => {
  adminAuthService.cleanupSessions();
}, 30 * 60 * 1000);