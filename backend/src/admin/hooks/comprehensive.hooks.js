// Comprehensive AdminJS Hooks for ALL Data Types - Real-time Integration
import { adminWS } from '../services/websocket-admin.js';
import { wsManager } from '../../config/websocket.js';

// Universal notification function
const notifyRealTimeChange = async (resource, action, data) => {
  try {
    // Notify via WebSocket
    await adminWS.handleAdminAction(action, resource, data);
    
    // Direct WebSocket emit for immediate notification
    if (wsManager.io) {
      const eventName = `${resource.toLowerCase()}:${action}`;
      wsManager.broadcastToClients(eventName, data);
      console.log(`📡 Emitted ${eventName} event`);
    }
    
    // Log the change
    console.log(`🔔 ${resource} ${action}:`, data._id || data.id || 'N/A');
    
  } catch (error) {
    console.error(`Error notifying ${resource} ${action}:`, error);
  }
};

// ========================= PRODUCT HOOKS =========================
export const productHooks = {
  before: {
    new: async (request, context) => {
      const { productPrice, productDiscountPercentage } = request.payload;
      
      if (productPrice && productDiscountPercentage) {
        const discountAmount = (productPrice * productDiscountPercentage) / 100;
        request.payload.productDiscountedPrice = productPrice - discountAmount;
      }
      
      request.payload.createdAt = new Date();
      return request;
    },
    edit: async (request, context) => {
      const { productPrice, productDiscountPercentage } = request.payload;
      
      if (productPrice && productDiscountPercentage) {
        const discountAmount = (productPrice * productDiscountPercentage) / 100;
        request.payload.productDiscountedPrice = productPrice - discountAmount;
      }
      
      request.payload.updatedAt = new Date();
      return request;
    }
  },
  after: {
    new: async (response, request, context) => {
      await notifyRealTimeChange('Product', 'created', response.record.params);
      return response;
    },
    edit: async (response, request, context) => {
      await notifyRealTimeChange('Product', 'updated', response.record.params);
      return response;
    },
    delete: async (response, request, context) => {
      await notifyRealTimeChange('Product', 'deleted', { productId: request.params.recordId });
      return response;
    }
  }
};

// ========================= ORDER HOOKS =========================
export const orderHooks = {
  after: {
    new: async (response, request, context) => {
      const orderData = response.record.params;
      await notifyRealTimeChange('Order', 'created', orderData);
      
      // Special notification for new orders
      wsManager.broadcastToAdmins('order:new_notification', {
        orderId: orderData._id,
        userId: orderData.userId,
        totalAmount: orderData.totalAmount,
        status: orderData.orderStatus,
        timestamp: new Date()
      });
      
      return response;
    },
    edit: async (response, request, context) => {
      const orderData = response.record.params;
      await notifyRealTimeChange('Order', 'updated', orderData);
      
      // Notify user about order status change
      wsManager.sendToSocket(orderData.userId, 'order:status_updated', {
        orderId: orderData._id,
        newStatus: orderData.orderStatus,
        message: `Your order status has been updated to: ${orderData.orderStatus}`
      });
      
      return response;
    },
    delete: async (response, request, context) => {
      await notifyRealTimeChange('Order', 'deleted', { orderId: request.params.recordId });
      return response;
    }
  }
};

// ========================= NOTIFICATION HOOKS =========================
export const notificationHooks = {
  after: {
    new: async (response, request, context) => {
      const notificationData = response.record.params;
      await notifyRealTimeChange('Notification', 'created', notificationData);
      
      // Send push notification to specific user or all users
      if (notificationData.userId) {
        // Send to specific user
        wsManager.sendToSocket(notificationData.userId, 'notification:new', notificationData);
      } else {
        // Broadcast to all users
        wsManager.broadcastToClients('notification:broadcast', notificationData);
      }
      
      return response;
    },
    edit: async (response, request, context) => {
      await notifyRealTimeChange('Notification', 'updated', response.record.params);
      return response;
    },
    delete: async (response, request, context) => {
      await notifyRealTimeChange('Notification', 'deleted', { notificationId: request.params.recordId });
      return response;
    }
  }
};

// ========================= WALLET/TRANSACTION HOOKS =========================
export const walletHooks = {
  after: {
    new: async (response, request, context) => {
      await notifyRealTimeChange('Wallet', 'created', response.record.params);
      return response;
    },
    edit: async (response, request, context) => {
      const walletData = response.record.params;
      await notifyRealTimeChange('Wallet', 'updated', walletData);
      
      // Notify user about wallet balance change
      wsManager.sendToSocket(walletData.userId, 'wallet:balance_updated', {
        newBalance: walletData.balance,
        previousBalance: walletData.previousBalance,
        changeAmount: walletData.balance - (walletData.previousBalance || 0),
        timestamp: new Date()
      });
      
      return response;
    }
  }
};

