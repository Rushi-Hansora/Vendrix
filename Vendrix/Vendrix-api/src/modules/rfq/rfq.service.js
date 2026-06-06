const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');

const getAllRFQs = async (user, query) => {
  const { skip, take, page, limit } = paginate(query);
  // VENDORs only see RFQs they are assigned to
  const where = user.role === 'VENDOR'
    ? { vendors: { some: { vendor: { email: user.email } } } }
    : {};
  if (query.status) where.status = query.status;
  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      skip, take, where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
        vendors: { include: { vendor: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rFQ.count({ where }),
  ]);
  return paginatedResponse(rfqs, total, page, limit);
};

const getRFQById = async (id) => {
  return prisma.rFQ.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      items: true,
      vendors: { include: { vendor: true } },
      quotations: { include: { vendor: true, items: true } },
      attachments: true,
    },
  });
};

const createRFQ = async (createdById, data) => {
  const { title, description, deadline, items = [], vendorIds = [] } = data;
  if (!title || !deadline) throw Object.assign(new Error('Title and deadline are required'), { status: 400 });

  return prisma.rFQ.create({
    data: {
      title,
      description,
      deadline: new Date(deadline),
      createdById,
      items: {
        create: items.map(({ productName, quantity, unit, description: desc }) => ({
          productName,
          quantity: parseInt(quantity),
          unit,
          description: desc,
        })),
      },
      vendors: {
        create: vendorIds.map((vendorId) => ({ vendorId })),
      },
    },
    include: { items: true, vendors: { include: { vendor: { select: { id: true, name: true } } } } },
  });
};

const updateRFQ = async (id, data) => {
  const { title, description, deadline, status } = data;
  return prisma.rFQ.update({
    where: { id },
    data: { title, description, deadline: deadline ? new Date(deadline) : undefined, status },
    include: { items: true },
  });
};

const deleteRFQ = async (id) => {
  return prisma.rFQ.delete({ where: { id } });
};

module.exports = { getAllRFQs, getRFQById, createRFQ, updateRFQ, deleteRFQ };
