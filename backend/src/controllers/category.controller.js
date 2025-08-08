import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js"
import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import { cloudinary, uploadImageCloudinary } from "../utils/cloudinary.service.js";


// @desc Get All Categories
const getAllCategories = asyncHandler(async (req,res) => {

	try {
        const categories = await Category.find({});
        	
            return res.
            status(200).
            json( new ApiResponse( 200, categories, "All Categories" ));

    } catch (error) {
        console.log("Error while getting all categories: ", error )
        throw new ApiError(500, "Error while getting all categories", error.message);
    }
});

// @desc Get Single Category By Id
const getCategoryById = asyncHandler( async (req,res) => {

	const category = await Category.findById(req.params.id);

	if(!category){
		throw new ApiError(404,"No category found with this id");
	}

	return res.
    status(200).
    json( new ApiResponse( 200, category, "Single Category" ));
})

// @desc Create a New Category
// @route POST /api/categories
// @access Private (Admin Only)
const createCategory = asyncHandler( async( req, res )=>{

    if (req.user.role !== 'admin') {
            throw new ApiError(403, "You do not have permission to create a category.");
    }

	try {
        const { categoryName, parentCategory, categoryDescription, categoryImage, categoryStatus, attributes } = req.body;

        // --- 1. Basic Input Validation ---
        if (!categoryName || !categoryImage) {
            throw new ApiError(400, "Required fields missing. Please provide both category name and image.");
        }
        if (typeof categoryName !== 'string' || typeof categoryImage !== 'string') {
            throw new ApiError(400, "Category name and image must be strings.");
        }
        if (categoryName.trim() === '' || categoryImage.trim() === '') {
            throw new ApiError(400, "Category name and image cannot be empty.");    
        }
        // --- 2. Validate parentCategory if provided ---
        let parentCategoryId = null;
        if (parentCategory) {
            if (typeof parentCategory !== 'string' || !parentCategory.trim()) {
                throw new ApiError(400, "Parent category must be a valid non-empty string.");
            }
            parentCategoryId = parentCategory.trim();
        }

        // --- 3. Validate categoryStatus if provided ---
        if (categoryStatus !== undefined && typeof categoryStatus !== 'boolean') {
            throw new ApiError(400, "Category status must be a boolean value.");
        }
        if (categoryStatus !== undefined && !(categoryStatus === true || categoryStatus === false)) {
            throw new ApiError(400, "If provided, category status must be either true or false.");
        }

        // --- 4. Validate categoryDescription if provided ---
        if (categoryDescription && typeof categoryDescription !== 'string') {
            throw new ApiError(400, "Category description must be a string.");
        }

        // --- 5. Validate attributes if provided ---
        if (attributes) {
            if (!Array.isArray(attributes)) {
                throw new ApiError(400, "Attributes must be an array if provided.");
            }
            if (!attributes.every(attribute => typeof attribute.attributeName === 'string')) {
                throw new ApiError(400, "Every attribute should have a string attributeName.");
            }
            if (!attributes.every(attribute => typeof attribute.attributeValue === 'string')) {
                throw new ApiError(400, "Every attribute should have a string attributeValue.");
            }
        }

        // --- 6. Check if category already exists ---
        const categoryNameTrimmed = categoryName.trim();
        const checkCategoryName = categoryNameTrimmed.charAt(0).toUpperCase() + categoryNameTrimmed.slice(1).toLowerCase();
        // Check if a category with the same name already exists
        // This is crucial to prevent duplicate categories
        const categoryNameExists = await Category.findOne({categoryName: checkCategoryName});
        if (categoryNameExists) {
            throw new ApiError(409, "Category already exists with this name.");
        }

        // If parentCategoryId is null, it means this is a top-level category
        if (parentCategoryId && !await Category.findById(parentCategoryId)) {
            throw new ApiError(404, "Parent category does not exist. It is a top-level category.");
        }

        // If parentCategoryId is provided, ensure it is a valid ObjectId
        if (parentCategoryId && typeof parentCategoryId !== 'string') {
            throw new ApiError(400, "Parent category ID must be a valid string.");
        }

        // upload category image to cloudinary
        let categoryImageUrl = '';
        if(categoryImage){
            const result = await uploadImageCloudinary(categoryImage);
            if (!result || !result.secure_url) {
                throw new ApiError(500, "Failed to upload category image to Cloudinary.");
            }
            categoryImageUrl = result.secure_url;
        }
        if(categoryImageUrl){
            category.categoryImage = categoryImageUrl;
        }

        // --- 7. Create the new category ---
        const newCategory = await Category.create({ 
            categoryName: checkCategoryName,
            parentCategory: parentCategoryId,
            categoryDescription,
            categoryImage,
            categoryStatus,
            attributes: attributes ? attributes.map(attr => ({
                attributeName: attr.attributeName,
                attributeValue: attr.attributeValue,
                attributeKey: attr.attributeKey ? attr.attributeKey.trim() : attr.attributeName.trim().toLowerCase().replace(/\s+/g, '_'),
                attributeStatus: attr.attributeStatus !== undefined ? attr.attributeStatus : false, // Default to false if not provided
                attributeDescription: attr.attributeDescription ? attr.attributeDescription.trim() : '', // Trim description if provided
                validation: attr.validation || 'optional' // Default to 'optional' if not provided
            })) : [] 
        });
        
        // --- 8. Populate the new category with attributes if they are references ---
        // If attributes are embedded, this is not necessary, but if they are references, we need to populate them
        const populatedCategory = await Category.findById(newCategory._id).populate('attributes');
        if (!populatedCategory) {
            throw new ApiError(404, "Category not found after creation.");
        }
        console.log("Category created successfully: ", populatedCategory);

        return res
            .status(201)
            .json(new ApiResponse( 201, newCategory, "Created Category Successfully" ));

    } catch (error) {
        console.log("Error while creating category: ", error )
        throw new ApiError(500, "Error while creating category", error.message);
    }
}
)


