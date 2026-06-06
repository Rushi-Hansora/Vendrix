const prisma = require('../utils/prisma');

const getAllProducts = async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = { isActive: true };
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: Number(limit), include: { vendor: { select: { companyName: true } } } }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
};

const getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { vendor: { select: { companyName: true, phone: true } }, reviews: { include: { user: { select: { name: true } } } } },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const createProduct = async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) return res.status(403).json({ message: 'Vendor profile required' });

  const { name, description, price, stock, category, imageUrl } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price: Number(price), stock: Number(stock), category, imageUrl, vendorId: vendor.id },
  });
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  const product = await prisma.product.findFirst({ where: { id: req.params.id, vendorId: vendor?.id } });
  if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

  const updated = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  const product = await prisma.product.findFirst({ where: { id: req.params.id, vendorId: vendor?.id } });
  if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Product deleted' });
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
