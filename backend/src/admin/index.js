import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); 

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
import {authProvider} from './utilities/fixed-auth-provider.js'

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@geeklappy.com',
  password: process.env.ADMIN_PASSWORD || 'GeekLappy@2024#Admin',
}

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
})


const adminJsOptions = {
    // componentLoader,
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
        softwareBrothers: false, // Hide "Software Brothers" logo
        logo: true, // You can provide a URL to your logo
        favicon: true, // Provide a favicon URL
        // Set your logo and favicon URLs relative to the public folder
        logo: '../../../public/geeklappylogo.png', // Place logo.png in your public folder (e.g., public/logo.png)
        favicon: '../../../public/geeklappylogo.png', // Place favicon.ico in your public folder (e.g., public/favicon.ico)
        theme: {
            // You can define a custom theme here
            colors: {
                primary100: '#3498db', // A nice blue
                primary80: '#2980b9',
                primary60: '#1e88e5',
                // ... more colors
            },
        },
    },
    // ... other AdminJS configurations (dashboard, branding, authentication etc.)
};



export const buildAdminRouter = async (httpserver) => {
  // Create AdminJS instance
  const admin = new AdminJS(adminJsOptions);

  // Use a single cookie password and session secret
  const cookiePassword = process.env.ADMIN_COOKIE_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  console.log('🔧 Building AdminJS router with the following configuration:');
  console.log('🍪 Cookie Name:', process.env.ADMIN_COOKIE_NAME || 'adminjs');
  console.log('🔑 Using secure cookie and session configuration');

  const AdminJSrouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: authProvider,
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
      cookieName: process.env.ADMIN_COOKIE_NAME || 'adminjs',
      cookiePassword: cookiePassword
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

// import {server} from '../index.js'; // Import the server instance

// buildAdminRouter(server); // Call the function to build and mount the AdminJS router




export {
    AdminJS,    
}