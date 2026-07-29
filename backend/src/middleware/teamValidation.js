const { z } = require('zod');

const avatarSchema = z
  .string()
  .max(500, 'Invalid profile image URL')
  .refine(
    (val) =>
      val === '' ||
      val.startsWith('https://') ||
      val.startsWith('http://'),
    { message: 'Profile image must be a valid URL' }
  )
  .optional()
  .nullable();

const createTeamMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  avatar: avatarSchema,
});

const updateTeamMemberSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8).optional(),
  avatar: avatarSchema,
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).optional(),
  password: z.string().min(8).optional(),
  avatar: avatarSchema,
});

module.exports = {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  updateProfileSchema,
};
