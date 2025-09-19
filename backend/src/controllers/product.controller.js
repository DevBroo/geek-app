import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Product} from "../models/products.model.js"
import { cloudinary, uploadImageCloudinary } from "../utils/cloudinary.service.js"

//@desc   get all products
const getAllProducts = asyncHandler(async ( req,res ) => {

	const { keyword, category } = req.query;
	
	try {
		const products = await Product.find({
			$or:[{
				name: { 
					$regex : keyword || "" , 
					$options:"i" 
				}},
				{ category:
					{ $regex :category || "" ,
						$options:"i"
					}}]
			})
			.populate({ path:'reviews',select:['rating','comment'] }).populate('category')

		if( !products ){
			throw new ApiError(404, "No Products Found");
		}

		return res
	    .status(200)
	    .json(new ApiResponse(200, true, 'Products fetched Successfully', products));

	} catch (error) {
		console.log("Error while fetching products: ", error)
		throw new ApiError(500, "Error while fetching products");
	}
})

//@desc   get top rated products >> rating >= 4.0
const getTopProducts = asyncHandler(async ( req, res ) => {

	try {
		const topProducts = await Product.find({ reviews:{ $gte: 4 } }).sort({ rating: -1 }).limit(3);
	
		if(!topProducts){
			throw new ApiError(404,'no top products found')
		}
	
		return res
		.status(200)
		.json( 
			new ApiResponse(200, true, 'Top Products Fetched Successfully', topProducts)
		)

	} catch (error) {
		console.log("Error while fetching top Products: ", error)
		throw new ApiError(500, "Error while fetching top Products");
	}
});

//@desc   get a single product by id
const getProductById = asyncHandler( async( req, res ) => {

	const productId = await Product.findById(req.params.id);

	if(!productId){
		throw new ApiError(404,'product not found')
	}

	return res
	.status(200)
	.json(new ApiResponse(200,true,'Product fetched successfully',productId))
})


//@desc   create a new product
const createProduct = asyncHandler( async( req,res ) => {

	if(!req.user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}

	try {
		const { productTitle, productDescription, originalPrice, discountedPrice, quantity, productImage: base64Images, category, warranty, brand } = req.body;

		if ( !productTitle || !productDescription || !originalPrice || !discountedPrice || !quantity || !productImage || !category || !warranty || !brand ) {
			throw new ApiError(400, "Please fill all the fields");
		}

		if( !req.file ) throw new ApiError(500, "Please provide product image");

		if(originalPrice < discountedPrice){
			throw new ApiError(400,"Original price should be greater than discounted price")
		}

		if( discountedPrice <= 0 ){
			throw new ApiError(400,"Discounted Price must be greater than zero")
		}
		if( originalPrice <= 0 ){
			throw new ApiError(400,"Original Price must be greater than zero")
		}
		if( !brand.trim() || !brand.trim().length > 0 ){
			throw new ApiError(400,"Brand name cannot be empty")
		}
		if( !category.trim() || !category.trim().length > 0 ){
			throw new ApiError(400,"Category name cannot be empty")
		}
		if( !productTitle.trim() || !productTitle.trim().length > 0 ){
			throw new ApiError(400,"Product title cannot be empty")
		}
		if(productDescription.trim().length == 0){
			throw new ApiError(400,"Product description cannot be empty")
		}
		if(!quantity){
			throw new ApiError(400,"Quantity is required")
		}
		if(quantity <= 0){
			throw new ApiError(400,"Quantity must be greater than zero")
		}
		if(warranty <= 0){
			throw new ApiError(400,"Warranty must be greater than zero")
		}

		if(!Array.isArray(base64Images)){
			throw new ApiError(400,"Base64 Images must be an array")
		}


		//---------------  Upload images to Cloudinary -----------------//
		// if (!base64Images || base64Images.length === 0) {
    	// 	throw new ApiError(400, "Please provide at least one image");
  		// } 

		// let uploadedImageDetails = [];
		// // Upload each base64 image to Cloudinary
		// for (const base64Data of base64Images) {
	
		// 	try {
		// 	const result = await uploadImageCloudinary(base64Data);
		// 	uploadedImageDetails.push(result); // result already contains { public_id, url }
		// 	} 
		// 	catch (uploadError) {
		// 	// If one image fails, you might want to stop the process or log it

		// 	console.error(`Failed to upload one image: ${uploadError.message}`);
		// 	throw new ApiError(500, "Failed to upload one or more image", uploadError.message);
		// 	}
		// }
	

		const product = await Product.create({
			productTitle,
			productDescription,
			originalPrice,
			discountedPrice,
			quantity,
			productImage,
			category,
			warranty,
			brand,
			reviews:[],
			rating:0,
			numReviews:0,
		}
		)
	
		if (!product) {
			throw new ApiError(400, "Invalid product data")
		}
		await product.save();
	
		return res
		.status(201)
		.json(
			new ApiResponse(201, true, "product created successfully",product)
		)

	} catch (error) {
		console.log("Error while creating product: ", error)
		throw new ApiError(500, "Error while creating product");
	}
}
)


const uploadProductImages = asyncHandler( async ( req, res ) => {

	if(!req.user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			throw new ApiError(404, 'Product not found');
		}

		//---------------  Upload images to Cloudinary -----------------//
		if (!base64Images || base64Images.length === 0) {
    		throw new ApiError(400, "Please provide at least one image");
  		} 

		let uploadedImageDetails = [];
		// Upload each base64 image to Cloudinary
		for (const base64Data of base64Images) {
	
			try {
			const result = await uploadImageCloudinary(base64Data);
			uploadedImageDetails.push(result); // result already contains { public_id, url }
			} 
			catch (uploadError) {
			// If one image fails, you might want to stop the process or log it

			console.error(`Failed to upload one image: ${uploadError.message}`);
			throw new ApiError(500, "Failed to upload one or more image", uploadError.message);
			}
		}
		
	} catch (error) {
		console.log("Error while uploading product images: ", error)
		throw new ApiError(500, "Error while uploading product images");
	}
})

