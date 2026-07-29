const { z } = require('zod');

const COMPLAINT_CATEGORIES = [
  'Technical Issue',
  'Production Equipment',
  'Facility/Studio',
  'Software Bug',
  'General Suggestion',
  'Other',
];

const createComplaintSchema = z
  .object({
    category: z.enum(COMPLAINT_CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
    description: z.string().trim().min(1, 'Description is required').max(5000),
    otherDetails: z.string().trim().max(200).optional(),
    assignedToId: z.string().min(1, 'Please select an admin recipient'),
    submitterRole: z.enum(['editor'], {
      errorMap: () => ({ message: 'Invalid submitter role' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'Other' && !data.otherDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please describe the other issue',
        path: ['otherDetails'],
      });
    }
  });

const resolveComplaintSchema = z.object({
  message: z.string().trim().max(2000).optional(),
});

module.exports = {
  createComplaintSchema,
  resolveComplaintSchema,
};
