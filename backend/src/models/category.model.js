import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const attributesSchema = new Schema({

    attributeName:{
        type: String,
        required: true,
    },
    attributeKey:{
        type: String,
        required: true,
        trim: true
    },
    attributeValue:{
        type: String,
        required: true,
        trim: true
    },
    validation: {
        type: String,
        enum:['required','optional'],
        default:'optional',
        required: true,
    },
    attributeStatus: {
        type: Boolean,
        default: false,
    },
    attributeDescription: {
        type: String,
        trim: true,
        default: '',
    },
}, { timestamps: true }
);

attributesSchema.plugin(mongooseAggregatePaginate);

export const Attributes = mongoose.model('Attributes', attributesSchema);


const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    categoryDescription: {
        type: String,
        trim: true,
        defualt: '',
    },
    categoryImage: {
        type: String,
        trim: true,
        required: true,
    },
    categoryStatus: {
        type: Boolean,
        default: false,
    },
    attributes:[{
        type: Schema.Types.ObjectId,
        ref: 'Attributes'
    }],
    },
    
    {
        timestamps: true,
    }   
);

export const Category = mongoose.model('Category', categorySchema);