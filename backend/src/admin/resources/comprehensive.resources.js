// Comprehensive AdminJS Resources with Real-time Integration for ALL Data Types
import AdminJS from 'adminjs';
import { 
  productHooks, 
  orderHooks, 
  notificationHooks, 
  walletHooks, 
  transactionHooks, 
  faqHooks, 
  categoryHooks, 
  cartHooks, 
  reviewHooks, 
  userHooks 
} from '../hooks/comprehensive.hooks.js';

// Import your models
import { Product } from '../../models/products.model.js';
import { Order } from '../../models/orders.model.js';
import { Notification } from '../../models/notifications.model.js';
import { Wallet } from '../../models/wallet.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { FAQ } from '../../models/frequentlyAskedQuestions.model.js';
import { Category } from '../../models/category.model.js';
import { Cart } from '../../models/cart.model.js';
import { Review } from '../../models/reviewsAndRatings.model.js';
import { User } from '../../models/user.model.js';

// ========================= PRODUCT RESOURCE =========================
export const productResource = {
  resource: Product,
  options: {
    parent: {
      name: 'E-commerce',
      icon: 'ShoppingCart'
    },
    navigation: {
      name: 'Products',
      icon: 'Package'
    },
    listProperties: [
      'productTitle',
      'productPrice', 
      'productDiscountedPrice',
      'productCategory',
      'productStock',
      'isActive',
      'createdAt'
    ],
    editProperties: [
      'productTitle',
      'productDescription',
      'productPrice',
      'productDiscountPercentage',
      'productDiscountedPrice',
      'productCategory',
      'productBrand',
      'productStock',
      'productImages',
      'productSpecifications',
      'isActive',
      'isFeatured'
    ],
    filterProperties: [
      'productCategory',
      'productBrand',
      'isActive',
      'isFeatured',
      'productPrice'
    ],
    actions: {
      new: {
        after: productHooks.after.new,
        before: productHooks.before.new
      },
      edit: {
        after: productHooks.after.edit,
        before: productHooks.before.edit
      },
      delete: {
        after: productHooks.after.delete
      }
    }
  }
};

// ========================= ORDER RESOURCE =========================
export const orderResource = {
  resource: Order,
  options: {
    parent: {
      name: 'E-commerce',
      icon: 'ShoppingCart'
    },
    navigation: {
      name: 'Orders',
      icon: 'ShoppingBag'
    },
    listProperties: [
      'orderId',
      'userId',
      'totalAmount',
      'orderStatus',
      'paymentStatus',
      'orderDate',
      'expectedDeliveryDate'
    ],
    editProperties: [
      'orderId',
      'userId',
      'orderItems',
      'totalAmount',
      'orderStatus',
      'paymentStatus',
      'paymentMethod',
      'shippingAddress',
      'orderDate',
      'expectedDeliveryDate',
      'trackingNumber'
    ],
    filterProperties: [
      'orderStatus',
      'paymentStatus',
      'paymentMethod',
      'orderDate'
    ],
    actions: {
      new: {
        after: orderHooks.after.new
      },
      edit: {
        after: orderHooks.after.edit
      },
      delete: {
        after: orderHooks.after.delete
      }
    }
  }
};

// ========================= NOTIFICATION RESOURCE =========================
export const notificationResource = {
  resource: Notification,
  options: {
    parent: {
      name: 'Communication',
      icon: 'MessageCircle'
    },
    navigation: {
      name: 'Notifications',
      icon: 'Bell'
    },
    listProperties: [
      'title',
      'message',
      'type',
      'userId',
      'isRead',
      'createdAt'
    ],
    editProperties: [
      'title',
      'message',
      'type',
      'userId',
      'data',
      'isRead',
      'expiresAt'
    ],
    filterProperties: [
      'type',
      'isRead',
      'userId',
      'createdAt'
    ],
    actions: {
      new: {
        after: notificationHooks.after.new
      },
      edit: {
        after: notificationHooks.after.edit
      },
      delete: {
        after: notificationHooks.after.delete
      }
    }
  }
};

// ========================= WALLET RESOURCE =========================
export const walletResource = {
  resource: Wallet,
  options: {
    parent: {
      name: 'Finance',
      icon: 'CreditCard'
    },
    navigation: {
      name: 'Wallets',
      icon: 'Wallet'
    },
    listProperties: [
      'userId',
      'balance',
      'currency',
      'isActive',
      'lastTransactionDate',
      'createdAt'
    ],
    editProperties: [
      'userId',
      'balance',
      'currency',
      'isActive',
      'dailyLimit',
      'monthlyLimit'
    ],
    filterProperties: [
      'isActive',
      'currency',
      'balance'
    ],
    actions: {
      new: {
        after: walletHooks.after.new
      },
      edit: {
        after: walletHooks.after.edit
      }
    }
  }
};

