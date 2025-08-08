import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',   
    api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key', 
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
  
});

cloudinary.uploader.upload = async (filePath, options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, options);
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

const uploadImageCloudinary = async (localFilePath ) => {
    try {
        if (!localFilePath) {
            throw new Error('File path is required for upload');
        }
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'image', // Automatically detect the resource type
            folder: 'your_folder_name', // Optional: specify a folder in Cloudinary
            
        });
        console.log('Image uploaded successfully:', result.url);
        return result;
    } catch (error) {

        fs.unlinkSync(filePath)

        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }

}

export { cloudinary, uploadImageCloudinary };