// @desc Update A Category
// @route PUT /api/categories/:id
// @access Private (Admin Only)
const updateCategory = asyncHandler(async(req,res)=>{
    if (req.user.isAdmin !== 'admin') {
        throw new ApiError(403, "You do not have permission to update a category.");
    }

    try {
        const categoryId = req.params.id;
        let {
            categoryName,
            parentCategory,
            categoryDescription,
            categoryImage, // This will be the new base64 image string
            categoryStatus,
            attributes // This will completely replace existing attributes if provided
        } = req.body;

        // --- 1. Find the Category ---
        let category = await Category.findById(categoryId);

        if (!category) {
            throw new ApiError(404, "No category found with this ID.");
        }

        const updateFields = {};

        // --- 2. Update categoryName ---
        if (categoryName !== undefined) {
            if (typeof categoryName !== 'string' || categoryName.trim() === '') {
                throw new ApiError(400, "Category name must be a non-empty string.");
            }
            const trimmedName = categoryName.trim();
            const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

            // Check for duplicate category name ONLY if the name is actually changing
            if (formattedName !== category.categoryName) {
                const categoryNameExists = await Category.findOne({ categoryName: formattedName });
                if (categoryNameExists && categoryNameExists._id.toString() !== categoryId) {
                    throw new ApiError(409, "Another category already exists with this name.");
                }
            }
            updateFields.categoryName = formattedName;
        }

        // --- 3. Update parentCategory ---
        if (parentCategory !== undefined) {
            // If parentCategory is empty string or null, it means it's becoming a top-level category
            if (parentCategory === null || parentCategory.trim() === '') {
                updateFields.parentCategory = null;
            } else {
                if (typeof parentCategory !== 'string' || !parentCategory.trim()) {
                    throw new ApiError(400, "Parent category must be a valid non-empty string ID.");
                }
                // Prevent a category from being its own parent
                if (parentCategory === categoryId) {
                    throw new ApiError(400, "A category cannot be its own parent.");
                }
                // Check if the parent category exists
                if (!await Category.findById(parentCategory.trim())) {
                    throw new ApiError(404, "Provided parent category does not exist.");
                }
                updateFields.parentCategory = parentCategory.trim();
            }
        }

        // --- 4. Update categoryDescription ---
        if (categoryDescription !== undefined) {
            if (typeof categoryDescription !== 'string') {
                throw new ApiError(400, "Category description must be a string.");
            }
            updateFields.categoryDescription = categoryDescription.trim();
        }

        // --- 5. Update categoryStatus ---
        if (categoryStatus !== undefined) {
            if (typeof categoryStatus !== 'boolean') {
                throw new ApiError(400, "Category status must be a boolean value.");
            }
            updateFields.categoryStatus = categoryStatus;
        }

        // --- 6. Update categoryImage (handle Cloudinary upload/deletion) ---
        if (categoryImage !== undefined) {
            if (typeof categoryImage !== 'string' || categoryImage.trim() === '') {
                 throw new ApiError(400, "Category image must be a non-empty base64 string.");
            }

            // If there's an existing image, delete it from Cloudinary first
            if (category.categoryImage && category.categoryImage.public_id) { // Assuming your categoryImage stores public_id
                 try {
                     await cloudinary.uploader.destroy(category.categoryImage.public_id);
                     console.log(`Old image ${category.categoryImage.public_id} deleted from Cloudinary.`);
                 } catch (err) {
                     console.warn(`Could not delete old image from Cloudinary: ${err.message}`);
                     // Continue despite old image deletion failure
                 }
             }

            // Upload the new image
            const result = await uploadImageCloudinary(categoryImage);
            if (!result || !result.url || !result.public_id) {
                throw new ApiError(500, "Failed to upload new category image to Cloudinary.");
            }
            updateFields.categoryImage = {
                public_id: result.public_id,
                url: result.url
            };
        }

        // REVISED ATTRIBUTE UPDATE LOGIC (Replacing section 7 in the controller above)

        // --- 7. Update Attributes (Add/Update selected attributes) ---
        if (attributesToUpdate !== undefined) {
            if (!Array.isArray(attributesToUpdate)) {
                throw new ApiError(400, "Attributes for update must be an array.");
            }

            const processedKeys = new Set(); // To track keys within the current request for duplicates

            for (const attr of attributesToUpdate) {
                if (!attr.attributeName || !attr.attributeValue) {
                    throw new ApiError(400, "Each attribute to update/add must have 'attributeName' and 'attributeValue'.");
                }

                const derivedKey = attr.attributeKey ? attr.attributeKey.trim() : attr.attributeName.trim().toLowerCase().replace(/\s+/g, '_');

                if (derivedKey.length === 0) {
                    throw new ApiError(400, "Attribute Key cannot be empty for provided attributes.");
                }

                if (processedKeys.has(derivedKey)) {
                    throw new ApiError(400, `Duplicate attribute key "${derivedKey}" found in the provided attributes array for update.`);
                }
                processedKeys.add(derivedKey);

                const newAttribute = {
                    attributeName: attr.attributeName.trim(),
                    attributeValue: attr.attributeValue.trim(),
                    attributeKey: derivedKey,
                    attributeStatus: attr.attributeStatus !== undefined ? attr.attributeStatus : false,
                    attributeDescription: attr.attributeDescription ? attr.attributeDescription.trim() : '',
                    validation: attr.validation || 'optional' // Default to 'optional' if not provided
                };

                // First, pull any existing attribute with this key
                await Category.findByIdAndUpdate(
                    categoryId,
                    { $pull: { attributes: { attributeKey: derivedKey } } },
                    { runValidators: true } // Ensure validators run on pull
                );

                // Then, push the new (or updated) version of the attribute
                await Category.findByIdAndUpdate(
                    categoryId,
                    { $push: { attributes: newAttribute } },
                    { runValidators: true } // Ensure validators run on push
                );
            }
        }

       
        // --- 8. Perform the update ---
        const updatedCategoryDoc = await Category.findByIdAndUpdate(
            categoryId,
            { $set: updateFields }, // Use $set to update individual fields
            { new: true, runValidators: true, useFindAndModify: false } // new: true returns updated doc
        ).populate('attributes'); // Populate attributes if they are references

        if (!updatedCategoryDoc) {
            throw new ApiError(500, "Failed to update category. Category might have been deleted.");
        }

        // --- 9. Send Response ---
        return res
            .status(200) // 200 OK for successful update
            .json(new ApiResponse(200, updatedCategoryDoc, "Category updated successfully."));

    } catch (error) {

        console.error("Error while updating category:", error);
        throw new ApiError(500, "Internal Server Error: Could not update category.", error.message);
    }
});


