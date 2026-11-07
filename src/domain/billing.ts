import { InvoiceLine } from '../types/clinic';

/**
 * Monetary calculations in minor units (cents / halalas / piasters) to prevent
 * floating-point rounding errors (REQ-FIN-006).
 */
export function calculateLineTotalMinor(quantity: number, unitPrice: number, discount: number = 0): number {
  const qtyMinor = Math.round(quantity * 100);
  const priceMinor = Math.round(unitPrice * 100);
  const discMinor = Math.round(discount * 100);

  // totalMinor = (qty * price) - discount
  const gross = Math.round((qtyMinor * priceMinor) / 10000);
  const net = Math.max(0, gross - Math.round(discMinor / 100));
  return net;
}

export function calculateInvoiceTotals(lines: InvoiceLine[], taxRatePercent: number = 0) {
  let subtotalMinor = 0;
  let discountMinor = 0;

  for (const line of lines) {
    const lineGross = Math.round(line.quantity * line.unit_price * 100);
    const lineDisc = Math.round((line.discount || 0) * 100);
    subtotalMinor += lineGross;
    discountMinor += lineDisc;
  }

  const taxableMinor = Math.max(0, subtotalMinor - discountMinor);
  const taxMinor = Math.round((taxableMinor * taxRatePercent) / 100);
  const grandTotalMinor = taxableMinor + taxMinor;

  return {
    subtotal: subtotalMinor / 100,
    discount_total: discountMinor / 100,
    tax_total: taxMinor / 100,
    grand_total: grandTotalMinor / 100
  };
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  // English numerals as required by SRS REQ-UX-002
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
