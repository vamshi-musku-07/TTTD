const complaintsService = require('../services/complaints.service');

function getActiveRole(req) {
  return req.headers['x-active-role'] || req.user?.role || 'editor';
}

async function listRecipients(_req, res, next) {
  try {
    const recipients = await complaintsService.listRecipients();
    res.json({ success: true, recipients });
  } catch (err) {
    next(err);
  }
}

async function listComplaints(req, res, next) {
  try {
    const activeRole = getActiveRole(req);
    const complaints = await complaintsService.listComplaints(req.userId, activeRole);
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
}

async function createComplaint(req, res, next) {
  try {
    const complaint = await complaintsService.createComplaint(req.validated, req.userId);
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

async function resolveComplaint(req, res, next) {
  try {
    const activeRole = getActiveRole(req);
    const complaint = await complaintsService.resolveComplaint(
      req.params.complaintId,
      req.userId,
      activeRole,
      req.validated.message
    );
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRecipients,
  listComplaints,
  createComplaint,
  resolveComplaint,
};
