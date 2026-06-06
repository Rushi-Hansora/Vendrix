const poService = require('./purchaseOrders.service');
const { success, created, notFound } = require('../../utils/apiResponse');

const getAllPOs = async (req, res, next) => {
  try { success(res, await poService.getAllPOs(req.user, req.query)); } catch (err) { next(err); }
};
const getPOById = async (req, res, next) => {
  try {
    const po = await poService.getPOById(req.params.id);
    if (!po) return notFound(res, 'Purchase Order not found');
    success(res, po);
  } catch (err) { next(err); }
};
const createPO = async (req, res, next) => {
  try { created(res, await poService.createPO(req.user.id, req.body)); } catch (err) { next(err); }
};
const updateStatus = async (req, res, next) => {
  try { success(res, await poService.updateStatus(req.params.id, req.body.status)); } catch (err) { next(err); }
};

module.exports = { getAllPOs, getPOById, createPO, updateStatus };
