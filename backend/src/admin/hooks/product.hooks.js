// AdminJS Hooks for Product Resource - Optimizations and Validations
import { ApiError } from '../../utils/ApiError.js';
import { Product } from '../../models/products.model.js';
import { adminWS } from '../services/websocket-admin.js';
import { wsManager } from '../../config/websocket.js';

export const productHooks = {
  // Before creating a product
  before: {
    new: async (request, context) => {
      const { payload } = request;
      
      // Auto-calculate discounted price if not provided
      if (payload.originalPrice && payload.discountPercentage) {
        payload.discountedPrice = payload.originalPrice - (payload.originalPrice * payload.discountPercentage / 100);
      }
      
      // Auto-set availability based on quantity
      payload.isAvailable = payload.quantity > 0;
      
      // Add created user info
      if (context.currentAdmin) {
        payload.user = context.currentAdmin._id;
      }
      
      return request;
    },
    
    edit: async (request, context) => {
      const { payload } = request;
      
      // Recalculate discounted price on edit
      if (payload.originalPrice && payload.discountPercentage) {
        payload.discountedPrice = payload.originalPrice - (payload.originalPrice * payload.discountPercentage / 100);
      }
      
      // Auto-set availability
      payload.isAvailable = payload.quantity > 0;
      
      return request;
    }
  },

  // After creating/updating
  after: {
    new: async (response, request, context) => {
      const productData = response.record.params;
      console.log('New product created:', productData.productTitle);
      
      try {
        // Notify via WebSocket
        await adminWS.handleAdminAction('new', 'Product', productData);
        
        // Direct WebSocket emit for immediate notification
        if (wsManager.io) {
          wsManager.emitProductEvent('created', productData);
        }
        
        // Notify frontend via webhook
        await notifyFrontendOfProductChange(productData, 'created');
        
      } catch (error) {
        console.error('Error notifying product creation:', error);
      }
      
      return response;
    },
    
    edit: async (response, request, context) => {
      const productData = response.record.params;
      console.log('Product updated:', productData.productTitle);
      
      try {
        // Notify via WebSocket
        await adminWS.handleAdminAction('edit', 'Product', productData);
        
        // Direct WebSocket emit
        if (wsManager.io) {
          wsManager.emitProductEvent('updated', productData);
        }
        
        // Notify frontend via webhook
        await notifyFrontendOfProductChange(productData, 'updated');
        
      } catch (error) {
        console.error('Error notifying product update:', error);
      }
      
      return response;
    },
    
    delete: async (response, request, context) => {
      const productId = request.params.recordId;
      console.log('Product deleted:', productId);
      
      try {
        // Notify via WebSocket
        await adminWS.handleAdminAction('delete', 'Product', { _id: productId });
        
        // Direct WebSocket emit
        if (wsManager.io) {
          wsManager.emitProductEvent('deleted', { productId });
        }
        
        // Notify frontend via webhook
        await notifyFrontendOfProductChange({ productId }, 'deleted');
        
      } catch (error) {
        console.error('Error notifying product deletion:', error);
      }
      
      return response;
    }
  }
};

// Optional: Webhook to notify frontend of changes
export const notifyFrontendOfProductChange = async (product, action = 'update') => {
  try {
    // This could be a webhook to your frontend or cache invalidation
    // Example: await axios.post('your-frontend-webhook-url', { product, action });
    console.log(`Product ${action}:`, product.productTitle);
  } catch (error) {
    console.error('Failed to notify frontend:', error);
  }
};