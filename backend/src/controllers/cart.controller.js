import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Cart} from "../models/cart.model.js"
import {Product} from "../models/products.model.js";
import {Inventory} from "../models/inventory.model.js";
import {User} from "../models/user.model.js";

// @desc Add product to cart
// @route POST /api/cart/addToCart
// @access Private
// @returns Updated cart with added product or updated quantity
// @body { 
// productId: String, 
// quantity: Number 
// }
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1

    // --- 1. Validate Input ---
    if (!productId || typeof productId !== 'string') {
        throw new ApiError(400, "Valid product ID must be provided.");
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new ApiError(400, "Quantity must be a positive number.");
    }

    // --- 2. Authenticate and Authorize User ---
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User not authenticated or user does not exist.");
    }
    if (!user.isVerified) {
        throw new ApiError(403, "User account is not verified.");
    }

    // --- 3. Validate Product Existence and Availability ---
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, `Product with ID ${productId} not found.`);
    }
    if (!product.isAvailable) {
        throw new ApiError(404, `Product "${product.name}" is not available for purchase.`);
    }

    // --- 4. Check Inventory Stock ---
    // In a real system, you might have product.stock directly or a separate Inventory model.
    // Assuming you have an Inventory model linked by productId
    const inventory = await Inventory.findOne({ productId: productId });

    if (!inventory || inventory.quantity < quantity) { // Check actual stock against requested quantity
        throw new ApiError(409, `Not enough stock for "${product.name}". Available: ${inventory ? inventory.stock : 0}. Requested: ${quantity}.`);
    }

    // --- 5. Find or Create User's Cart ---
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        // If no cart exists, create a new one
        cart = await Cart.create({
            user: req.user._id,
            products: [], // Initialize empty, then push below
        });
        if (!cart) {
            throw new ApiError(500, "Failed to create a new cart for the user.");
        }
    }

    // --- 6. Update Cart Item and Inventory Atomically ---
    const productInCartIndex = cart.products.findIndex(item => item.product.toString() === productId.toString());

    if (productInCartIndex > -1) {
        // Product already in cart, update its quantity
        const currentQuantityInCart = cart.products[productInCartIndex].quantity;
        const newTotalQuantity = currentQuantityInCart + quantity;

        // Ensure new total quantity does not exceed available stock
        if (newTotalQuantity > inventory.stock) {
            throw new ApiError(409, `Cannot add more "${product.name}". Max allowed in cart: ${inventory.stock}. Currently in cart: ${currentQuantityInCart}.`);
        }

        // Update quantity in cart and decrement inventory in a single atomic operation
        // This is more robust against race conditions than fetch-modify-save
        await Cart.findOneAndUpdate(
            { user: req.user._id, 'products.product': productId },
            { $inc: { 'products.$.quantity': quantity } }, // $ operator updates the matched element
            { new: true, runValidators: true, useFindAndModify: false } // Return updated document
        );

        // Decrement inventory stock
        await Inventory.findOneAndUpdate(
            { productId: productId },
            { $inc: { stock: -quantity } },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        // Fetch the updated cart to send in response (optional, can just send a message)
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('products.product');

        return res
        .status(200)
        .json(new ApiResponse(200, updatedCart, `Quantity of "${product.name}" updated in cart.`));

    } else {
        // Product not in cart, add it
        // Ensure initial quantity does not exceed available stock
        if (quantity > inventory.stock) {
             throw new ApiError(409, `Cannot add "${product.name}". Available stock: ${inventory.stock}. Requested: ${quantity}.`);
        }

        // Add new product to cart and decrement inventory in a single atomic operation
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $push: { products: { product: productId, quantity: quantity, priceAtAddition: product.price } } }, // Store price at addition
            { new: true, runValidators: true, useFindAndModify: false }
        );

        // Decrement inventory stock
        await Inventory.findOneAndUpdate(
            { productId: productId },
            { $inc: { stock: -quantity } },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        // Fetch the updated cart to send in response
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('products.product');

        return res
        .status(201)
        .json(new ApiResponse(201, updatedCart, `"${product.name}" added to cart.`));
    }
});


