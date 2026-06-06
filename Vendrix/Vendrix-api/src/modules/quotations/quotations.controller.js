const quotationsService = require('./quotations.service');
const { success, created, notFound } = require('../../utils/apiResponse');

const getAllQuotations = async (req, res, next) => {
  try { success(res, await quotationsService.getAllQuotations(req.user, req.query)); } catch (err) { next(err); }
};
const getQuotationById = async (req, res, next) => {
  try {
    const q = await quotationsService.getQuotationById(req.params.id);
    if (!q) return notFound(res, 'Quotation not found');
    success(res, q);
  } catch (err) { next(err); }
};
const createQuotation = async (req, res, next) => {
  try { created(res, await quotationsService.createQuotation(req.user.email, req.body)); } catch (err) { next(err); }
};
const updateQuotation = async (req, res, next) => {
  try { success(res, await quotationsService.updateQuotation(req.params.id, req.body)); } catch (err) { next(err); }
};

module.exports = { getAllQuotations, getQuotationById, createQuotation, updateQuotation };