// ========================= TRANSACTION RESOURCE =========================
export const transactionResource = {
  resource: Transaction,
  options: {
    parent: {
      name: 'Finance',
      icon: 'CreditCard'
    },
    navigation: {
      name: 'Transactions',
      icon: 'DollarSign'
    },
    listProperties: [
      'transactionId',
      'userId',
      'amount',
      'type',
      'status',
      'paymentMethod',
      'createdAt'
    ],
    editProperties: [
      'transactionId',
      'userId',
      'amount',
      'type',
      'status',
      'description',
      'paymentMethod',
      'paymentGatewayResponse',
      'metadata'
    ],
    filterProperties: [
      'type',
      'status',
      'paymentMethod',
      'createdAt'
    ],
    actions: {
      new: {
        after: transactionHooks.after.new
      },
      edit: {
        after: transactionHooks.after.edit
      }
    }
  }
};

// ========================= FAQ RESOURCE =========================
export const faqResource = {
  resource: FAQ,
  options: {
    parent: {
      name: 'Content',
      icon: 'FileText'
    },
    navigation: {
      name: 'FAQs',
      icon: 'HelpCircle'
    },
    listProperties: [
      'question',
      'category',
      'isActive',
      'priority',
      'createdAt'
    ],
    editProperties: [
      'question',
      'answer',
      'category',
      'tags',
      'isActive',
      'priority',
      'language'
    ],
    filterProperties: [
      'category',
      'isActive',
      'priority',
      'language'
    ],
    actions: {
      new: {
        after: faqHooks.after.new
      },
      edit: {
        after: faqHooks.after.edit
      },
      delete: {
        after: faqHooks.after.delete
      }
    }
  }
};

// ========================= CATEGORY RESOURCE =========================
export const categoryResource = {
  resource: Category,
  options: {
    parent: {
      name: 'E-commerce',
      icon: 'ShoppingCart'
    },
    navigation: {
      name: 'Categories',
      icon: 'Folder'
    },
    listProperties: [
      'categoryName',
      'parentCategory',
      'isActive',
      'sortOrder',
      'createdAt'
    ],
    editProperties: [
      'categoryName',
      'categoryDescription',
      'parentCategory',
      'categoryImage',
      'isActive',
      'sortOrder',
      'metadata'
    ],
    filterProperties: [
      'isActive',
      'parentCategory'
    ],
    actions: {
      new: {
        after: categoryHooks.after.new
      },
      edit: {
        after: categoryHooks.after.edit
      },
      delete: {
        after: categoryHooks.after.delete
      }
    }
  }
};

// ========================= CART RESOURCE =========================
export const cartResource = {
  resource: Cart,
  options: {
    parent: {
      name: 'E-commerce',
      icon: 'ShoppingCart'
    },
    navigation: {
      name: 'Carts',
      icon: 'ShoppingCart'
    },
    listProperties: [
      'userId',
      'productId',
      'quantity',
      'addedAt',
      'isActive'
    ],
    editProperties: [
      'userId',
      'productId',
      'quantity',
      'isActive'
    ],
    filterProperties: [
      'userId',
      'isActive',
      'addedAt'
    ],
    actions: {
      new: {
        after: cartHooks.after.new
      },
      edit: {
        after: cartHooks.after.edit
      },
      delete: {
        after: cartHooks.after.delete
      }
    }
  }
};

// ========================= REVIEW RESOURCE =========================
export const reviewResource = {
  resource: Review,
  options: {
    parent: {
      name: 'Content',
      icon: 'FileText'
    },
    navigation: {
      name: 'Reviews',
      icon: 'Star'
    },
    listProperties: [
      'productId',
      'userId',
      'rating',
      'isVerified',
      'isApproved',
      'createdAt'
    ],
    editProperties: [
      'productId',
      'userId',
      'rating',
      'comment',
      'isVerified',
      'isApproved',
      'adminResponse'
    ],
    filterProperties: [
      'rating',
      'isVerified',
      'isApproved',
      'createdAt'
    ],
    actions: {
      new: {
        after: reviewHooks.after.new
      },
      edit: {
        after: reviewHooks.after.edit
      }
    }
  }
};

// ========================= USER RESOURCE =========================
export const userResource = {
  resource: User,
  options: {
    parent: {
      name: 'User Management',
      icon: 'Users'
    },
    navigation: {
      name: 'Users',
      icon: 'User'
    },
    listProperties: [
      'fullName',
      'email',
      'phoneNumber',
      'role',
      'isActive',
      'lastLoginAt',
      'createdAt'
    ],
    editProperties: [
      'fullName',
      'email',
      'phoneNumber',
      'role',
      'isActive',
      'isEmailVerified',
      'isPhoneVerified'
    ],
    filterProperties: [
      'role',
      'isActive',
      'isEmailVerified',
      'createdAt'
    ],
    actions: {
      new: {
        after: userHooks.after.new
      },
      edit: {
        after: userHooks.after.edit
      }
    }
  }
};

// ========================= EXPORT ALL RESOURCES =========================
export const comprehensiveResources = [
  productResource,
  orderResource,
  notificationResource,
  walletResource,
  transactionResource,
  faqResource,
  categoryResource,
  cartResource,
  reviewResource,
  userResource
];

export default comprehensiveResources;