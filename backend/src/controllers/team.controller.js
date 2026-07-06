const teamService = require('../services/team.service');

async function listTeamMembers(_req, res, next) {
  try {
    const members = await teamService.listTeamMembers();
    res.json({ success: true, members });
  } catch (err) {
    next(err);
  }
}

async function createTeamMember(req, res, next) {
  try {
    const member = await teamService.createTeamMember(req.validated);
    res.status(201).json({ success: true, member });
  } catch (err) {
    next(err);
  }
}

async function updateTeamMember(req, res, next) {
  try {
    const member = await teamService.updateTeamMember(
      req.params.userId,
      req.validated,
      req.userId
    );
    res.json({ success: true, member });
  } catch (err) {
    next(err);
  }
}

async function deleteTeamMember(req, res, next) {
  try {
    await teamService.deleteTeamMember(req.params.userId, req.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
