---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
GeekLappy is a real-time e-commerce mobile application built with React Native (Expo) for the frontend and Node.js for the backend. The application features real-time updates through WebSockets, user authentication, product management, and an admin dashboard.

## Repository Structure
The repository is organized into two main components:
- **geekapp/**: React Native mobile application built with Expo
- **backend/**: Node.js server with Express, MongoDB, and WebSocket support

### Main Repository Components
- **geekapp/**: Mobile application frontend with React Native and Expo
- **backend/**: Server-side application with Express, MongoDB, and AdminJS
- **Root scripts**: Helper scripts for managing WebSocket connections and server operations

## Projects

### Mobile App (geekapp)
**Configuration File**: package.json

#### Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript 5.8.3
**Framework**: React Native with Expo (v53.0.9)
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- expo-router (v5.0.6) - File-based routing
- react-native (v0.79.2) - Mobile app framework
- nativewind (v4.1.23) - Tailwind CSS for React Native
- socket.io-client (v4.8.1) - WebSocket client
- axios (v1.10.0) - HTTP client
- @react-native-async-storage/async-storage - Local storage

#### Build & Installation
```bash
npm install
npx expo start
```

### Backend Server
**Configuration File**: package.json

#### Language & Runtime
**Language**: JavaScript (with TypeScript types)
**Version**: Node.js (ESM modules)
**Framework**: Express (v5.1.0)
**Package Manager**: npm
**Database**: MongoDB (v6.16.0) with Mongoose (v8.15.1)

#### Dependencies
**Main Dependencies**:
- express (v5.1.0) - Web framework
- mongoose (v8.15.1) - MongoDB ODM
- socket.io (v4.8.1) - WebSocket server
- adminjs (v7.8.16) - Admin panel
- jsonwebtoken (v9.0.2) - Authentication
- bcrypt (v6.0.0) - Password hashing
- redis (v5.6.1) - Caching

**Development Dependencies**:
- nodemon (v3.1.10) - Development server
- dotenv (v16.5.0) - Environment variables

#### Build & Installation
```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```

#### Main Files & Resources
**Entry Point**: src/index.js
**API Routes**: src/routes/
**Database Models**: src/models/
**WebSocket Config**: src/config/comprehensive-websocket.js
**Admin Panel**: src/admin/

#### Real-time Features
The application implements comprehensive WebSocket integration for real-time updates:
- Product inventory changes
- Order status updates
- Notifications
- Admin dashboard real-time monitoring