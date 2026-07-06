const { z } = require('zod');

const TEAM_ROLES = ['editor', 'photographer', 'admin'];

const createTeamMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(TEAM_ROLES, { errorMap: () => ({ message: 'Invalid role' }) }),
});

const updateTeamMemberSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(TEAM_ROLES).optional(),
});

module.exports = {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  TEAM_ROLES,
};
