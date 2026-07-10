const { z } = require('zod');

const EVENT_TYPES = [
  'Corporate Film',
  'Live Broadcast',
  'Social Media Reel',
  'Documentary',
];

const createEventSchema = z.object({
  title: z.string().trim().min(1, 'Event title is required').max(200),
  scheduleDate: z.string().min(1, 'Date is required'),
  location: z.string().trim().min(1, 'Location is required').max(200),
  type: z.enum(EVENT_TYPES, { errorMap: () => ({ message: 'Invalid event type' }) }),
  cameraman: z.string().trim().max(100).optional(),
});

const updateEventStatusSchema = z
  .object({
    editorStatus: z
      .enum(['event-scheduled', 'editing-ongoing', 'footage-received', 'event-done'])
      .optional(),
    cameramanStatus: z
      .enum(['cancelled', 'scheduled', 'started', 'footage-covered', 'delivered'])
      .optional(),
  })
  .refine((data) => data.editorStatus || data.cameramanStatus, {
    message: 'At least one status field is required',
  });

const createVideoSchema = z.object({
  title: z.string().trim().min(1, 'Video name is required').max(200),
  type: z.enum(['Shortform', 'Longform', 'Raw']),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Invalid video URL',
    }),
  description: z.string().trim().max(2000).optional(),
  platforms: z.array(z.string()).optional(),
});

const updateVideoSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['Shortform', 'Longform', 'Raw']).optional(),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Invalid video URL',
    }),
  description: z.string().trim().max(2000).optional(),
  platforms: z.array(z.string()).optional(),
});

module.exports = {
  createEventSchema,
  updateEventStatusSchema,
  createVideoSchema,
  updateVideoSchema,
};
