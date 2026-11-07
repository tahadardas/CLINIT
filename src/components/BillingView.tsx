import React, { useState } from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  Download, 
  FileText, 
  Lock, 
  Plus, 
  Printer, 
  Receipt, 
  ShieldAlert, 
  X 
} from 'lucide-react';
import { Invoice, PaymentRecord, UserAccount } from '../types/clinic';
import { canViewFinancialProfits, hasPermission } from '../domain/permissions';
import { formatCurrency } from '../domain/billing';

interface BillingViewProps {
  invoices: Invoice[];
  payments: PaymentRecord[];
  currentUser: UserAccount;
  onAddPayment: (payment: PaymentRecord) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  invoices,
  payments,
  currentUser,
  onAddPayment
}) => {
  const canSeeProfits = canViewFinancialProfits(currentUser.role);
  const canCreatePayment = hasPermission(currentUser.role, 'invoices_payments', 'create');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(202.5);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('card');
  const [showReceiptModal, setShowReceiptModal] = useState<PaymentRecord | null>(null);

  // Financial aggregates
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.grand_total, 0);
  const totalCollected = payments.reduce((acc, pay) => acc + pay.amount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoice_id: selectedInvoice.id,
      patient_id: selectedInvoice.patient_id,
      patient_name: selectedInvoice.patient_name,
      amount: paymentAmount,
      payment_method: paymentMethod,
      paid_at: new Date().toISOString(),
      receipt_no: `REC-2026-00${payments.length + 91}`,
      cashier_name: currentUser.name,
      idempotency_key: `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'committed'
    };

    onAddPayment(newPayment);
    setShowCollectModal(false);
    setShowReceiptModal(newPayment);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Financial Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">إدارة الفواتير والتحصيل المالي</h2>
          <p className="text-xs text-slate-500">
            حسابات دقيقة بوحدات صغرى (Minor Units) وسندات قبض إلكترونية موثقة
          </p>
        </div>

        {selectedInvoice && selectedInvoice.status !== 'paid' && canCreatePayment && (
          <button
            type="button"
            onClick={() => {
              setPaymentAmount(selectedInvoice.grand_total - selectedInvoice.paid_amount);
              setShowCollectModal(true);
            }}
            className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>تسجيل سند قبض ودفع للمريض</span>
          </button>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">إجمالي الفواتير الصادرة:</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalBilled, 'SAR')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">{invoices.length} فواتير معتمدة</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">إجمالي المبالغ المحصلة فعلياً:</span>
          {canSeeProfits ? (
            <>
              <div className="text-xl font-bold text-emerald-600 font-mono tabular-nums">
                {formatCurrency(totalCollected, 'SAR')}
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block">في صندوق العيادة والحساب البنكي</span>
            </>
          ) : (
            <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>محجوب بموجب صلاحيات الاستقبال (REQ-FIN-004)</span>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">الرصيد المتبقي ذمم على المرضى:</span>
          <div className="text-xl font-bold text-amber-600 font-mono tabular-nums">
            {formatCurrency(totalOutstanding, 'SAR')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">مستحقات سداد قادمة</span>
        </div>
      </div>

      {/* Invoices List & Invoice Document Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Invoices Table (Left 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#DCE5E9] p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700 border-b border-slate-100 pb-2">
            قائمة الفواتير المعتمدة ({invoices.length})
          </h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {invoices.map(inv => {
              const isSelected = selectedInvoice?.id === inv.id;
              const isPaid = inv.status === 'paid';
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => setSelectedInvoice(inv)}
                  className={`w-full text-right p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                    isSelected 
                      ? 'border-[#0F766E] bg-[#E7F5F3] shadow-sm' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inv.patient_name}</span>
                    <span className="font-mono text-teal-800 font-bold">{inv.invoice_no}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>المبلغ الكلي: {formatCurrency(inv.grand_total, 'SAR')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isPaid ? 'مسددة بالكامل' : 'سداد جزئي / متبقي'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    تاريخ الإصدار: {inv.issued_at.slice(0, 10)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Invoice Details / Bill Document (Right 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#DCE5E9] p-6 shadow-sm space-y-6">
          {selectedInvoice ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">فاتورة ضريبية رسمية</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    رقم الفاتورة: {selectedInvoice.invoice_no} · تاريخ: {selectedInvoice.issued_at.slice(0, 10)}
                  </div>
                </div>
                <div className="text-left">
                  <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                    selectedInvoice.status === 'paid' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedInvoice.status === 'paid' ? 'مسددة بالكامل' : 'دفعة جزئية مستحقة'}
                  </span>
                </div>
              </div>

              {/* Patient and Clinic Header */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">المريض:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.patient_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">المنشأة الطبية:</span>
                  <span className="font-medium text-slate-800">عيادات النخبة لطب الأسنان</span>
                </div>
              </div>

              {/* Invoice Lines Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">البيان / الخدمة الطبية</th>
                      <th className="py-2.5 px-3 text-center">الكمية</th>
                      <th className="py-2.5 px-3 text-left">سعر الوحدة</th>
                      <th className="py-2.5 px-3 text-left">الخصم</th>
                      <th className="py-2.5 px-3 text-left">الإجمالي الصافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedInvoice.lines.map(line => (
                      <tr key={line.id}>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{line.description}</td>
                        <td className="py-2.5 px-3 text-center">{line.quantity}</td>
                        <td className="py-2.5 px-3 text-left">{formatCurrency(line.unit_price, '')}</td>
                        <td className="py-2.5 px-3 text-left text-red-600">{formatCurrency(line.discount, '')}</td>
                        <td className="py-2.5 px-3 text-left font-bold text-slate-900">{formatCurrency(line.total, '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals Breakdown */}
              <div className="space-y-1.5 text-xs font-mono max-w-xs mr-auto pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-sans">المجموع الفرعي:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal, 'SAR')}</span>
                </div>
                {selectedInvoice.discount_total > 0 && (
                  <div className="flex items-center justify-between text-red-600">
                    <span className="font-sans">الخصم المعتمد:</span>
                    <span>- {formatCurrency(selectedInvoice.discount_total, 'SAR')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-sans">ضريبة القيمة المضافة (15% VAT):</span>
                  <span>{formatCurrency(selectedInvoice.tax_total, 'SAR')}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                  <span className="font-sans">الإجمالي النهائي المستحق:</span>
                  <span>{formatCurrency(selectedInvoice.grand_total, 'SAR')}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span className="font-sans">المبلغ المسدد:</span>
                  <span>{formatCurrency(selectedInvoice.paid_amount, 'SAR')}</span>
                </div>
                <div className="flex items-center justify-between text-amber-700 font-bold">
                  <span className="font-sans">المتبقي المطلوب:</span>
                  <span>{formatCurrency(selectedInvoice.grand_total - selectedInvoice.paid_amount, 'SAR')}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الفاتورة الضريبية</span>
                </button>

                {selectedInvoice.status !== 'paid' && canCreatePayment && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount(selectedInvoice.grand_total - selectedInvoice.paid_amount);
                      setShowCollectModal(true);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>تحصيل المتبقي ({formatCurrency(selectedInvoice.grand_total - selectedInvoice.paid_amount, 'SAR')})</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              اختر فاتورة لعرض تفاصيلها.
            </div>
          )}
        </div>
      </div>

      {/* Collect Payment Modal (REQ-FIN-003 & REQ-FIN-006) */}
      {showCollectModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">تسجيل سند قبض ودفع للمريض</h3>
              <button
                type="button"
                onClick={() => setShowCollectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-600">المريض: <strong className="text-slate-900">{selectedInvoice.patient_name}</strong></div>
                <div className="text-slate-600">الفاتورة: <span className="font-mono">{selectedInvoice.invoice_no}</span></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">المبلغ المطلوب تحصيله (SAR):</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">طريقة الدفع:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="card">شبكة / بطاقة مدى / ائتمان (Mada / POS)</option>
                  <option value="cash">نقداً (Cash)</option>
                  <option value="bank_transfer">تحويل بنكي مباشر</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-400">
                يتم توليد مفتاح تفرد idempotency key لحماية المعاملة من التكرار عند انقطاع الشبكة (REQ-FIN-003).
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white font-medium shadow-sm"
                >
                  تأكيد وإصدار السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">تم تسجيل سند القبض بنجاح</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-right space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-slate-500">رقم السند:</span>
                <span className="font-bold text-slate-800">{showReceiptModal.receipt_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-500">المبلغ المقبوض:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(showReceiptModal.amount, 'SAR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-500">المستلم:</span>
                <span className="font-sans text-slate-800">{showReceiptModal.cashier_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-medium"
              >
                تم الإغلاق
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة السند</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