export const transactionHooks = {
  after: {
    new: async (response, request, context) => {
      const transactionData = response.record.params;
      await notifyRealTimeChange('Transaction', 'created', transactionData);
      
      // Notify user about new transaction
      wsManager.sendToSocket(transactionData.userId, 'transaction:new', {
        transactionId: transactionData._id,
        amount: transactionData.amount,
        type: transactionData.type,
        status: transactionData.status,
        timestamp: new Date()
      });
      
      return response;
    },
    edit: async (response, request, context) => {
      const transactionData = response.record.params;
      await notifyRealTimeChange('Transaction', 'updated', transactionData);
      
      // Notify user about transaction status change
      if (transactionData.status === 'completed' || transactionData.status === 'failed') {
        wsManager.sendToSocket(transactionData.userId, 'transaction:status_updated', {
          transactionId: transactionData._id,
          newStatus: transactionData.status,
          message: `Transaction ${transactionData.status}`
        });
      }
      
      return response;
    }
  }
};

// ========================= FAQ HOOKS =========================
export const faqHooks = {
  after: {
    new: async (response, request, context) => {
      await notifyRealTimeChange('FAQ', 'created', response.record.params);
      
      // Broadcast new FAQ to all users
      wsManager.broadcastToClients('faq:new', {
        question: response.record.params.question,
        answer: response.record.params.answer,
        category: response.record.params.category
      });
      
      return response;
    },
    edit: async (response, request, context) => {
      await notifyRealTimeChange('FAQ', 'updated', response.record.params);
      return response;
    },
    delete: async (response, request, context) => {
      await notifyRealTimeChange('FAQ', 'deleted', { faqId: request.params.recordId });
      return response;
    }
  }
};

// ========================= CATEGORY HOOKS =========================
export const categoryHooks = {
  after: {
    new: async (response, request, context) => {
      await notifyRealTimeChange('Category', 'created', response.record.params);
      return response;
    },
    edit: async (response, request, context) => {
      await notifyRealTimeChange('Category', 'updated', response.record.params);
      return response;
    },
    delete: async (response, request, context) => {
      await notifyRealTimeChange('Category', 'deleted', { categoryId: request.params.recordId });
      return response;
    }
  }
};

// ========================= CART HOOKS =========================
export const cartHooks = {
  after: {
    new: async (response, request, context) => {
      const cartData = response.record.params;
      await notifyRealTimeChange('Cart', 'created', cartData);
      
      // Notify user about cart update
      wsManager.sendToSocket(cartData.userId, 'cart:item_added', {
        productId: cartData.productId,
        quantity: cartData.quantity,
        message: 'Item added to cart'
      });
      
      return response;
    },
    edit: async (response, request, context) => {
      const cartData = response.record.params;
      await notifyRealTimeChange('Cart', 'updated', cartData);
      
      // Notify user about cart update
      wsManager.sendToSocket(cartData.userId, 'cart:item_updated', {
        productId: cartData.productId,
        newQuantity: cartData.quantity
      });
      
      return response;
    },
    delete: async (response, request, context) => {
      await notifyRealTimeChange('Cart', 'deleted', { cartItemId: request.params.recordId });
      return response;
    }
  }
};

// ========================= REVIEW HOOKS =========================
export const reviewHooks = {
  after: {
    new: async (response, request, context) => {
      const reviewData = response.record.params;
      await notifyRealTimeChange('Review', 'created', reviewData);
      
      // Notify about new review
      wsManager.broadcastToAdmins('review:new', {
        productId: reviewData.productId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      return response;
    },
    edit: async (response, request, context) => {
      await notifyRealTimeChange('Review', 'updated', response.record.params);
      return response;
    }
  }
};

// ========================= USER HOOKS =========================
export const userHooks = {
  after: {
    new: async (response, request, context) => {
      const userData = response.record.params;
      await notifyRealTimeChange('User', 'created', {
        userId: userData._id,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role
      });
      
      // Notify admins about new user registration
      wsManager.broadcastToAdmins('user:registered', {
        userId: userData._id,
        email: userData.email,
        fullName: userData.fullName,
        timestamp: new Date()
      });
      
      return response;
    },
    edit: async (response, request, context) => {
      const userData = response.record.params;
      await notifyRealTimeChange('User', 'updated', {
        userId: userData._id,
        email: userData.email,
        fullName: userData.fullName
      });
      
      return response;
    }
  }
};

// Export all hooks
export const allHooks = {
  Product: productHooks,
  Order: orderHooks,
  Notification: notificationHooks,
  Wallet: walletHooks,
  Transaction: transactionHooks,
  FAQ: faqHooks,
  Category: categoryHooks,
  Cart: cartHooks,
  Review: reviewHooks,
  User: userHooks
};