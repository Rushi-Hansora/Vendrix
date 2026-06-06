const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');
const { generateInvoicePdf } = require('../../services/pdfService');
const { uploadBuffer } = require('../../services/s3Service');
const { logger } = require('../../utils/logger');

const TAX_RATE = 0.18; // 18% GST

const getPendingApprovals = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = { status: 'PENDING' };
  const [approvals, total] = await Promise.all([
    prisma.approval.findMany({
      skip, take, where,
      include: {
        quotation: { include: { rfq: { select: { id: true, title: true } }, vendor: { select: { id: true, name: true } }, items: true } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.approval.count({ where }),
  ]);
  return paginatedResponse(approvals, total, page, limit);
};

const getAllApprovals = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = query.status ? { status: query.status } : {};
  const [approvals, total] = await Promise.all([
    prisma.approval.findMany({
      skip, take, where,
      include: {
        quotation: { include: { rfq: { select: { id: true, title: true } }, vendor: { select: { id: true, name: true } } } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.approval.count({ where }),
  ]);
  return paginatedResponse(approvals, total, page, limit);
};

const getById = async (id) => {
  return prisma.approval.findUnique({
    where: { id },
    include: { quotation: { include: { rfq: true, vendor: true, items: true } }, approver: true },
  });
};

// POST /approvals body: { quotationId, status, remarks }
const processApproval = async ({ quotationId, status, remarks }, approverId) => {
  if (!quotationId || !status) throw Object.assign(new Error('quotationId and status are required'), { status: 400 });
  if (!['APPROVED', 'REJECTED'].includes(status)) throw Object.assign(new Error('status must be APPROVED or REJECTED'), { status: 400 });

  const approval = await prisma.approval.findUnique({ where: { quotationId } });
  if (!approval) throw Object.assign(new Error('Approval record not found for this quotation'), { status: 404 });

  return updateStatus(approval.id, status, approverId, remarks);
};

const updateStatus = async (approvalId, status, approverId, remarks) => {
  const approval = await prisma.approval.update({
    where: { id: approvalId },
    data: { status, approverId, remarks },
    include: { quotation: { include: { items: true } } },
  });

  if (status === 'APPROVED') {
    // Update quotation status
    await prisma.quotation.update({ where: { id: approval.quotationId }, data: { status: 'APPROVED' } });

    // Auto-create Purchase Order
    const quotation = approval.quotation;
    const taxAmount = quotation.totalAmount * TAX_RATE;
    const grandTotal = quotation.totalAmount + taxAmount;

    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { quotationId: quotation.id },
      include: { quotation: { include: { vendor: true, rfq: true, items: true } }, invoice: true },
    });
    const po = existingPO || await prisma.purchaseOrder.create({
      data: {
        quotationId: quotation.id,
        totalAmount: quotation.totalAmount,
        taxAmount,
        grandTotal,
      },
      include: { quotation: { include: { vendor: true, rfq: true, items: true } }, invoice: true },
    });

    if (!po.invoice) {
      let pdfUrl = null;
      try {
        const pdfBuffer = await generateInvoicePdf(po);
        pdfUrl = await uploadBuffer(pdfBuffer, 'application/pdf', 'invoices');
      } catch (err) {
        logger.warn(`Invoice PDF/S3 skipped after approval: ${err.message}`);
      }

      await prisma.invoice.create({
        data: {
          purchaseOrderId: po.id,
          pdfUrl,
        },
      });
    }
  } else if (status === 'REJECTED') {
    await prisma.quotation.update({ where: { id: approval.quotationId }, data: { status: 'REJECTED' } });
  }

  return approval;
};

module.exports = { getPendingApprovals, getAllApprovals, getById, processApproval, updateStatus };
