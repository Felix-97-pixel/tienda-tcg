import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteImage(url: string): Promise<any> {
    try {
      if (!url.includes('cloudinary.com')) return null;
      // Extract public_id from Cloudinary URL
      const parts = url.split('/');
      const filenameWithExtension = parts[parts.length - 1];
      const publicId = filenameWithExtension.split('.')[0];
      
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary", error);
      throw error;
    }
  }
}
