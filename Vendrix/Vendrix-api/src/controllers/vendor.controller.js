const prisma = require('../utils/prisma');

const createOrUpdateVendorProfile = async (req, res) => {
  const { companyName, description, phone, address } = req.body;

  const vendor = await prisma.vendor.upsert({
    where: { userId: req.user.id },
    update: { companyName, description, phone, address },
    create: { userId: req.user.id, companyName, description, phone, address },
  });
  res.json(vendor);
};

const getVendorProfile = async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: req.params.id },
    include: { products: { where: { isActive: true } } },
  });
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json(vendor);
};

const getMyVendorProfile = async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
    include: { products: true },
  });
  if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
  res.json(vendor);
};

const getAllVendors = async (req, res) => {
  const vendors = await prisma.vendor.findMany({
    where: { isVerified: true },
    select: { id: true, companyName: true, description: true, address: true },
  });
  res.json(vendors);
};

module.exports = { createOrUpdateVendorProfile, getVendorProfile, getMyVendorProfile, getAllVendors };
