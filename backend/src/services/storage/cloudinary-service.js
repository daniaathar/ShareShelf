import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../../utils/app-error.js';

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
export async function uploadImage(file, folder) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) throw new AppError(503, 'STORAGE_NOT_CONFIGURED', 'Image storage is not configured');
  return new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] }, (error, result) => error ? reject(error) : resolve({ url: result.secure_url, storagePublicId: result.public_id })).end(file.buffer));
}
