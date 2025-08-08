import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notifications.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const createNotification = asyncHandler(async (req, res) => {

    if (!req.user.isAdmin)
        throw new ApiError("You are not authorized to perform this action", 403);

    if (!req.body.type)
        req.body.type = "general";
    if (req.body.type && typeof req.body.type !== "string")
        throw new ApiError("Type must be a string", 400);

    else if (!["general", "user"].includes(req.body.type))
        throw new ApiError("Invalid type", 400);

    if (!req.body.recipients && req.body.type !== "general")
        throw new ApiError("Please provide recipients", 400);

    if (req.body.recipients && typeof req.body.recipients === "string")
        req.body.recipients = [req.body.recipients];

    if (req.body.recipients && Array.isArray(req.body.recipients)) {
        for (let i in req.body.recipients) {
            const user = await User.findById(req.body.recipients[i]);
            if (!user)
                throw new ApiError(`User with id ${req.body.recipients[i]} does not exist`, 404);
        }
    }
    
    if (req.body.recipients && req.body.recipients.includes(req.user._id.toString()))
        throw new ApiError("Cannot send notification to yourself", 400);
    
    if (req.body.recipients && req.body.recipients.length < 1)
        throw new ApiError("Please provide at least one recipient", 400);
    if (req.body.recipients && req.body.recipients.length > 50)
        throw new ApiError("Maximum number of recipients is 50", 400);  
    if (req.body.recipients && req.body.recipients.length > 50)
        throw new ApiError("Maximum number of recipients is 50", 400);

    if (!req.body.title || !req.body.message)
        throw new ApiError("Please provide all fields", 400);

    let notification = await Notification.create(req.body);

    if (!notification)
        throw new ApiError("Something went wrong while creating the notification", 500);

    // Send notification to users in recipients array if it's a general notification or to specific users if it's a user notification and they have push notifications enabled and their device token is provided in their profile and they haven't disabled push notifications in their settings and they're online and they've accepted the notification request  if it's a user notification

    

    return res
    .status(201)
    .json(new ApiResponse(200, notification, "Notification created successfully"));
});

const getNotifications = asyncHandler(async (req, res) => {
    let notifications = await Notification.find({}).sort("-createdAt");
    if (!notifications.length)
        throw new ApiError("No Notifications Found", 404);
    return res.json(new ApiResponse(notifications));
});

const getNotificationById = asyncHandler(async (req, res) => {
    let notification = await Notification.findById(req.params.id);
    if (!notification)
        throw new ApiError("Notification Not Found", 404);

    return res
    .status(200)
    .json(new ApiResponse(notification));
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    let notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
    );
    if (!notification)
        throw new ApiError("Notification Not Found", 404);
}
);

const sendPushNotification = asyncHandler(async (req, res) => {

    const { userId, message } = await User.findById(User);
    const user = await User.findById(userId);
    if (!userId)
        throw new ApiError("User Not Found", 404);
    if (!message)
        throw new ApiError("Message Not Provided", 400);

    user.updateMany({ 
        $or: [
            {deviceToken: null},
            {deviceToken: ""},
        ],
        pushEnabled: true,
        onlineStatus: true,
        acceptNotificationRequest: true
    }, {$set: {pushEnabled: false}}).then(() => {
        console.log("All users updated");
    }).catch((err) => {
        console.log(err);
    });
})


export {createNotification, getNotifications, getNotificationById, markNotificationAsRead, sendPushNotification};