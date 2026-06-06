const approvalsService = require('./approvals.service');
const { success, notFound } = require('../../utils/apiResponse');

const getPendingApprovals = async (req, res, next) => {
  try { success(res, await approvalsService.getPendingApprovals(req.query)); } catch (err) { next(err); }
};

const getAllApprovals = async (req, res, next) => {
  try { success(res, await approvalsService.getAllApprovals(req.query)); } catch (err) { next(err); }
};

const getApprovalById = async (req, res, next) => {
  try {
    const a = await approvalsService.getById(req.params.id);
    if (!a) return notFound(res, 'Approval not found');
    success(res, a);
  } catch (err) { next(err); }
};

// POST /approvals  body: { quotationId, status: 'APPROVED'|'REJECTED', remarks }
const processApproval = async (req, res, next) => {
  try {
    const result = await approvalsService.processApproval(req.body, req.user.id);
    success(res, result, `Approval ${req.body.status}`);
  } catch (err) { next(err); }
};

const approve = async (req, res, next) => {
  try {
    const result = await approvalsService.updateStatus(req.params.id, 'APPROVED', req.user.id, req.body.remarks);
    success(res, result, 'Approved successfully');
  } catch (err) { next(err); }
};

const reject = async (req, res, next) => {
  try {
    const result = await approvalsService.updateStatus(req.params.id, 'REJECTED', req.user.id, req.body.remarks);
    success(res, result, 'Rejected successfully');
  } catch (err) { next(err); }
};

module.exports = { getPendingApprovals, getAllApprovals, getApprovalById, processApproval, approve, reject };
