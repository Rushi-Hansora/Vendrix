const prisma = require('../../config/db');

const getSummary = async () => {
  const [totalUsers, totalVendors, totalRFQs, totalPOs, totalInvoices, paidInvoices, pendingApprovals] = await Promise.all([
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.rFQ.count(),
    prisma.purchaseOrder.count(),
    prisma.invoice.count(),
    prisma.purchaseOrder.aggregate({
      where: { invoice: { status: 'PAID' } },
      _sum: { grandTotal: true },
    }),
    prisma.approval.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    totalUsers,
    totalVendors,
    totalRFQs,
    totalPOs,
    totalInvoices,
    totalSpend: paidInvoices._sum.grandTotal || 0,
    pendingApprovals,
  };
};

const getVendorReport = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw Object.assign(new Error('Vendor not found'), { status: 404 });

  const [quotations, purchaseOrders] = await Promise.all([
    prisma.quotation.findMany({
      where: { vendorId },
      select: { id: true, totalAmount: true, status: true, createdAt: true, rfq: { select: { title: true } } },
    }),
    prisma.purchaseOrder.findMany({
      where: { quotation: { vendorId } },
      select: { id: true, poNumber: true, grandTotal: true, status: true, createdAt: true },
    }),
  ]);

  const totalSpend = purchaseOrders
    .filter((po) => po.status !== 'CANCELLED')
    .reduce((sum, po) => sum + po.grandTotal, 0);

  return { vendor, quotations, purchaseOrders, totalSpend };
};

module.exports = { getSummary, getVendorReport };
