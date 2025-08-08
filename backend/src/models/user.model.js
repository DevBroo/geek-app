import mongoose, { Schema, Document } from 'mongoose';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new Schema(
    {
    username: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        unique: true,
        minlength: 8 
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    orgName: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: ''
    }, 
    refreshToken: {
        type: String
    },
    resetPasswordToken: {
        type: String,
        default: ''
    },
    contactNumber: {
        type: String,
        default: '',
        maxlength: 10,
        minlength: 10,
        trim: true,
        required: true
    },
    shopAddress: [
        {
            type: Schema.Types.ObjectId,
            ref: 'address',
            required: true,
            default: [],
            unique: true,
            validate: {
                validator: function(v) {
                    return v.length > 0;
                },
                message: 'At least one address is required.'
            }
        }
    ],
    GSTNumber: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    urdId: {
        type: String,
        default: '',
        trim: true
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }
    ],
    documents: [
        {
            aadhar: {
                type: String,
                default: ''
            },
        }
    ]

    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {  
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.isPasswordMatched = async function(password)  {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { 
            _id: this._id, 
            role: this.role,
            username: this.username,
            email: this.email,
            orgName: this.orgName
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "12h"
        }
    );
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { 
            id: this._id, 
            role: this.role 
        }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
        } 
    );  
};

export const User = mongoose.model("User", userSchema);

