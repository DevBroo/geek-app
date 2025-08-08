import mongoose, { Schema } from "mongoose";


const cartSchema = new Schema({
	products: [
		{
			product: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			quantity: { 
                type: Number, 
                required: true
            },
			priceAtAddition: {
				type: Number,
				required: true,
				default: 0,
				min: 0,
				validate: {
					validator: function(value) {
						return value >= 0;
					},
					message: 'Price at addition must be a non-negative number.'
				}
			}
		}
	],
	user:
	{
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
},
{
    timestamps:true
});

export const Cart = mongoose.model('Cart', cartSchema);