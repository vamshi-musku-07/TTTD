const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  createVideoSchema,
  updateVideoSchema,
} = require('../middleware/eventValidation');
const eventsController = require('../controllers/events.controller');

const router = Router();

router.get('/', eventsController.listEvents);
router.get('/:eventId', eventsController.getEvent);
router.post('/', authenticate, validate(createEventSchema), eventsController.createEvent);
router.patch('/:eventId', authenticate, validate(updateEventSchema), eventsController.updateEvent);
router.delete('/:eventId', authenticate, eventsController.deleteEvent);
router.patch(
  '/:eventId/status',
  authenticate,
  validate(updateEventStatusSchema),
  eventsController.updateEventStatus
);

router.get('/:eventId/videos', authenticate, eventsController.listVideos);
router.post(
  '/:eventId/videos',
  authenticate,
  validate(createVideoSchema),
  eventsController.createVideo
);

module.exports = router;
