const reportsService = require('./reports.service');
const { success } = require('../../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try { success(res, await reportsService.getSummary()); } catch (err) { next(err); }
};
const getVendorReport = async (req, res, next) => {
  try { success(res, await reportsService.getVendorReport(req.params.vendorId)); } catch (err) { next(err); }
};

module.exports = { getSummary, getVendorReport };