//@desc   update a product by id admin only
const updateProductById = asyncHandler( async ( req,res ) => {

	if(!req.user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}

	try {
		const product = await Product.findByIdAndUpdate(req.params.id, req.body,
			{ new: true }
		);

		if(!product){
			throw new ApiError(404,'product not found')
		}
		if(!req.body.productImage){
			throw new ApiError(400,'please provide product image')
		}
		if(!req.body.productTitle){
			throw new ApiError(400,'please provide product title')
		}
		if( !req.body.productDescription ){
			throw new ApiError(400,'please provide product description')
		}
		if( !req.body.productTitle ){
			throw new ApiError(400,'please provide product title')
		}

		
		return res
		.status(200)
		.json(new ApiResponse(200,product,'Product updated successfully'))

	} catch (error) {
		console.log("Error while updating product: ", error)
		throw new ApiError(500, "Error while updating product admin only");
	}
})

//@desc   delete a product by id admin only
const deleteProductById = asyncHandler( async( req, res) => {
	if(!req.user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}

	try {
		const productId = await Product.findByIdAndDelete(req.params.id);
		if(!productId){
			throw new ApiError(404,'product not found')
		}
		
		return res
		.status(200)
		.json(new ApiResponse(200,true,'Product deleted successfully'))
	} catch (error) {
		console.log("Error while deleting product: ", error)
		throw new ApiError(500, "Error while deleting product");
	}
})

// @desc    Update product image by ID admin only
const updateProductImages = asyncHandler( async ( req, res ) => {

	if(!req.user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}
	try {
		
		const product = await Product.findById(req.params.id);

		if(!product){
			throw new ApiError(404,'product not found')
		}
		if(!req.body.productImage){
			throw new ApiError(400,'Product image not found')
		}
		if(!req.file){
			throw new ApiError(400,'please provide product image')
		}

		if (req.body.productImage !== product.productImage.url) {
			await cloudinary.uploader.upload(req.file.path, { folder: `ecommerce/${product._id}/images` })
			.then(( result ) => {
				product.productImage = {
					public_id: result.public_id,
					url: result.secure_url
				};
			}
			).catch((err) => console.log(err));
		}

		if (req.body.productImage === product.productImage.url) {
			throw new ApiError(400, 'New and existing product images are same');
		}
		await cloudinary.uploader.destroy(product.productImage.public_id).then((result)=>{
			console.log(result)
		}
		).catch((err) => console.log(err));

		await product.save();
		
		return res
		.status(200)
		.json(new ApiResponse(200, true, 'Product image updated successfully'));


	} catch (error) {
		console.log("Error while updating product image: ", error)
		throw new ApiError(500, "Error while updating product image");
	}
})

//@desc   delete a product image by id admin only
const deleteProductImage = asyncHandler( async ( req, res ) => {
	if(!req.user.role === 'admin'){
		throw new ApiError(403,'not authorized to perform this action')
	}
	try {
		const product = await Product.findById(req.params.id);
		if(!product){
			throw new ApiError(404,'product not found')
		}
		if(!req.body.productImage){
			throw new ApiError(400,'Product image not found')
		}
		
		await cloudinary.uploader.destroy(product.productImage.public_id).then((result)=>{
			console.log(result)
		})
		product.productImage = null;
		await product.save();

		return res
		.status(200)
		.json(new ApiResponse(200, true, 'Product image deleted successfully'))
		
	} catch (error) {
		console.log("Error while deleting product image: ", error)
		throw new ApiError(500, "Error while deleting product image");
	}
})


// addReviewToProduct, deleteReviewFromProduct, updateRatingOfProduct



const updateStockOfProduct = asyncHandler( async ( req, res ) => {
	
	const productId = await Product.findByIdAndUpdate(req.products._id, {$inc:{stock:-req.body.quantity}}, 
	{ new: true });

	if(!productId){
		throw new ApiError(404,'product not found')
	}
	return res
	.status(200)
	.json(new ApiResponse(200, true, 'Product stock updated successfully',productId))
})

const updateSoldCountOfProduct = asyncHandler( async ( req, res ) => {
	try {
		
		const product = await Product.findByIdAndUpdate(req.params.id, {$inc:{soldCount:req.body.quantity}}, 
		{ new: true });

		if(!product){
			throw new ApiError(404,'product not found')
		}

		return res
		.status(200)
		.json(new ApiResponse(200, true, 'Product sold count updated successfully', product))

	} catch (error) {
		console.log("Error while updating sold count of product: ", error)
		throw new ApiError(500, "Error while updating sold count of product");
		
	}
})

const updateLikesOfProduct = asyncHandler( async ( req, res ) => {

	try {
		
		const product = await Product.findByIdAndUpdate(req.params.id, {$inc:{likes:1}}, 
		{ new: true });

		if(!product){
			throw new ApiError(404,'product not found')
		}

		return res
		.status(200)
		.json(new ApiResponse(200, true, 'Product likes updated successfully', product))

	} catch (error) {
		console.log("Error while updating likes of product: ", error)
		throw new ApiError(500, "Error while updating likes of product");
		
	}
})



export {
	getAllProducts,
	getProductById,
	createProduct,
	updateProductById,
	deleteProductById,
	uploadProductImages,
	updateProductImages,
	deleteProductImage,
	getTopProducts,
	updateStockOfProduct,
	updateSoldCountOfProduct,
	updateLikesOfProduct
}