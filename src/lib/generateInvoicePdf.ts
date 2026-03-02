import jsPDF from 'jspdf';

const AUD = (n: number) => `$${(n || 0).toFixed(2)}`;

export function generateInvoicePdf(order: any) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, margin = 18;
    let y = 0;

    // ── Header band ──────────────────────────────────────────────────────────
    doc.setFillColor(15, 52, 88); // dark navy
    doc.rect(0, 0, W, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('SURE SEAL SEALANTS', margin, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Premium Construction Sealants & Cleaners', margin, 22);
    doc.text('www.sureseal.com.au  |  info@sureseal.com.au  |  1800 SURESEAL', margin, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(100, 200, 255);
    doc.text('TAX INVOICE', W - margin, 18, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(200, 220, 255);
    doc.text(`Invoice #${order.orderNumber ?? order.id?.slice(-6) ?? 'N/A'}`, W - margin, 26, { align: 'right' });
    doc.text(new Date(order.createdAt).toLocaleDateString('en-AU', { dateStyle: 'long' }), W - margin, 32, { align: 'right' });

    y = 52;

    // ── Bill To / Sold By ─────────────────────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, y, 80, 36, 3, 3, 'F');
    doc.roundedRect(W / 2 + 3, y, 80, 36, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 110);
    doc.text('BILL TO', margin + 4, y + 7);
    doc.text('SOLD BY', W / 2 + 7, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 30);
    doc.text(order.customerName || 'N/A', margin + 4, y + 14);
    doc.text(order.userName || 'Sure Seal Rep', W / 2 + 7, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 90);
    if (order.customerAddress) doc.text(order.customerAddress, margin + 4, y + 20, { maxWidth: 70 });
    if (order.customerPhone) doc.text(`Ph: ${order.customerPhone}`, margin + 4, y + 30);
    if (order.customerEmail) doc.text(order.customerEmail, W / 2 + 7, y + 20);

    y += 46;

    // ── Items table ───────────────────────────────────────────────────────────
    const colX = { desc: margin, sku: margin + 75, qty: margin + 115, unit: margin + 135, total: W - margin };
    const rowH = 9;

    // Table header
    doc.setFillColor(15, 52, 88);
    doc.rect(margin, y, W - margin * 2, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION', colX.desc + 2, y + 6);
    doc.text('SKU', colX.sku, y + 6);
    doc.text('QTY', colX.qty, y + 6);
    doc.text('UNIT PRICE', colX.unit, y + 6);
    doc.text('TOTAL', colX.total, y + 6, { align: 'right' });

    y += rowH;

    const items: any[] = order.items || [];
    items.forEach((item: any, i: number) => {
        const isEven = i % 2 === 0;
        doc.setFillColor(isEven ? 252 : 246, isEven ? 252 : 248, isEven ? 255 : 250);
        doc.rect(margin, y, W - margin * 2, rowH, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 20, 30);
        const name = `${item.product?.name || 'Product'} — ${item.variant?.name || ''}`;
        doc.text(name, colX.desc + 2, y + 6, { maxWidth: 70 });
        doc.text(item.variant?.sku || '—', colX.sku, y + 6);
        doc.text(String(item.quantity || 1), colX.qty, y + 6);
        doc.text(AUD(item.variant?.price || 0), colX.unit, y + 6);
        doc.text(AUD((item.variant?.price || 0) * (item.quantity || 1)), colX.total, y + 6, { align: 'right' });
        y += rowH;
    });

    // Bottom rule
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
    y += 6;

    // ── Totals ────────────────────────────────────────────────────────────────
    const totX = W - margin - 55;
    const labelX = W - margin - 80;
    const addTotal = (label: string, val: number, bold = false, highlight = false) => {
        if (highlight) {
            doc.setFillColor(15, 52, 88);
            doc.rect(labelX - 4, y - 5, W - margin - labelX + 4, 9, 'F');
            doc.setTextColor(255, 255, 255);
        } else {
            doc.setTextColor(60, 60, 70);
        }
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(bold ? 9.5 : 8.5);
        doc.text(label, labelX, y);
        doc.text(AUD(val), W - margin, y, { align: 'right' });
        y += 8;
        doc.setTextColor(60, 60, 70);
    };

    addTotal('Subtotal (ex. GST)', order.subtotal || 0);
    if (order.discount > 0) addTotal(`Discount (${order.discountPct ?? ''}%)`, -(order.discount || 0));
    addTotal('GST (10%)', order.tax || 0);
    addTotal('TOTAL DUE (AUD)', order.grandTotal || 0, true, true);

    y += 4;

    // ── Pricing level note ────────────────────────────────────────────────────
    if (order.pricingLevelId && order.pricingLevelId !== 'retail') {
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 130);
        doc.setFont('helvetica', 'italic');
        doc.text(`Pricing level: ${order.pricingLevelId}  ·  ABN: 12 345 678 901`, margin, y);
        y += 6;
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setFillColor(240, 243, 248);
    doc.rect(0, 275, W, 22, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 125);
    doc.text('Thank you for your business!  ·  Payment terms: 30 days EOM  ·  BSB: 063-000  Acc: 1234 5678', W / 2, 282, { align: 'center' });
    doc.text('Sure Seal Sealants Pty Ltd  ·  ABN: 12 345 678 901  ·  This document serves as a valid tax invoice.', W / 2, 288, { align: 'center' });

    doc.save(`SureSeal-Invoice-${order.orderNumber ?? order.id?.slice(-6)}.pdf`);
}
