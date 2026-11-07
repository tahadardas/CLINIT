import React, { useState } from 'react';
import { 
  Check, 
  FolderLock, 
  Info, 
  Lock, 
  RotateCcw, 
  Save, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  X 
} from 'lucide-react';
import { UserAccount, UserRole } from '../types/clinic';
import { PERMISSION_MATRIX } from '../domain/permissions';

interface PermissionsViewProps {
  currentUser: UserAccount;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({ currentUser }) => {
  const isOwner = currentUser.role === 'owner';

  const [selectedRole, setSelectedRole] = useState<UserRole>('receptionist');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const roleLabels: Record<UserRole, { title: string; desc: string }> = {
    owner: { title: 'طبيب مالك العيادة (Owner)', desc: 'كامل الصلاحيات الإدارية والسريرية والترخيص' },
    doctor: { title: 'طبيب ممارس (Doctor)', desc: 'صلاحيات سريرية كاملة وفحص الأسنان دون إدارة النظام' },
    receptionist: { title: 'موظف استقبال (Receptionist)', desc: 'إدارة المواعيد والتحصيل مع حجب التاريخ الطبي السري' },
    accountant: { title: 'محاسب مالي (Accountant)', desc: 'إدارة القيود والفواتير دون الاطلاع على السجلات السريرية' },
    clinic_manager: { title: 'مدير العيادة (Clinic Manager)', desc: 'إشراف عام على سير العمل والتقارير' }
  };

  const matrixSections = [
    {
      title: 'السجلات الطبية والملفات الحساسة (Protected Health Information - PHI)',
      desc: 'حماية خصوصية المريض وفق REQ-AUTH-009 — حظر إفراط نسخ البيانات',
      rules: [
        { resource: 'patient_demographics', action: 'view', label: 'الاطلاع على بيانات الاتصال والاسم ورقم الملف' },
        { resource: 'patient_demographics', action: 'create', label: 'تسجيل مريض جديد وفتح ملف' },
        { resource: 'patient_clinical_phi', action: 'view', label: 'الاطلاع على التاريخ المرضي والحساسية والأمراض المزمنة' },
        { resource: 'patient_clinical_phi', action: 'edit', label: 'تعديل التشخيصات السريرية والملاحظات' },
        { resource: 'dental_odontogram', action: 'view', label: 'عرض مخطط الأسنان التفاعلي (FDI)' },
        { resource: 'dental_odontogram', action: 'edit', label: 'تسجيل حالات ونخر ومعالجات على الأسنان' }
      ]
    },
    {
      title: 'إدارة المواعيد والجدول والعيادات',
      desc: 'تنظيم حركة المرضى وطابور الانتظار وتنسيق الكراسي',
      rules: [
        { resource: 'appointments_calendar', action: 'view', label: 'عرض تقويم المواعيد اليومية والأسبوعية' },
        { resource: 'appointments_calendar', action: 'create', label: 'حجز موعد جديد وكشف التعارضات' },
        { resource: 'appointments_calendar', action: 'edit', label: 'تغيير حالة الموعد (وصل / بالانتظار / اكتمل)' }
      ]
    },
    {
      title: 'المالية والحسابات وأرباح العيادة',
      desc: 'فصل الصلاحيات المالية وفق REQ-FIN-004 — حجب نسب الأرباح عن الاستقبال',
      rules: [
        { resource: 'invoices_payments', action: 'view', label: 'الاطلاع على فواتير المرضى والمبالغ المستحقة' },
        { resource: 'invoices_payments', action: 'create', label: 'تحصيل دفعات وإصدار سندات قبض رسمية' },
        { resource: 'financial_profit_reports', action: 'view', label: 'الاطلاع على تقارير صافي أرباح العيادة وتكاليف المواد' }
      ]
    },
    {
      title: 'إدارة النظام والترخيص والأجهزة والنسخ',
      desc: 'حقوق سيادية خاصة بالطبيب مالك العيادة فقط',
      rules: [
        { resource: 'users_roles_management', action: 'edit', label: 'إضافة وتعديل حسابات المستخدمين وصلاحياتهم' },
        { resource: 'devices_management', action: 'edit', label: 'ربط وإلغاء ثقة أجهزة التابلت والكمبيوتر على LAN' },
        { resource: 'licensing_entitlements', action: 'edit', label: 'تفعيل وترقية رخص العيادة والمقاعد' },
        { resource: 'backup_restore', action: 'create', label: 'أخذ نسخة احتياطية مشفرة واستعادتها (.clinicbak)' }
      ]
    }
  ];

  const handleSimulateSave = () => {
    setToastMessage('تم تحديث مصفوفة الصلاحيات وبث السياسة الموقعة Policy Revision إلى كافة أجهزة العيادة بنجاح.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">مصفوفة الصلاحيات الدقيقة (Granular RBAC Matrix)</h2>
          <p className="text-xs text-slate-500">
            تطبيق مبدأ المنع الافتراضي (Deny-by-default) والتحكم المستقل لكل شاشة وحقل ومستخدم
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={handleSimulateSave}
            className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3.5 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وبث السياسة الموقعة للأجهزة (Publish Policy)</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="bg-white p-2 rounded-xl border border-[#DCE5E9] shadow-sm flex flex-wrap gap-2 text-xs">
        {(Object.keys(roleLabels) as UserRole[]).map(role => {
          const isSelected = selectedRole === role;
          const info = roleLabels[role];
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-right flex-1 min-w-[140px] ${
                isSelected 
                  ? 'bg-[#164E63] text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <div className="font-bold text-xs truncate">{info.title}</div>
              <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-teal-200' : 'text-slate-500'}`}>
                {info.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="space-y-4">
        {matrixSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#DCE5E9] overflow-hidden shadow-sm">
            <div className="p-3.5 bg-slate-50 border-b border-[#DCE5E9]">
              <h3 className="font-bold text-xs text-slate-900">{section.title}</h3>
              <p className="text-[11px] text-slate-500">{section.desc}</p>
            </div>

            <div className="divide-y divide-slate-100">
              {section.rules.map((rule, rIdx) => {
                const ruleInMatrix = PERMISSION_MATRIX.find(
                  r => r.resource === rule.resource && r.action === rule.action
                );
                const isAllowed = ruleInMatrix?.allowedRoles.includes(selectedRole);

                return (
                  <div key={rIdx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800">{rule.label}</span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        resource: {rule.resource} · action: {rule.action}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded font-medium ${
                        isAllowed 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {isAllowed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>مسموح (Permit)</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-red-600" />
                            <span>محجوب وممنوع (Deny)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
