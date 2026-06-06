const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');

const TAX_RATE = 0.18;

const getAllPOs = async (user, query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = {};
  if (query.status) where.status = query.status;
  const [orders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      skip, take, where,
      include: {
        quotation: { include: { vendor: { select: { id: true, name: true, email: true } }, rfq: { select: { id: true, title: true } } } },
        invoice: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);
  return paginatedResponse(orders, total, page, limit);
};

const getPOById = async (id) => {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      quotation: { include: { vendor: true, rfq: true, items: true } },
      invoice: true,
    },
  });
};

// Manually create PO from a quotation (quotationId required in body)
const createPO = async (userId, data) => {
  const { quotationId, taxRate } = data;
  if (!quotationId) throw Object.assign(new Error('quotationId is required'), { status: 400 });

  const quotation = await prisma.quotation.findUnique({ where: { id: quotationId }, include: { items: true } });
  if (!quotation) throw Object.assign(new Error('Quotation not found'), { status: 404 });
  if (quotation.status !== 'APPROVED') throw Object.assign(new Error('Quotation must be APPROVED before creating a PO'), { status: 400 });

  const existingPO = await prisma.purchaseOrder.findUnique({ where: { quotationId } });
  if (existingPO) throw Object.assign(new Error('PO already exists for this quotation'), { status: 409 });

  const rate = parseFloat(taxRate) || TAX_RATE;
  const totalAmount = quotation.totalAmount;
  const taxAmount = totalAmount * rate;
  const grandTotal = totalAmount + taxAmount;

  return prisma.purchaseOrder.create({
    data: { quotationId, totalAmount, taxAmount, grandTotal },
    include: { quotation: { include: { vendor: true, rfq: true } } },
  });
};

const updateStatus = async (id, status) => {
  return prisma.purchaseOrder.update({ where: { id }, data: { status } });
};

module.exports = { getAllPOs, getPOById, createPO, updateStatus };
