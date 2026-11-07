import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  KeyRound, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  UserPlus,
  X 
} from 'lucide-react';
import { ClinicLicense, UserAccount } from '../types/clinic';
import { MOCK_LICENSE } from '../data/mockData';

interface LicensingViewProps {
  currentUser: UserAccount;
  license: ClinicLicense;
  onUpgradeLicense: (updated: ClinicLicense) => void;
}

export const LicensingView: React.FC<LicensingViewProps> = ({
  currentUser,
  license,
  onUpgradeLicense
}) => {
  const isOwner = currentUser.role === 'owner';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradedToast, setUpgradedToast] = useState<string | null>(null);

  const handleSimulateAddAccountantSeat = () => {
    // REQ-LIC-005 & ACC-005: Adding an accountant seat via signed license revision
    // WITHOUT touching or altering any patient or financial data!
    const updated: ClinicLicense = {
      ...license,
      max_active_users: license.max_active_users + 1,
      max_registered_devices: license.max_registered_devices + 1,
      license_revision: license.license_revision + 1,
      signature: `SIG_ED25519_rev${license.license_revision + 1}_${Math.random().toString(16).substring(2)}`
    };

    onUpgradeLicense(updated);
    setShowUpgradeModal(false);
    setUpgradedToast(
      `تمت ترقية الترخيص بنجاح إلى الإصدار (Revision ${updated.license_revision}). تمت إضافة مقعد مستخدم جديد دون أي مساس ببيانات المرضى (REQ-LIC-005).`
    );
    setTimeout(() => setUpgradedToast(null), 6000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">إدارة التراخيص والمقاعد التجارية (Offline Licensing)</h2>
          <p className="text-xs text-slate-500">
            تراخيص مشفرة وموقعة رقمياً مستقلة تماماً عن بيانات المرضى وسجلاتهم الطبية
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3.5 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>ترقية المقاعد / إضافة محاسب (REQ-LIC-005)</span>
          </button>
        )}
      </div>

      {upgradedToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{upgradedToast}</span>
        </div>
      )}

      {/* License Summary Banner */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{license.clinic_name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                  {license.plan_name_ar}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                License ID: {license.license_id} · Revision: #{license.license_revision}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left font-mono text-xs">
              <span className="text-slate-400 block text-[10px]">تاريخ السريان:</span>
              <span className="font-bold text-slate-700">{license.valid_from} إلى {license.valid_until || 'دائم'}</span>
            </div>
          </div>
        </div>

        {/* Capacity / Seats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Users Seat */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 block">المستخدمون النشطون (Active Users):</span>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              3 / {license.max_active_users} مقاعد
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-[#0F766E] h-full rounded-full transition-all"
                style={{ width: `${(3 / license.max_active_users) * 100}%` }}
              />
            </div>
          </div>

          {/* Registered Devices */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 block">الأجهزة المسجلة (Registered Devices):</span>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              4 / {license.max_registered_devices} أجهزة
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{ width: `${(4 / license.max_registered_devices) * 100}%` }}
              />
            </div>
          </div>

          {/* Doctors */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 block">الأطباء الممارسون (Doctors):</span>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              2 / {license.max_doctors} أطباء
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* Enabled Modules */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700">الوحدات والاختصاصات المفعلة في الباقة (Modules):</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {license.enabled_modules.map(mod => (
              <span key={mod} className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[11px]">
                ✓ {mod}
              </span>
            ))}
          </div>
        </div>

        {/* Cryptographic Signature details */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
          <div className="text-slate-400">التوقيع الرقمي للترخيص (Ed25519 Issuer Signature):</div>
          <div className="break-all text-slate-800">{license.signature}</div>
          <div className="text-emerald-700 font-sans text-[10px] font-medium pt-1">
            ✓ التوقيع موثق بمفتاح المصدر التجاري المستقل (Issuer Key Verified Offline)
          </div>
        </div>
      </div>

      {/* Upgrade Simulation Modal (Demonstrating REQ-LIC-005 & ACC-005) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                ترقية المقاعد وإضافة محاسب (REQ-LIC-005)
              </h3>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                وفقاً لمتطلب القبول التجاري <strong>ACC-005</strong>:
                يرغب الطبيب المالك في إضافة محاسب للعيادة دون التأثير على بيانات المرضى أو إعادة تثبيت التطبيق.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="text-slate-500">الإصدار الحالي: <span className="font-bold text-slate-800">Rev #{license.license_revision} (3 مقاعد)</span></div>
                <div className="text-emerald-700 font-bold">الإصدار بعد الترقية: Rev #{license.license_revision + 1} (4 مقاعد)</div>
              </div>
              <p className="text-[11px] text-slate-500">
                يقوم محرك التراخيص بتطبيق شهادة الترخيص الموقعة الجديدة، وتحديث الاستحقاقات في جدول <code>license_certificates</code> فقط، مع بقاء ملفات وسجلات المرضى دون أدنى تعديل.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSimulateAddAccountantSeat}
                className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white text-xs font-medium shadow-sm"
              >
                تطبيق الترقية الفورية (Apply Upgrade)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
