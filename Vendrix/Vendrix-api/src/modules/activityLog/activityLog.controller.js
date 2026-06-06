const activityLogService = require('./activityLog.service');
const { success } = require('../../utils/apiResponse');

const getLogs = async (req, res, next) => {
  try { success(res, await activityLogService.getLogs(req.user, req.query)); } catch (err) { next(err); }
};

module.exports = { getLogs };
