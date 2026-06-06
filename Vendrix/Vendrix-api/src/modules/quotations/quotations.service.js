const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');

const getAllQuotations = async (user, query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = {};
  if (query.rfqId) where.rfqId = query.rfqId;
  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findFirst({ where: { email: user.email } });
    where.vendorId = vendor?.id;
  }
  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      skip, take, where,
      include: {
        rfq: { select: { id: true, title: true, deadline: true } },
        vendor: { select: { id: true, name: true, email: true } },
        items: true,
        approval: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quotation.count({ where }),
  ]);
  return paginatedResponse(items, total, page, limit);
};

const getQuotationById = async (id) => {
  return prisma.quotation.findUnique({
    where: { id },
    include: { rfq: true, vendor: true, items: true, approval: true, purchaseOrder: true },
  });
};

const createQuotation = async (userEmail, data) => {
  const { rfqId, totalAmount, deliveryDays, notes, items = [] } = data;
  if (!rfqId || !totalAmount || !deliveryDays)
    throw Object.assign(new Error('rfqId, totalAmount and deliveryDays are required'), { status: 400 });

  const vendor = await prisma.vendor.findFirst({ where: { email: userEmail } });
  if (!vendor) throw Object.assign(new Error('Vendor profile not found for your email'), { status: 403 });

  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  if (!rfq) throw Object.assign(new Error('RFQ not found'), { status: 404 });

  const quotation = await prisma.quotation.create({
    data: {
      rfqId,
      vendorId: vendor.id,
      totalAmount: parseFloat(totalAmount),
      deliveryDays: parseInt(deliveryDays),
      notes,
      items: {
        create: items.map(({ productName, quantity, unitPrice }) => ({
          productName,
          quantity: parseInt(quantity),
          unitPrice: parseFloat(unitPrice),
          totalPrice: parseInt(quantity) * parseFloat(unitPrice),
        })),
      },
    },
    include: { items: true, vendor: { select: { id: true, name: true } } },
  });

  // Auto-create a pending approval record
  await prisma.approval.create({
    data: { quotationId: quotation.id, approverId: rfq.createdById },
  });

  return quotation;
};

const updateQuotation = async (id, data) => {
  return prisma.quotation.update({ where: { id }, data: { status: data.status, notes: data.notes } });
};

module.exports = { getAllQuotations, getQuotationById, createQuotation, updateQuotation };
