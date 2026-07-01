import { z } from 'zod';

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function getPasswordStrength(password) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (!password) return { score: 0, label: '' };
  if (passed <= 2) return { score: 1, label: 'Weak' };
  if (passed <= 4) return { score: 2, label: 'Fair' };
  return { score: 3, label: 'Strong' };
}

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (p) => PASSWORD_RULES.every((r) => r.test(p)),
        'Password does not meet all requirements'
      ),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
