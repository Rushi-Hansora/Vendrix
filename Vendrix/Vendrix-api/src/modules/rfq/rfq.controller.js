const rfqService = require('./rfq.service');
const { success, created, notFound } = require('../../utils/apiResponse');

const getAllRFQs = async (req, res, next) => {
  try { success(res, await rfqService.getAllRFQs(req.user, req.query)); } catch (err) { next(err); }
};
const getRFQById = async (req, res, next) => {
  try {
    const rfq = await rfqService.getRFQById(req.params.id);
    if (!rfq) return notFound(res, 'RFQ not found');
    success(res, rfq);
  } catch (err) { next(err); }
};
const createRFQ = async (req, res, next) => {
  try { created(res, await rfqService.createRFQ(req.user.id, req.body)); } catch (err) { next(err); }
};
const updateRFQ = async (req, res, next) => {
  try { success(res, await rfqService.updateRFQ(req.params.id, req.body)); } catch (err) { next(err); }
};
const deleteRFQ = async (req, res, next) => {
  try { await rfqService.deleteRFQ(req.params.id); success(res, null, 'RFQ deleted'); } catch (err) { next(err); }
};

module.exports = { getAllRFQs, getRFQById, createRFQ, updateRFQ, deleteRFQ };
