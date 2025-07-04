import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET
    });
    
    // Upload function

    const uploadImage = async (filePath) => {
        try {
            if(!filePath) {
                throw new Error('File path is required for upload');
            }
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: 'auto'
            });
            fs.unlinkSync(filePath); // Clean up the file after upload from the local system
            return result;
        } catch (error) {
            fs.unlinkSync(filePath); // Clean up the file after upload from the local system
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    export default uploadImage