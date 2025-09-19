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

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@geeklappy.com',
  password: process.env.ADMIN_PASSWORD || 'GeekLappy@2024#Admin',
}

console.log('?? Default Admin Credentials:', DEFAULT_ADMIN.email, DEFAULT_ADMIN.password);

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
    ],
    rootPath: '/admin',
    dashboard: {
        component: {
            edit: Components.Dashboard
        },
    },
    branding: {
        companyName: 'Geek Lappy Admin Panel',
        softwareBrothers: false,
        logo: '../../../public/geeklappylogo.png',
        favicon: '../../../public/geeklappylogo.png',
        theme: {
            colors: {
                primary100: '#3498db',
                primary80: '#2980b9',
                primary60: '#1e88e5',
            },
        },
    },
};

export const buildAdminRouter = async (server) => {
  console.log('?? Building AdminJS router...');
  
  // Create AdminJS instance
  const admin = new AdminJS(adminJsOptions);

  // Environment variables with fallbacks
  const cookiePassword = process.env.ADMIN_COOKIE_PASSWORD || "fallback-cookie-password-12345678901234567890";
  const sessionSecret = process.env.SESSION_SECRET || "fallback-session-secret-12345678901234567890";
  const cookieName = process.env.ADMIN_COOKIE_NAME || 'geek_lappy_admin_session';

  console.log('?? Admin Email:', process.env.ADMIN_EMAIL);
  console.log('?? Cookie Name:', cookieName);
  console.log('?? Has Cookie Password:', !!cookiePassword);
  console.log('?? Has Session Secret:', !!sessionSecret);

  // ? FIXED: Proper AdminJS authentication configuration
  const AdminJSrouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async ({ email, password }) => {
        console.log('?? Admin login attempt:', email);
        
        if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
          console.log('? Authentication successful for:', email);
          return {
            id: 'admin-user',
            email: email,
            role: 'admin',
            title: 'Administrator',
            isAuthenticated: true
          };
        }
        
        console.log('? Authentication failed for:', email);
        return null;
      },
      cookieName: cookieName,
      cookiePassword: cookiePassword
    },
    null, // No custom session store (using default memory store for dev)
    {
      // ? FIXED: Proper session configuration
      resave: false,          // Changed from true to false
      saveUninitialized: false, // Changed from true to false  
      secret: sessionSecret,
      cookie: {
        httpOnly: true,
        secure: false,        // false for development (HTTP)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours (shorter for better security)
        sameSite: 'lax',
      },
      name: cookieName,       // ? FIXED: Use same cookie name
    }
  );

  console.log('? AdminJS router built successfully');
  return AdminJSrouter;
}

export { AdminJS };
