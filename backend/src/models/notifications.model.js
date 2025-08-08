import mongoose, { Schema, Document } from 'mongoose';


const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
    }
}, 
    {
    timestamps: true
    }
);


export const Notification = mongoose.model('Notification', notificationSchema);