// @desc Delete A Category
// @route DELETE /api/categories/:id
// @access Private (Admin Only)
const deleteCategory = asyncHandler(async(req,res)=>{

    try {
        const category = await Category.findByIdAndDelete(req.params.id);
    
        if(!category){
            throw new ApiError(404,"No category found with this id");
        }

        //FIND PRODUCTS WITH THIS CATEGORY ID AND DELETE THEM TOO

        const products = await Product.find({ categoryId: category._id });
        if(products.length > 0){
            await Product.deleteMany({_id:{ $in :products.map((product)=> product._id)}});
        }
        //update products category field to undefined
        for(const product of products){
            await Product.findByIdAndUpdate(product._id, { categoryId : undefined }, { new:true });
            await User.updateOne({ _id: product.userId },{ $pull: { cartItems: { productId: product._id } }});
            await User.updateOne({ _id: product.userId },{ $pull: { wishlistItems: { productId: product._id } }});
            await User.updateOne({ _id: product.userId },{ $pull: { orders: { items: { productId: product._id } } }});
            
            console.log(`Product ${product.name} updated successfully`);
        }

        await category.deleteOne();

        return res
        .status(200)
        .json(new ApiResponse( 200, null, "Deleted Category Successfully" ));

    } catch (error) {
        console.log("Error while deleting category: ", error );
        throw new ApiError(500, "Error while deleting category", error.message);
    }

});

