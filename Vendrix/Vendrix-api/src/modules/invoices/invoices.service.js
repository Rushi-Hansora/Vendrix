const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');
const { generateInvoicePdf } = require('../../services/pdfService');
const { uploadBuffer } = require('../../services/s3Service');
const { sendEmail } = require('../../services/emailService');
const { logger } = require('../../utils/logger');

const getAllInvoices = async (user, query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = {};
  if (query.status) where.status = query.status;
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      skip, take, where,
      include: {
        purchaseOrder: {
          include: {
            quotation: { include: { vendor: { select: { id: true, name: true, email: true } }, rfq: { select: { id: true, title: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ]);
  return paginatedResponse(invoices, total, page, limit);
};

const getInvoiceById = async (id) => {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      purchaseOrder: { include: { quotation: { include: { vendor: true, rfq: true, items: true } } } },
    },
  });
};

const createInvoice = async (data) => {
  const { purchaseOrderId } = data;
  if (!purchaseOrderId) throw Object.assign(new Error('purchaseOrderId is required'), { status: 400 });

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: { quotation: { include: { vendor: true, rfq: true, items: true } }, invoice: true },
  });
  if (!po) throw Object.assign(new Error('Purchase Order not found'), { status: 404 });
  if (po.invoice) throw Object.assign(new Error('Invoice already exists for this PO'), { status: 409 });

  // Generate PDF
  let pdfUrl = null;
  try {
    const pdfBuffer = await generateInvoicePdf(po);
    const s3Key = await uploadBuffer(pdfBuffer, 'application/pdf', 'invoices');
    pdfUrl = s3Key;
  } catch (err) {
    logger.warn(`PDF/S3 skipped: ${err.message}`);
  }

  return prisma.invoice.create({
    data: { purchaseOrderId, pdfUrl },
    include: { purchaseOrder: { include: { quotation: { include: { vendor: true } } } } },
  });
};

const sendInvoiceEmail = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      purchaseOrder: { include: { quotation: { include: { vendor: true, rfq: true } } } },
    },
  });
  if (!invoice) throw Object.assign(new Error('Invoice not found'), { status: 404 });

  const vendor = invoice.purchaseOrder.quotation.vendor;
  const rfq = invoice.purchaseOrder.quotation.rfq;

  const html = `
    <h2>Invoice from Vendrix</h2>
    <p>Dear ${vendor.name},</p>
    <p>Please find your invoice for RFQ: <strong>${rfq.title}</strong>.</p>
    <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
    <p><strong>PO Number:</strong> ${invoice.purchaseOrder.poNumber}</p>
    <p><strong>Total Amount:</strong> ₹${invoice.purchaseOrder.totalAmount.toFixed(2)}</p>
    <p><strong>Tax (18% GST):</strong> ₹${invoice.purchaseOrder.taxAmount.toFixed(2)}</p>
    <p><strong>Grand Total:</strong> ₹${invoice.purchaseOrder.grandTotal.toFixed(2)}</p>
    <p>Status: ${invoice.status}</p>
    <br/><p>Thank you for your business.</p>
    <p>– Vendrix Team</p>
  `;

  await sendEmail({
    to: vendor.email,
    subject: `Invoice ${invoice.invoiceNumber} – ${rfq.title}`,
    html,
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { emailSent: true, status: 'SENT' },
  });

  return { invoiceId, sentTo: vendor.email };
};

const updateStatus = async (id, status) => {
  return prisma.invoice.update({ where: { id }, data: { status } });
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, sendInvoiceEmail, updateStatus };
