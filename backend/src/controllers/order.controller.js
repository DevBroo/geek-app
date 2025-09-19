import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Order} from "../models/orders.model.js";
import { Product } from "../models/products.model.js";
import { Inventory } from "../models/inventory.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";



// --- Helper function to check and update stock ---
// This is used if an order changes status (e.g., cancelled)
const updateStock = asyncHandler ( async( req, res ) => {
    try {

        const productId = req.body;
        const product = await Product.findById(productId);

        const inventory = await Inventory.findOne({ product });
        if (!inventory) {
            console.warn(`Inventory not found for product ID: ${product}. Cannot update stock.`);
            return; // Or throw error, depending on desired strictness
        }
        inventory.stock += quantity; // Add stock back if quantity is positive, deduct if negative
        await inventory.save();

        return res
        .status(200)
        .json(new ApiResponse(200, true, "Stock updated successfully"));
        
    } catch (error) {
        console.log("Error while updating Stock: ", error);
        throw new ApiError(500, {}, "Error while updating Stock")
        
    }
})



// @desc    Get my order details (All Orders)
const getMyOrderDetails = asyncHandler( async( req, res) => {
    try {

        const order = await Order.find({ user: req.user._id }).populate('user', 'name email').populate('products.product');
        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, true, "Order details fetched successfully", order)
        )

    } catch (error) {
        console.log("Error while getting My Order Details: ", error);
        throw new ApiError(500, {}, "Error while getting My Order Details")
    }
})



const getSingleOrderDetails = asyncHandler( async( req, res ) => {

    try {
        const order = await Order.findById(req.params._id)
        .populate('products.product', 'productTitle productDescription productImage originalPrice discountedPrice category brand shippingAddress paymentMethod status createdAt updatedAt')
        .populate('user', 'name email');

        if (!order) {
            throw new ApiError(404, "Order not found");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, true, "Single Order details fetched successfully", order)
        );
    
    } catch (error) {
        console.log("Error while getting Single Order Details: ", error);
        throw new ApiError(500, {}, "Error while getting Single Order Details")
    }
});


// @desc    Get single order by id
const getOrderById = asyncHandler( async( req, res ) => {

	try {
        const order = await Order.findById(req.params.id).populate("user","name email").populate("cartItems.product");
        	if(!order){
        		throw new ApiError(404,"Order not found");
        	}
        	return res
            .status(200)
            .json( 
                new ApiResponse(200,true,"Order details fetched successfully",order )
        );

    } catch (error) {
        console.log("Error while getting Order By Id: ", error);
        throw new ApiError(500, {}, "Error while getting Order By Id")
    }
})




// ***** ======================== Admin Section ============================ ***** //


// @desc    Get all orders for admin
const getAllOrders = asyncHandler( async( req, res ) => {

    const user = await User.findById(req.user._id);
    if(user.role != 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}

	try {
        const orders = await Order.find({ user: req.user._id }).populate( "user", "name email" );
        
            if (!orders || orders.length === 0) {
                throw new ApiError(404, "No orders found");
            }
            
        	return res
            .status(200)
            .json(
                new ApiResponse(200, true, "All Orders fetched successfully", orders)
            );
    } catch (error) {
        console.log("Error while getting All Orders for admin: ", error);
        throw new ApiError(500, {}, "Error while getting All Orders for admin")
    }
})


// @desc    Update order to paid for admin ---- check if its needed or not 
const updateOrderToPaid = asyncHandler( async( req, res ) => {

    const user = await User.findById(req.user._id);

    if(!user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}
    try {
        const order = await Order.findById( req.params.id );
        if (!order) {
            throw new ApiError(404, "Order not found");
        }
        // Check if the order is already paid or has been shipped before allowing updates to the payment method and delivery date. This prevents accidental changes. If you want to allow these updates regardless of previous states, remove this check.
        if (order.paymentMethod !== null || order.deliveryDate !== null) {
            throw new ApiError(400, "Cannot update payment method and delivery date for an already paid or shipped order.");
        }
    
        // Update the payment method and delivery date with the provided values from the request body and save the changes. This ensures that only valid updates are made. If any required fields are missing, it will throw an error indicating which field(s) need to be provided. If everything is correct, the updated order object is returned as a response. If there's no order matching the ID, it throws an error indicating that the order was not found. If there's an internal server error during processing, it throws an error indicating that something went wrong on the server side. This approach helps maintain data integrity and provides clear feedback about what needs to be corrected when errors occur. 
    
        order.paymentMethod = req.body.paymentMethod;
        order.deliveryDate = req.body.deliveryDate;
        order.paymentStatus = "paid"; // Update status to 'paid'
        order.paidAt = Date.now(); // Set the payment timestamp
        await order.save();
        return res
        .status(200)
        .json(
            new ApiResponse(200, true, "Order updated successfully", order)
        );

    } catch (error) {
        console.log("Error while updating order for admin: ", error);
        throw new ApiError(500, {}, "Error while updating order for admin");
        
    }
})



const deleteOrder = asyncHandler( async( req, res ) => {

    const user = await User.findById(req.user._id);
    if(user.role != 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}

    try {
        const order = await Order.findByIdAndDelete(req.params.id);
    
        if (!order) {
            throw new ApiError(404, "Order not found and cannot be deleted.");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, true, "Order deleted successfully", order)
        );
    } catch (error) {
        console.log("Error while deleting order: ", error);
        throw new ApiError(500, {}, "Error while deleting order");
    }
})