// @desc Get Products By Category Id
const getProductsByCategoryId = asyncHandler(async(req,res)=>{
    const category = await Category.findById(req.params.id).populate('products');
    if(!category){
        throw new ApiError(404,"No category found with this id");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,category.products,'Products by category'));
});


// @desc Create an attribute for a category
// @route POST /api/categories/:id/attributes
// @access Private (Admin Only)
const createAttributeForCategory = asyncHandler(async (req, res, next) => { // Added `next` for consistency with ApiError handling 
    const user = req.user;
    if (user.roles !== 'admin') {
        throw new ApiError(403, "You do not have permission to perform this action.")
    }

    try {
        const { attributeName, attributeValue, attributeKey, attributeStatus, attributeDescription, validation } = req.body;

        // --- 1. Basic Input Validation ---
        if (!attributeName || !attributeValue) {
            throw new ApiError(400, "Please provide both attribute name and value. Attribute description is optional.");
        }
        if (typeof attributeName !== 'string' || typeof attributeValue !== 'string' || typeof attributeDescription !== 'string') {
            throw new ApiError(400, "Attribute name value and description must be strings.");
        }
        if (attributeName.trim() === '' || attributeValue.trim() === '' || attributeDescription.trim() === '') {
            throw new ApiError(400, "Attribute name, description and value cannot be empty.");
        }

        // --- 1.A Validate attributeStatus ---
        if (attributeStatus !== undefined && typeof attributeStatus !== 'boolean') {
            throw new ApiError(400, "Attribute status must be a boolean value.");
        }
        if (attributeStatus !== undefined && !(attributeStatus === true || attributeStatus === false)) {
            throw new ApiError(400, "If provided, attribute status must be either true or false.");
        }

        // --- 1.B Validate validation field ---
        if (validation !== undefined && typeof validation !== 'string') {
            throw new ApiError(400, "Validation must be a string.");
        }
        if (validation && !['required', 'optional'].includes(validation)) {
            throw new ApiError(400, "Validation must be either 'required' or 'optional'.");
        } 
        

        // --- 2. Determine and Validate attributeKey ---
        const key = attributeKey ? attributeKey.trim() : attributeName.trim().toLowerCase().replace(/\s+/g, '_');
        // Added .trim() to attributeKey and attributeName
        // Added .toLowerCase().replace(/\s+/g, '_') for a robust default key if not provided

        if (typeof key !== 'string' || key.length === 0) {
            throw new ApiError(400, "Attribute Key must be a non-empty string.");
        }

        // --- 3. Find the Category ---
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw new ApiError(404, "No category found with this ID.");
        }

        // --- 4. Check for Duplicate Attribute Key BEFORE Attempting Update ---
        // This is crucial for avoiding duplicate entries and sending correct errors.
        const attributeKeyExists = category.attributes.find(attr => attr.attributeKey === key);
        if (attributeKeyExists) {
            throw new ApiError(409, `Attribute Key "${key}" already exists for this category.`);
        }

        // --- 5. Prepare the new attribute object ---
        const newAttribute = {
            attributeName,
            attributeValue,
            attributeKey: key,
            attributeStatus: attributeStatus !== undefined ? attributeStatus : false, // Default to false if not provided
            attributeDescription: attributeDescription ? attributeDescription.trim() : '', // Trim description if provided
            validation: validation || 'optional' // Default to 'optional' if not provided
        };

        // --- 6. Atomically push the new attribute and get the updated document ---
        // Use findByIdAndUpdate with $push to add the attribute
        // { new: true } returns the document *after* the update
        // { runValidators: true } ensures array sub-document validators run if defined
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $push: { attributes: newAttribute } },
            { new: true, runValidators: true } // Removed upsert:true as it's not needed here
        ).populate('attributes'); // Populate if attributes are references, otherwise it's just fine for embedded

        // Double check if updatedCategory is null (unlikely after previous check but safe)
        if (!updatedCategory) {
            throw new ApiError(404, "Category not found after update attempt.");
        }

        console.log("Attribute added successfully."); // Simplified logging

        // --- 7. Send Response ---
        return res
            .status(201)
            .json(new ApiResponse(201, updatedCategory.attributes, "Created Attribute For Category Successfully"));

    } catch (error) {

        console.error("Error while creating attribute for category:", error); // Use console.error for errors
        throw new ApiError(500, "Internal Server Error: Could not create attribute for category.", error.message);
    }
});