// @desc Get cart items
// @route GET /api/cart/getCartItems
// @access Private
// @returns Cart items with product details
const getCartItems = asyncHandler(async(req,res) => {
    const cartItem = await Cart.findOne({user:req.user._id})
    .populate("products.product");

    if(!cartItem){
        throw new ApiError(401,"User has no cart");
    }

    return res
    .status(200)
    .json(ApiResponse(200, cartItem, "Cart items fetched successfully"));
});

// @desc Remove product from cart
// @route DELETE /api/cart/removeFromCart
//  @body {
//  * productId: string,
//  * quantityToRemove?: number // Optional, if not provided, removes all of that product
//  * }
const removeFromCart = asyncHandler( async( req, res ) => {

    const { productId, quantityToRemove } = req.body; // quantityToRemove is optional

    // --- 1. Validate Input ---
    if (!productId || typeof productId !== 'string') {
        throw new ApiError(400, "Valid product ID must be provided.");
    }
    // Validate quantityToRemove if provided
    if (quantityToRemove !== undefined && (typeof quantityToRemove !== 'number' || quantityToRemove <= 0)) {
        throw new ApiError(400, "Quantity to remove must be a positive number.");
    }

    // --- 2. Authenticate User ---
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User not authenticated or user does not exist.");
    }

    // --- 3. Find User's Cart ---
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found for this user.");
    }

    // --- 4. Check if Product Exists in Cart ---
    const productInCartIndex = cart.products.findIndex(item => item.product.toString() === productId.toString());

    if (productInCartIndex === -1) {
        throw new ApiError(404, "Product not found in cart.");
    }

    const productInCart = cart.products[productInCartIndex];
    const currentQuantity = productInCart.quantity;
    let finalQuantityToRemove = quantityToRemove || currentQuantity; // If not specified, remove all

    // Ensure quantityToRemove doesn't exceed current quantity in cart
    if (finalQuantityToRemove > currentQuantity) {
        finalQuantityToRemove = currentQuantity; // Adjust to current quantity if too high
    }

    // --- 5. Update Cart and Inventory ---
    let message = '';
    let updatedCart;

    if (currentQuantity - finalQuantityToRemove <= 0) {
        // --- Remove the entire product item if quantity becomes zero or less ---
        updatedCart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { products: { product: productId } } }, // Remove the entire product sub-document
            { new: true, runValidators: true, useFindAndModify: false }
        );
        message = `"${productInCart.product.name}" removed from cart.`;

    } else {
        // --- Decrement quantity of the product in cart ---
        updatedCart = await Cart.findOneAndUpdate(
            { user: req.user._id, 'products.product': productId },
            { $inc: { 'products.$.quantity': -finalQuantityToRemove } }, // Decrement quantity
            { new: true, runValidators: true, useFindAndModify: false }
        );
        message = `Quantity of "${productInCart.product.name}" updated in cart.`;
    }

    // --- Update Inventory (increment stock back) ---
    await Inventory.findOneAndUpdate(
        { productId: productId },
        { $inc: { stock: finalQuantityToRemove } }, // Increment stock by the amount removed from cart
        { new: true, runValidators: true, useFindAndModify: false }
    );

    // After updating the cart, repopulate if necessary for the response
    const finalCartResponse = await Cart.findOne({ user: req.user._id }).populate('products.product');

    // --- 6. Handle Empty Cart Scenario (Optional) ---
    // If the cart becomes completely empty, you might want to delete the cart document itself.
    if (finalCartResponse && finalCartResponse.products.length === 0) {
        await Cart.deleteOne({ _id: finalCartResponse._id });
        // Set finalCartResponse to null or an empty object if you want to reflect deletion
        message = "All items removed from cart. Cart is now empty.";
        return res
        .status(200)
        .json(new ApiResponse(200, null, message)); // Or an empty cart object
    }

    // --- 7. Send Success Response ---
    return res
    .status(200)
    .json(new ApiResponse(200, finalCartResponse, `${message} Cart updated successfully.`));
});


