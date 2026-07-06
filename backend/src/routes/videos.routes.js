const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateVideoSchema } = require('../middleware/eventValidation');
const eventsController = require('../controllers/events.controller');

const router = Router();

router.patch('/:videoId', authenticate, validate(updateVideoSchema), eventsController.updateVideo);
router.delete('/:videoId', authenticate, eventsController.deleteVideo);

module.exports = router;
