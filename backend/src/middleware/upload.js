const multer = require('multer');

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_BYTES },
  fileFilter(_req, file, cb) {
    if (!file.mimetype?.startsWith('image/')) {
      const err = new Error('Only image files are allowed');
      err.status = 400;
      cb(err);
      return;
    }
    cb(null, true);
  },
});

function uploadAvatarMiddleware(req, res, next) {
  imageUpload.single('avatar')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image must be under 2MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(err.status || 400).json({
      success: false,
      message: err.message || 'Upload failed',
    });
  });
}

module.exports = {
  uploadAvatarMiddleware,
  MAX_AVATAR_BYTES,
};
