import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Inventory} from "../models/inventory.model.js";
import { Product } from "../models/products.model.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";

/** * @desc Create a new inventory item
 * @route POST /api/inventory
 * @access Private (Admin)
 */
const createInventoryItem = asyncHandler(async (req, res) => {
    try {
        // Validate user (admin) existence
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admins only.');
        }

        const { productId, categoryId, quantity, isAvailable, warehouseLocation } = req.body;
    
        // Validate product and category existence
        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
    
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        // Validate quantity
        if (quantity < 0) {
            throw new ApiError(400, 'Quantity cannot be negative');
        }
        // Validate warehouse location
        if (!warehouseLocation || typeof warehouseLocation !== 'string' || warehouseLocation.trim() === '') {
            throw new ApiError(400, 'Warehouse location is required and must be a valid string');
        }
        
        // Check if inventory item already exists for the product and category
        const existingInventoryItem = await Inventory.findOne({ productId, categoryId });
        if (existingInventoryItem) {
            throw new ApiError(409, 'Inventory item already exists for this product and category');
        }
    
        // Create inventory item
        const inventoryItem = await Inventory.create({
            productId,
            categoryId,
            quantity,
            isAvailable,
            warehouseLocation
        });
    
        return res
        .status(201)
        .json(new ApiResponse('Inventory item created successfully', inventoryItem));
    
    } catch (error) {
        console.error('Error creating inventory item:', error);
        throw new ApiError(500, inventoryItem,'Internal server error while creating inventory item');
        
    }
});


/** * @desc Get all inventory items
 * @route GET /api/inventory
 * @access Private (Admin)
 */
export const getAllInventoryItems = asyncHandler(async (req, res) => {
    try {
        const inventoryItems = await Inventory.find()
            .populate('productId', 'name price')
            .populate('categoryId', 'name');
    
        return res
            .status(200)
            .json(new ApiResponse('Inventory items retrieved successfully', inventoryItems));
    
    } catch (error) {
        console.error('Error retrieving inventory items:', error);
        throw new ApiError(500, 'Internal server error while retrieving inventory items');
    }
});

/** * @desc Get an inventory item by ID
 * @route GET /api/inventory/:id
 * @access Public
 */
const getInventoryItemById = asyncHandler(async (req, res) => {
    try {   
        const { id } = req.params;
        // Find the inventory item by ID
        const inventoryItem = await Inventory.findById(id)
            .populate('productId', 'name price')
            .populate('categoryId', 'name');
        if (!inventoryItem) {
            throw new ApiError(404, 'Inventory item not found');
        }
        return res
            .status(200)
            .json(new ApiResponse('Inventory item retrieved successfully', inventoryItem));
    } catch (error) {
        console.error('Error retrieving inventory item:', error);
        throw new ApiError(500, 'Internal server error while retrieving inventory item');
    }
}); 


/** * @desc Delete an inventory item
 * @route DELETE /api/inventory/:id
 * @access Private (Admin)
 */
const deleteInventoryItem = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user (admin) existence
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admins only.');
        }

        // Find and delete the inventory item
        const inventoryItem = await Inventory.findByIdAndDelete(id);
        if (!inventoryItem) {
            throw new ApiError(404, 'Inventory item not found');
        }

        return res
            .status(200)
            .json(new ApiResponse('Inventory item deleted successfully', inventoryItem));

    } catch (error) {
        console.error('Error deleting inventory item:', error);
        throw new ApiError(500, 'Internal server error while deleting inventory item'); 
    }
});


/** * @desc Update an inventory item
 * @route PUT /api/inventory/:id
 * @access Private (Admin)
 */
const updateInventoryItem = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, isAvailable, warehouseLocation } = req.body;

        // Validate user (admin) existence
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admins only.');
        }
        // Validate quantity
        if (quantity < 0) {
            throw new ApiError(400, 'Quantity cannot be negative');
        }
        // Validate warehouse location
        if (!warehouseLocation || typeof warehouseLocation !== 'string' || warehouseLocation.trim() === '') {
            throw new ApiError(400, 'Warehouse location is required and must be a valid string');
        }
        // Find and update the inventory item
        const inventoryItem = await Inventory.findByIdAndUpdate(id, {
            quantity,
            isAvailable,
            warehouseLocation
        }, { new: true });
        if (!inventoryItem) {
            throw new ApiError(404, 'Inventory item not found');
        }
        return res
            .status(200)
            .json(new ApiResponse('Inventory item updated successfully', inventoryItem));
            
        }
        catch (error) {
            console.error('Error updating inventory item:', error);
            throw new ApiError(500, 'Internal server error while updating inventory item');
        }
});


export {
    createInventoryItem,
    getAllInventoryItems,
    getInventoryItemById,
    deleteInventoryItem,
    updateInventoryItem

}