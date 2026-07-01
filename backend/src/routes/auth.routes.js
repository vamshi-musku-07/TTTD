const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authLimiter, signupLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  signupSchema,
  googleAuthSchema,
  loginSchema,
  resendVerificationSchema,
} = require('../middleware/validate');

const router = Router();

router.post('/signup', signupLimiter, validate(signupSchema), authController.signup);
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuth);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post(
  '/resend-verification',
  authLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);

module.exports = router;