// @desc Delete an attribute from a category
// @route DELETE /api/categories/:id/attributes/:attributeKey
// @access Private (Admin Only)
// @body { attributeKey: "key_to_delete" }
const deleteAttributeFromCategory = asyncHandler( async ( req, res ) => {

   try {
     const { attributeKey } = req.body;
 
     if (!attributeKey) {
         throw new ApiError(400, "Attribute Key is required to delete an attribute.");
     }
 
     const category = await Category.findById(req.params.id);
 
     if (!category) {
         throw new ApiError(404, "No category found with this ID.");
     }
 
     // Check if the attribute exists
     const attributeExists = category.attributes.some(attr => attr.attributeKey === attributeKey);
     if (!attributeExists) {
         throw new ApiError(404, `No attribute found with key "${attributeKey}" in this category.`);
     }
 
     // Remove the attribute
     category.attributes = category.attributes.filter(attr => attr.attributeKey !== attributeKey);
     
     await category.save();
 
     return res
     .status(200)
     .json(new ApiResponse(200, null, `Deleted Attribute with key "${attributeKey}" Successfully`));

   } catch (error) {

     console.error("Error while deleting attribute from category:", error);
     throw new ApiError(500, "Internal Server Error: Could not delete attribute from category.", error.message);
    
   }
})


export {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductsByCategoryId,
    createAttributeForCategory,
    deleteAttributeFromCategory
};
