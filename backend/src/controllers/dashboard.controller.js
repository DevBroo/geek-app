// backend/src/controllers/dashboardController.js

import {Order} from'../models/orders.model.js';
import {User} from'../models/user.model.js';
import {Product} from '../models/products.model.js';
import {Transaction} from '../models/transaction.model.js'; // Your unified Transaction model
import {frequentlyAskedQuestions} from '../models/frequentlyAskedQuestions.model.js'; // Your FAQ model

import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from'../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';

/**
 * @desc    Get Dashboard Statistics for AdminJS
 * @route   GET /api/v1/admin/dashboard/stats
 * @access  Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res, next) => {
    // --- 1. Summary Statistics ---
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();


    const paidOrdersRevenue = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = paidOrdersRevenue.length > 0 ? paidOrdersRevenue[0].total : 0;

    const totalWalletBalance = await Wallet.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const overallWalletBalance = totalWalletBalance.length > 0 ? totalWalletBalance[0].total : 0;

    const unansweredFAQs = await frequentlyAskedQuestions.countDocuments({ isAnswered: false });


    // --- 2. Order Status Distribution ---
    const orderStatusDistribution = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // --- 3. Payment Method Distribution (for paid orders) ---
    const paymentMethodDistribution = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
        { $project: { method: '$_id', count: 1, _id: 0 } }
    ]);

    // --- 4. Monthly Revenue Trend (Last 6 Months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // Start from the 1st of the month

    const monthlyRevenue = await Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                totalRevenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                _id: 0,
                month: '$_id.month',
                year: '$_id.year',
                totalRevenue: 1
            }
        }
    ]);

    // Format monthly revenue data for Recharts (e.g., "Jan 2023")
    const formattedMonthlyRevenue = monthlyRevenue.map(data => {
        const date = new Date(data.year, data.month - 1); // Month is 0-indexed in JS Date
        return {
            name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            revenue: data.totalRevenue
        };
    });

    // --- 5. Recent Transactions (e.g., last 10) ---
    const recentTransactions = await Transaction.find()
        .populate('user', 'name email') // Populate user details
        .populate('orderRef', '_id totalAmount status') // Populate order details if applicable
        .sort({ createdAt: -1 })
        .limit(10);

    return res
    .status(200)
    .json(
        new ApiResponse(
        200, {
        summary: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue.toFixed(2),
            overallWalletBalance: overallWalletBalance.toFixed(2),
            unansweredFAQs
        },
        orderStatusDistribution,
        paymentMethodDistribution,
        monthlyRevenue: formattedMonthlyRevenue,
        recentTransactions
    }, "Dashboard stats fetched successfully."));
});

export { getDashboardStats };