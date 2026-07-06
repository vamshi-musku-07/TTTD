const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createComplaintSchema,
  resolveComplaintSchema,
} = require('../middleware/complaintValidation');
const complaintsController = require('../controllers/complaints.controller');

const router = Router();

router.get('/recipients', authenticate, complaintsController.listRecipients);
router.get('/', authenticate, complaintsController.listComplaints);
router.post('/', authenticate, validate(createComplaintSchema), complaintsController.createComplaint);
router.patch(
  '/:complaintId/resolve',
  authenticate,
  validate(resolveComplaintSchema),
  complaintsController.resolveComplaint
);

module.exports = router;
