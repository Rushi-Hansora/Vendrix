const PDFDocument = require('pdfkit');
const { logger } = require('../utils/logger');

const generateInvoicePdf = (po) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const vendor = po.quotation?.vendor;
      const rfq = po.quotation?.rfq;

      doc.fontSize(22).text('INVOICE', { align: 'center' }).moveDown();
      doc.fontSize(12)
        .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
        .text(`PO Number: ${po.poNumber}`)
        .moveDown();

      if (vendor) {
        doc.text('Vendor:').text(`  ${vendor.name}`).text(`  ${vendor.email}`);
        if (vendor.gstNumber) doc.text(`  GST: ${vendor.gstNumber}`);
        doc.moveDown();
      }
      if (rfq) {
        doc.text(`RFQ: ${rfq.title}`).moveDown();
      }

      // Items table
      if (po.quotation?.items?.length) {
        doc.text('Items:', { underline: true }).moveDown(0.5);
        po.quotation.items.forEach((item, i) => {
          doc.text(`${i + 1}. ${item.productName}  x${item.quantity}  @₹${item.unitPrice}  = ₹${item.totalPrice}`);
        });
        doc.moveDown();
      }

      doc
        .text(`Subtotal: ₹${po.totalAmount.toFixed(2)}`)
        .text(`Tax (18% GST): ₹${po.taxAmount.toFixed(2)}`)
        .text(`Grand Total: ₹${po.grandTotal.toFixed(2)}`, { bold: true })
        .moveDown()
        .text('Thank you for your business!', { align: 'center' });

      doc.end();
    } catch (err) {
      logger.error(`PDF generation error: ${err.message}`);
      reject(err);
    }
  });
};

module.exports = { generateInvoicePdf };
