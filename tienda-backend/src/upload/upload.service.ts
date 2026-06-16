import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  uploadImage(
    file: Express.Multer.File,
    folder: string = 'tienda/general'
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    
      Readable.from(file.buffer).pipe(upload);
    });
  }

  async uploadImageFromUrl(
    imageUrl: string,
    folder: string = 'tienda/general'
  ): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, { folder });
      return result;
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      throw error;
    }
  }

  async deleteImage(url: string): Promise<any> {
    try {
      if (!url.includes('cloudinary.com')) return null;
      
      // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[extension]
      // We need everything after /upload/ (excluding the version and the extension)
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex === -1) return null;

      const afterUpload = url.substring(uploadIndex + 8);
      const parts = afterUpload.split('/');
      
      // If the first part starts with 'v' and is followed by numbers, it's the version
      let publicIdWithExt;
      if (parts[0].match(/^v\d+$/)) {
        publicIdWithExt = parts.slice(1).join('/');
      } else {
        publicIdWithExt = parts.join('/');
      }

      // Remove extension
      const publicId = publicIdWithExt.split('.').slice(0, -1).join('.');
      
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary", error);
      throw error;
    }
  }
}
