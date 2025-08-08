import { Inventory } from "../../models/inventory.model.js"

const inventoryResource = {
    resource: Inventory,
                options: {
                    properties: {
                        productId: { isVisible: true }, // Will link to Product if Product resource is registered
                        quantity: { type: 'number', min: 0 },
                        categoryId: { isVisible: true }, // Will link to Category if Category resource is registered
                        warehouseLocation: { type: 'string' },
                        isAvailable: { type: 'boolean' 
                    },
                    listProperties: ['_id', 'productId', 'stock', 'isAvailable'],
                    showProperties: ['_id', 'productId', 'stock', 'isAvailable', 'createdAt', 'updatedAt'],
                    editProperties: ['stock', 'isAvailable'], // Allow admin to manually adjust stock
                    filterProperties: ['productId', 'stock', 'isAvailable'],
                }
                },
}

export {inventoryResource}