/**
 * @desc    Update Order Status (Admin)
 * @route   PUT /api/v1/admin/order/:id
 * @access  Private (Admin)
 *
 * @body {
 * orderStatus: string // e.g., 'shipped', 'delivered', 'cancelled'
 * }
 */
const updateOrderStatus = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    if(user.role != 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}

    try {
        const order = await Order.findById(req.params.id);
    
        if (!order) {
            throw new ApiError(404, `Order not found with ID: ${req.params.id}`);
        }
    
        // Prevent updating a delivered or cancelled order
        if (order.orderStatus === 'delivered') {
            throw new ApiError(400, "You cannot change the status of a delivered order.");
        }
        if (order.orderStatus === 'cancelled') {
            throw new ApiError(400, "You cannot change the status of a cancelled order.");
        }
    
        // Validate incoming status
        const { orderStatus } = req.body;
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        if (!orderStatus || !validStatuses.includes(orderStatus)) {
            throw new ApiError(400, "Invalid order status provided. Valid statuses are: processing, shipped, delivered, cancelled.");
        }
    
        // --- Handle Inventory Adjustments based on Status Change ---
        // This is crucial to prevent overselling or keep stock accurate.
        if (orderStatus === 'cancelled' && order.paymentStatus === 'paid') {
            // If a paid order is cancelled, return items to stock.
            for (const item of order.products) {
                updateStock(item.product, item.quantity); // Increment stock
            }
            order.paymentStatus = 'refunded_needed'; // Mark for refund processing
            console.log(`Order ${order._id} cancelled. Stock returned. Payment marked for refund.`);
        }
    
        // If order is changed to 'delivered', set deliveredAt timestamp
        if (orderStatus === 'delivered' && !order.deliveredAt) {
            order.deliveredAt = Date.now();
        }
    
        order.orderStatus = orderStatus;
        await order.save();
    
        return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully."));
    } catch (error) {
        console.log(`Error while updating order status: `, error)
        throw new ApiError(500, {}, "Error while updating order status");
        
    }
});


/**
 * @desc    Admin Processes an Order Return
 * @route   PUT /api/v1/admin/order/:id/return
 * @access  Private (Admin)
 * @body    { "returnedReason": "reason for return" }
 */
const processOrderReturn = asyncHandler(async (req, res, next) => {
    const { returnedReason } = req.body;
    const orderId = req.params.id;

    // --- Input Validation ---
    if (!returnedReason || returnedReason.trim() === '') {
        throw new ApiError(400, "Please provide a reason for the return.");
    }

    // --- Fetch Order ---
    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, `Order not found with ID: ${orderId}`);
    }

    // --- Order Status Checks for Return Eligibility ---
    if (order.status !== 'delivered') {
        throw new ApiError(400, `Order status must be 'delivered' to initiate a return. Current status: ${order.status}.`);
    }
    if (order.isReturned || order.status === 'returned') {
        throw new ApiError(400, `Order with ID: ${orderId} has already been returned.`);
    }
    if (order.cancelled || order.status === 'cancelled') {
        throw new ApiError(400, `Order with ID: ${orderId} has been cancelled and cannot be returned.`);
    }

    // --- Initiate a Database Transaction for Atomicity ---
    // This is crucial for multi-step operations like returns (updating order, updating inventory, handling refund)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- Update Order Status and Return Details ---
        order.status = 'returned'; // Set primary order status to 'returned'
        order.isReturned = true; // Set the boolean flag
        order.returnedAt = Date.now(); // Set the return timestamp
        order.returnedReason = returnedReason.trim(); // Store the reason

        // --- Update Payment Status to Initiate Refund ---
        // You might have a separate service or an webhook to actually process the refund
        // from your payment gateway (e.g., Paytm, Razorpay).
        // This status indicates that a refund is now pending.
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refund_initiated';
        } else {
            // Handle cases where payment was pending or failed, but was delivered
            // (e.g., COD order that needs to be refunded manually or marked not paid)
            console.warn(`Order ${orderId} is being returned but payment status is ${order.paymentStatus}. Manual refund might be required.`);
        }

        await order.save({ session }); // Save order within the transaction

        // --- Adjust Inventory ---
        for (const item of order.products) {
            // Add the quantity of each product back to stock
            await updateStock(item.product, item.quantity);
        }

        await session.commitTransaction(); // Commit all changes if successful
        session.endSession(); // End the session

        // --- Response ---
        res.status(200).json(
            new ApiResponse(200, order, `Order ID: ${orderId} has been successfully marked as returned. Refund initiated.`
            )
        );

    } catch (error) {
        await session.abortTransaction(); // Rollback all changes if any error occurred
        session.endSession(); // End the session

        console.error("Error during order return transaction:", error);
        // Re-throw the error to be caught by the global error handler (asyncHandler)
        throw new ApiError(500, "Failed to process order return due to an internal server error. Please try again.");
    }
});



export  {
	
    getMyOrderDetails,
	getSingleOrderDetails,
	getOrderById,
	getAllOrders,
	updateOrderToPaid,
	deleteOrder,
	updateOrderStatus,
    processOrderReturn

}