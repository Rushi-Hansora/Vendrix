const invoicesService = require('./invoices.service');
const { success, created, notFound } = require('../../utils/apiResponse');
const { getSignedDownloadUrl } = require('../../services/s3Service');

const getAllInvoices = async (req, res, next) => {
  try { success(res, await invoicesService.getAllInvoices(req.user, req.query)); } catch (err) { next(err); }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const inv = await invoicesService.getInvoiceById(req.params.id);
    if (!inv) return notFound(res, 'Invoice not found');
    success(res, inv);
  } catch (err) { next(err); }
};

const createInvoice = async (req, res, next) => {
  try { created(res, await invoicesService.createInvoice(req.body), 'Invoice created'); } catch (err) { next(err); }
};

const sendInvoice = async (req, res, next) => {
  try {
    const result = await invoicesService.sendInvoiceEmail(req.params.id);
    success(res, result, 'Invoice sent via email');
  } catch (err) { next(err); }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const inv = await invoicesService.getInvoiceById(req.params.id);
    if (!inv) return notFound(res, 'Invoice not found');
    if (!inv.pdfUrl) return notFound(res, 'Invoice PDF not available');

    const url = await getSignedDownloadUrl(inv.pdfUrl);
    success(res, { url }, 'Invoice download URL generated');
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try { success(res, await invoicesService.updateStatus(req.params.id, req.body.status)); } catch (err) { next(err); }
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, sendInvoice, downloadInvoice, updateStatus };
