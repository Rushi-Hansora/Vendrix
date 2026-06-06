const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');

const getAllVendors = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = query.status ? { status: query.status } : {};
  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({ skip, take, where, orderBy: { createdAt: 'desc' } }),
    prisma.vendor.count({ where }),
  ]);
  return paginatedResponse(vendors, total, page, limit);
};

const getVendorById = async (id) => {
  return prisma.vendor.findUnique({
    where: { id },
    include: { quotations: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });
};

const createVendor = async (data) => {
  const { name, email, phone, gstNumber, category, address, status } = data;
  if (!name || !email) throw Object.assign(new Error('Name and email are required'), { status: 400 });
  const existing = await prisma.vendor.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Vendor with this email already exists'), { status: 409 });
  return prisma.vendor.create({ data: { name, email, phone, gstNumber, category, address, status } });
};

const updateVendor = async (id, data) => {
  const { name, email, phone, gstNumber, category, address, status, rating } = data;
  return prisma.vendor.update({
    where: { id },
    data: { name, email, phone, gstNumber, category, address, status, rating },
  });
};

const deleteVendor = async (id) => {
  return prisma.vendor.delete({ where: { id } });
};

const getByEmail = async (email) => {
  return prisma.vendor.findUnique({ where: { email } });
};

module.exports = { getAllVendors, getVendorById, createVendor, updateVendor, deleteVendor, getByEmail };
