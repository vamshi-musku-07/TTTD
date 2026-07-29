const cloudinaryService = require('../services/cloudinary.service');

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const result = await cloudinaryService.uploadAvatarImage(req.file, req.userId);
    res.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadAvatar,
};
