const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { requireAdmin, requireSuperAdmin } = require('../middleware/requireRole');
const {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} = require('../middleware/teamValidation');
const teamController = require('../controllers/team.controller');

const router = Router();

router.get('/', authenticate, requireAdmin, teamController.listTeamMembers);
router.post(
  '/',
  authenticate,
  requireSuperAdmin,
  validate(createTeamMemberSchema),
  teamController.createTeamMember
);
router.patch(
  '/:userId',
  authenticate,
  requireSuperAdmin,
  validate(updateTeamMemberSchema),
  teamController.updateTeamMember
);
router.delete(
  '/:userId',
  authenticate,
  requireSuperAdmin,
  teamController.deleteTeamMember
);

module.exports = router;
