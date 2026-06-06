const prisma = require('../utils/prisma');

const createInvoice = async (req, res) => {
  const { orderId, dueDate } = req.body;
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) return res.status(403).json({ message: 'Vendor profile required' });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const invoice = await prisma.invoice.create({
    data: { orderId, vendorId: vendor.id, amount: order.totalPrice, dueDate: dueDate ? new Date(dueDate) : null },
  });
  res.status(201).json(invoice);
};

const getMyInvoices = async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  const invoices = await prisma.invoice.findMany({
    where: { vendorId: vendor?.id },
    include: { order: { include: { buyer: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(invoices);
};

const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status, paidAt: status === 'PAID' ? new Date() : null },
  });
  res.json(invoice);
};

module.exports = { createInvoice, getMyInvoices, updateInvoiceStatus };
