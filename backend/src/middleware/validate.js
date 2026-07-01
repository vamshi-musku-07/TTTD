const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
  }),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
  acceptTerms: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const message = Object.values(errors).flat()[0] || 'Validation failed';
      return res.status(400).json({ success: false, message, errors });
    }
    req.validated = result.data;
    next();
  };
}

module.exports = {
  signupSchema,
  googleAuthSchema,
  loginSchema,
  resendVerificationSchema,
  verifyEmailSchema,
  validate,
};
