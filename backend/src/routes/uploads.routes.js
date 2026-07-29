const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { uploadAvatarMiddleware } = require('../middleware/upload');
const uploadsController = require('../controllers/uploads.controller');

const router = Router();

router.post('/avatar', authenticate, uploadAvatarMiddleware, uploadsController.uploadAvatar);

module.exports = router;
