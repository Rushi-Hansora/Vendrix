const vendorsService = require('./vendors.service');
const { success, created, notFound } = require('../../utils/apiResponse');

const getAllVendors = async (req, res, next) => {
  try { success(res, await vendorsService.getAllVendors(req.query)); } catch (err) { next(err); }
};

const getVendorById = async (req, res, next) => {
  try {
    const vendor = await vendorsService.getVendorById(req.params.id);
    if (!vendor) return notFound(res, 'Vendor not found');
    success(res, vendor);
  } catch (err) { next(err); }
};

const createVendor = async (req, res, next) => {
  try { created(res, await vendorsService.createVendor(req.body), 'Vendor created'); } catch (err) { next(err); }
};

const updateVendor = async (req, res, next) => {
  try {
    const vendor = await vendorsService.updateVendor(req.params.id, req.body);
    success(res, vendor, 'Vendor updated');
  } catch (err) { next(err); }
};

const deleteVendor = async (req, res, next) => {
  try {
    await vendorsService.deleteVendor(req.params.id);
    success(res, null, 'Vendor deleted');
  } catch (err) { next(err); }
};

module.exports = { getAllVendors, getVendorById, createVendor, updateVendor, deleteVendor };
