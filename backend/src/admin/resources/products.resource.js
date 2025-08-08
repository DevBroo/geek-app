import { Product } from "../../models/products.model.js"
import { productHooks } from "../hooks/product.hooks.js";

const productResource = {
    resource: Product,
                options: {
                    // Add hooks for auto-calculations and validations
                    hooks: productHooks,
                    
                    properties: {
                        productDescription: { type: 'textarea' }, // Make description a textarea
                        productImage: {
                            type: 'mixed',
                            description: 'Product images (array of objects with public_id and url)'
                        },
                        discountPercentage: {
                            description: 'Regular discount percentage (0-100%) applied to the product.',
                            min: 0,
                            max: 100,
                        },
                        bulkThreshold: {
                            description: 'Minimum quantity required for the additional bulk discount to apply (set 0 if no specific bulk tier).',
                            min: 0,
                        },
                        additionalBulkDiscountPercentage: {
                            description: 'Extra discount percentage (0-100%) applied *on top of* the regular discount if bulk threshold is met.',
                            min: 0,
                            max: 100,
                        },
                        // Add computed fields
                        finalPrice: {
                            type: 'number',
                            description: 'Final price after discount (auto-calculated)',
                            isVisible: { list: true, show: true, edit: false, filter: false }
                        },
                        user: {
                            reference: 'User',
                            description: 'Product creator'
                        },
                        category: {
                            reference: 'Category',
                            description: 'Product category'
                        }
                    },
                    listProperties: [
                        '_id', 'productTitle', 'productDescription', 'originalPrice', 'quantity', 'category', 'discountPercentage',
                        'bulkThreshold', 'additionalBulkDiscountPercentage', 'createdAt', 'isAvailable'
                    ],
                    showProperties: [
                        '_id', 'productTitle', 'productDescription', 'originalPrice', 'quantity', 'category', 'productImage',
                        'discountPercentage', 'bulkThreshold', 'additionalBulkDiscountPercentage',
                        'brand', 'warranty', 'isAvailable', 'review', 'user', 'createdAt', 'updatedAt'
                    ],
                    editProperties: [
                        'productTitle', 'productDescription', 'originalPrice', 'quantity', 'category', 'productImage',
                        'discountPercentage', 'bulkThreshold', 'additionalBulkDiscountPercentage', 'isAvailable'
                        // 'ratings', 'numOfReviews', 'reviews' are usually updated programmatically
                        // 'user' (creator) might be hidden or set automatically
                    ],
                    filterProperties: [
                        'productTitle', 'originalPrice', 'quantity', 'category', 'discountPercentage',
                        'bulkThreshold', 'createdAt'
                    ],
                },
}

export { productResource }