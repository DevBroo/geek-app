import dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); 

import {AdminJS, ComponentLoader} from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import express from 'express';
import { componentLoader, Components } from "./components.js";
import { UserResource } from './resources/user.resource.js';
import { categoryResource } from './resources/category.resource.js';
import { inventoryResource } from './resources/inventory.resource.js';
import { frequentlyAskedQuestionsResource } from './resources/frequentlyAskedQuestions.resource.js';
import { notificationsResource } from './resources/notificatoins.resource.js';
import { OrdersResource } from './resources/orders.resource.js';
import { productResource } from './resources/products.resource.js';
import { reviewsAndRatingsResource } from './resources/reviewsAndRatings.resource.js';
import { transactionResource } from './resources/transactoin.resource.js';
import { walletResource } from './resources/wallet.resource.js';

// Import the fixed auth provider
import {authProvider} from './utilities/auth-provider.js'

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@geeklappy.com',
  password: process.env.ADMIN_PASSWORD || 'GeekLappy@2024#Admin',
}
console.log('👤 Default Admin Credentials:', DEFAULT_ADMIN.email, DEFAULT_ADMIN.password);


AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
})


const adminJsOptions = {
    componentLoader,
    resources: [ 
        UserResource,
        categoryResource,
        inventoryResource,
        frequentlyAskedQuestionsResource,
        notificationsResource,
        OrdersResource,
        productResource,
        reviewsAndRatingsResource,
        transactionResource,
        walletResource,
        
        // ... other models
    ],
    rootPath: '/admin',
     // --- Dashboard: Customize your dashboard ---
    dashboard: {
        // You can create a custom dashboard component here
        component: {
            edit: Components.Dashboard
        },
    },
    // --- Branding: Customize the look and feel ---//
    branding: {
        companyName: 'Geek Lappy Admin Panel',
        softwareBrothers: false, 
        logo: true, 
        favicon: true, 
        logo: '../../../public/geeklappylogo.png', 
        favicon: '../../../public/geeklappylogo.png', 
        theme: {
            colors: {
                primary100: '#3498db', // blue
                primary80: '#2980b9',
                primary60: '#1e88e5',
                // ... more colors
            },
        },
    },
    // ... other AdminJS configurations (dashboard, branding, authentication etc.)
};



export const buildAdminRouter = async (server) => {
  // Create AdminJS instance
  const admin = new AdminJS(adminJsOptions);

  // Use a single cookie password and session secret
  const cookiePassword = process.env.ADMIN_COOKIE_PASSWORD || "fallback-cookie-password-12345678901234567890";
  const sessionSecret = process.env.SESSION_SECRET || "fallback-session-secret-12345678901234567890";

  console.log('🔧 Building AdminJS router with the following configuration:');
  console.log('🍪 Cookie Name:', process.env.ADMIN_COOKIE_NAME || 'adminjs');
  console.log('🔑 Using secure cookie and session configuration');

  // email = DEFAULT_ADMIN.email;
  // password = DEFAULT_ADMIN.password;
  // console.log('👤 Default Admin Credentials:', email, password);

  const AdminJSrouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async ({ email, password }) => {
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return {
            email,
            role: 'admin',
            isAuthenticated: true
          };
        }
        return null;
      },
        
      cookieName: process.env.ADMIN_COOKIE_NAME || 'adminjs',
      cookiePassword: cookiePassword
      
      // authenticate: async (email, password) => {
      //   console.log('🔐 Starting admin authentication flow...');
      //   console.log('📨 Received login request for:', email);
        
      //   try {
      //     // Use the auth provider's authentication logic
      //     const user = await authProvider.authenticate({ email, password });
          
      //     if (!user) {
      //       console.error('❌ Authentication failed for user:', email);
      //       return null;
      //     }
          
      //     console.log('✅ Authentication successful for:', email);
      //     return { 
      //       ...user, 
      //       email: user.email,
      //       role: user.role,
      //       userId: user.userId || user.email,
      //       isAuthenticated: true
      //     };
      //   } catch (error) {
      //     console.error('💥 Authentication error:', error.message);
      //     console.error('Error stack:', error.stack);
      //     return null;
      //   }
      // },
      
    },
    null,
    {
      resave: true,
      saveUninitialized: true,
      secret: sessionSecret,
      cookie: {
        httpOnly: true,
        secure: false, // Set to false for development
        maxAge: 7 * 24 * 60 * 60 * 1000, // One week
        sameSite: 'lax', // More secure than 'strict' for login flows
      },
      name: 'adminjs',
    }
  );

  return AdminJSrouter;
}





export {
    AdminJS,
        
}
