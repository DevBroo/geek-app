import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture?: string;
    orgName: string;
    isVerified: boolean;
    verificationToken: string;
    refreshToken: string;
    resetPasswordToken: string;
    shopAdress: string;
    contactNumber: number;
    GSTNumber?: string;
    urdId?: string;
}

export interface IAddress extends Document {
    userId: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    addressType: 'Shipping' | 'Billing' | 'Both';
    pinCode: number;
    landmark?:string;
    isBoth?:boolean;
}

export interface INotification extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    message: string;
    read: boolean;
    type?: 'info' | 'warning' | 'error';
}

export interface IOrder extends Document {
    userId: string;
    products: { productId: string; quantity: number }[];
    totalAmount: number;
    address: string[];
    status: string;
    paymentMethod: string;
    paymentStatus: boolean;
}

export interface IProduct  {
    productTitle: string;
    productDescription: string;
    originalPrice: number;
    discountedPrice: number;
    quantity: number;
    isAvailable: boolean;
    productImage?: string;
    category: string; // ObjectId
    brand?: string;
    warranty?: string;
};