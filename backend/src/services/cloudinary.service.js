const { v2: cloudinary } = require('cloudinary');
const { cloudinary: cloudinaryConfig } = require('../config/env');

let configured = false;

function ensureConfigured() {
  if (configured) return;

  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
    const err = new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
    err.status = 503;
    throw err;
  }

  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
    secure: true,
  });

  configured = true;
}

function uploadBuffer(buffer, { folder, publicId } = {}) {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || cloudinaryConfig.folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 512, height: 512, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          const err = new Error(error.message || 'Cloudinary upload failed');
          err.status = 502;
          reject(err);
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

async function uploadAvatarImage(file, userId) {
  if (!file?.buffer) {
    const err = new Error('Image file is required');
    err.status = 400;
    throw err;
  }

  return uploadBuffer(file.buffer, {
    folder: `${cloudinaryConfig.folder}/avatars`,
    publicId: userId ? `user_${userId}` : undefined,
  });
}

module.exports = {
  uploadAvatarImage,
  uploadBuffer,
};