// @desc Update quantity of a product in the cart
// @route PUT /api/cart/updateCartItemQuantity
// @access Private
// @body {
// productId: String,
// newQuantity: Number // New quantity to set for the product
// }
// @returns Updated cart with new quantity for the product
const updateCartItemQuantity = asyncHandler( async( req, res ) => {
    const { productId, newQuantity } = req.body;

    // --- 1. Validate Input ---
    if (!productId || typeof productId !== 'string') {
        throw new ApiError(400, "Valid product ID must be provided.");
    }
    if (typeof newQuantity !== 'number' || newQuantity <= 0) {
        throw new ApiError(400, "New quantity must be a positive number.");
    }

    // --- 2. Authenticate User ---
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User not authenticated or user does not exist.");
    }

    // --- 3. Find User's Cart ---
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found for this user.");
    }

    // --- 4. Check if Product Exists in Cart ---
    const productInCartIndex = cart.products.findIndex(item => item.product.toString() === productId.toString());

    if (productInCartIndex === -1) {
        throw new ApiError(404, "Product not found in cart.");
    }

    const productInCart = cart.products[productInCartIndex];
    
    // --- 5. Validate Inventory Stock ---
    const inventory = await Inventory.findOne({ productId: productId });
    
    if (!inventory || inventory.quantity < newQuantity) {
        throw new ApiError(409, `Not enough stock for "${productInCart.product.name}". Available: ${inventory ? inventory.quantity : 0}. Requested: ${newQuantity}.`);
    }

    // --- 6. Update Cart Item Quantity and Inventory Atomically ---
    await Cart.findOneAndUpdate(
        { user: req.user._id, 'products.product': productId },
        { $set: { 'products.$.quantity': newQuantity } }, // $ operator updates the matched element
        { new: true, runValidators: true, useFindAndModify: false }
    );

    // Update inventory stock
    await Inventory.findOneAndUpdate( 
        { productId: productId },
        { $inc: { quantity: -newQuantity + productInCart.quantity } }, // Adjust stock based on the change in quantity
        { new: true, runValidators: true, useFindAndModify: false }
    );

    // Fetch the updated cart to send in response
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('products.product');
    if (!updatedCart) {
        throw new ApiError(500, "Failed to update cart.");
    }

    // --- 7. Send Success Response ---
    return res
    .status(200)
    .json(new ApiResponse(200, updatedCart, `Quantity of "${productInCart.product.name}" updated in cart.`));

})

// @desc Delete a specific item from the cart
// @route DELETE /api/cart/deleteItemFromCart
// @access Private
// @body {
// productId: String // ID of the product to remove from the cart
// }
// @returns Updated cart after deletion of the item
const deleteItemFromCart = asyncHandler(async(req,res) => {
    const {productId} = req.body;

    if(!productId){
        throw new ApiError(400, "Product ID is required");
    }

    const cart = await Cart.findOne({user: req.user.id});

    if(!cart){
        throw new ApiError(404, "Cart not found");
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === productId.toString());

    if(productIndex === -1){
        throw new ApiError(404, "Product not found in cart");
    }

    cart.products.splice(productIndex, 1);

    await cart.save();

    return res
    .status(200)
    .json(ApiResponse(200, cart, "Product removed from cart"));
})

// @desc Clear entire cart
// @route DELETE /api/cart/clearCart
// @access Private
const clearCart = asyncHandler(async(req,res) => {

    const cart = await Cart.deleteOne({user: req.user.id});
    if(!cart){
        throw new ApiError(500, "Failed to delete entire cart")
    }
    return res
    .status(200)
    .json(ApiResponse(200, {}, "Cart cleared"));
})   



export {
    addToCart,
    getCartItems,
    removeFromCart,
    deleteItemFromCart,
    updateCartItemQuantity,
    clearCart
};