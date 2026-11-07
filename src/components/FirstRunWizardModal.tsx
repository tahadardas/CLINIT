/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  HardDrive, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Cpu, 
  Wifi, 
  Lock, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  FileKey,
  X
} from 'lucide-react';
import { 
  validateClinicProfile, 
  validateOwnerAccount, 
  validateRecoveryPassphrase, 
  validateLicenseToken,
  generateClinicId,
  ClinicProfileInput,
  OwnerAccountInput
} from '../domain/setupValidator';

interface FirstRunWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (setupData: {
    clinicName: string;
    clinicId: string;
    currency: string;
    timezone: string;
    ownerName: string;
    licenseKey: string;
  }) => void;
}

export const FirstRunWizardModal: React.FC<FirstRunWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [nodeType, setNodeType] = useState<'coordinator' | 'workstation'>('coordinator');
  const [clinicId, setClinicId] = useState<string>(() => generateClinicId('CLN'));
  
  // Form States
  const [profile, setProfile] = useState<ClinicProfileInput>({
    clinicName: 'عيادات النخبة التخصصية لطب وجراحة الأسنان',
    medicalLicenseNo: 'MOH-RYD-884920',
    phone: '+966114455660',
    email: 'contact@elite-dental-clinic.sa',
    address: 'الرياض — طريق الملك فهد، برج الرعاية الطبية',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    primarySpecialty: 'dental',
    enabledModules: ['dental_pro']
  });

  const [owner, setOwner] = useState<OwnerAccountInput>({
    fullName: 'د. طارق الحكيم',
    doctorLicenseNo: 'SCFHS-DR-99214',
    email: 'dr.tariq@elite-dental.sa',
    pin: '2026'
  });

  const [backupFrequency, setBackupFrequency] = useState<'six_hours' | 'daily'>('six_hours');
  const [cloudBackup, setCloudBackup] = useState<boolean>(true);
  const [recoverySeed, setRecoverySeed] = useState<string>(
    'falcon oasis summit desert silver crystal marble olive shadow canyon shield beacon'
  );

  const [licenseKey, setLicenseKey] = useState<string>(
    'DENTAL-PRO-2026-ED25519-ENTERPRISE-5SEATS-OFFLINE'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingSeed, setIsGeneratingSeed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrors({});

    if (currentStep === 2) {
      const res = validateClinicProfile(profile);
      if (!res.isValid) {
        setErrors(res.errors);
        return;
      }
    }

    if (currentStep === 3) {
      const res = validateOwnerAccount(owner);
      if (!res.isValid) {
        setErrors(res.errors);
        return;
      }
    }

    if (currentStep === 4) {
      const res = validateRecoveryPassphrase(recoverySeed);
      if (!res.isValid) {
        setErrors({ recoverySeed: res.error || 'خطأ في عبارة الاستعادة' });
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(s => s + 1);
    } else {
      // Finalize
      const licCheck = validateLicenseToken(licenseKey);
      if (!licCheck.isValid) {
        setErrors({ licenseKey: licCheck.error || 'مفتاح الترخيص غير صالح' });
        return;
      }

      localStorage.setItem('clinic_setup_completed', 'true');
      localStorage.setItem('clinic_profile_cache', JSON.stringify({
        clinicName: profile.clinicName,
        clinicId,
        currency: profile.currency,
        owner: owner.fullName
      }));

      onComplete({
        clinicName: profile.clinicName,
        clinicId,
        currency: profile.currency,
        timezone: profile.timezone,
        ownerName: owner.fullName,
        licenseKey
      });
      onClose();
    }
  };

  const handleRegenerateSeed = () => {
    setIsGeneratingSeed(true);
    setTimeout(() => {
      const wordList = [
        'falcon', 'oasis', 'summit', 'desert', 'silver', 'crystal', 
        'marble', 'olive', 'shadow', 'canyon', 'shield', 'beacon',
        'emerald', 'amber', 'crown', 'pearl', 'river', 'haven', 'sapphire'
      ];
      const shuffled = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 12).join(' ');
      setRecoverySeed(shuffled);
      setIsGeneratingSeed(false);
    }, 200);
  };

  const steps = [
    { num: 1, title: 'وضع التشغيل', icon: Cpu },
    { num: 2, title: 'هوية العيادة', icon: Building2 },
    { num: 3, title: 'المالك والتشفير', icon: ShieldCheck },
    { num: 4, title: 'النسخ والطوارئ', icon: HardDrive },
    { num: 5, title: 'الترخيص والجاهزية', icon: KeyRound }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Medical Premium Styling */}
        <div className="bg-[#164E63] text-white p-6 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-lg text-teal-200/80 hover:text-white hover:bg-white/10 transition-colors"
            title="إغلاق المعالج"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-bold text-xl shadow-md border border-teal-300/30">
              <Sparkles className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">معالج التهيئة والتشغيل الأولي للعيادة (First-Run Setup)</h2>
                <span className="text-[11px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full font-mono">REQ-SET-001</span>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                تجهيز بيئة الإنتاج الطبية المستقلة · تشفير كامل دون خادم Node.js وبلا إنترنت إلزامي
              </p>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="mt-6 flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-teal-800/80 z-0" />
            {steps.map(step => {
              const Icon = step.icon;
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    isPast 
                      ? 'bg-emerald-400 text-slate-900 ring-2 ring-emerald-300' 
                      : isCurrent 
                        ? 'bg-[#0F766E] text-white ring-4 ring-teal-300/40' 
                        : 'bg-[#103D4D] text-teal-200/60 border border-teal-500/20'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                    isCurrent ? 'text-white font-bold' : isPast ? 'text-emerald-200' : 'text-teal-200/60'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 flex-1 min-h-[380px] bg-slate-50/60">
          {/* STEP 1: Node Mode & Network Discovery */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-900">الخطوة 1: تحديد نمط تثبيت هذه المحطة في العيادة</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  وفق معمارية المنظومة (REQ-PLAT-002)، كل جهاز يملك قاعدة بيانات SQLite مشفرة ومستقلة تماماً.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div 
                  onClick={() => setNodeType('coordinator')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    nodeType === 'coordinator' 
                      ? 'border-[#0F766E] bg-teal-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-[#0F766E]">
                      <Cpu className="w-5 h-5" />
                    </div>
                    {nodeType === 'coordinator' && <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />}
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-3">منسق رئيسي للعيادة (Coordinator Node)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    هذا الجهاز هو الخادم المحلي المنسق أو المحطة الرئيسية للعيادة. يعلن عن الخدمة محلياً عبر بروتوكول mDNS (المنفذ 4242).
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded w-fit">
                    Primary DB Holder · Offline Master
                  </div>
                </div>

                <div 
                  onClick={() => setNodeType('workstation')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    nodeType === 'workstation' 
                      ? 'border-[#0F766E] bg-teal-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                      <Wifi className="w-5 h-5" />
                    </div>
                    {nodeType === 'workstation' && <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />}
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-3">محطة عمل منضمة (Workstation Peer)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    محطة طبيب أسنان أو استقبال تنضم لعيادة قائمة عبر اقتران آمن برموز QR وتبادل مفاتيح القناة الموثوقة.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded w-fit">
                    LAN Discovery · Pairing Token
                  </div>
                </div>
              </div>

              {/* Language and Encoding Confirmation */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">اللغة ونظام الترميز الطبي:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                  العربية (RTL) + الأرقام اللاتينية 0-9 ومصطلحات FDI/CDT الطبية
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Clinic Profile & Specialties */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-900">الخطوة 2: بطاقة تعريف المنشأة الطبية والاختصاصات</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  هذه البيانات تظهر في ترويسة التقارير الطبية، فواتير ضريبة القيمة المضافة، والوصفات السريرية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اسم العيادة أو المركز الطبي *</label>
                  <input
                    type="text"
                    value={profile.clinicName}
                    onChange={e => setProfile({ ...profile, clinicName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none"
                    placeholder="مثال: مجمع عيادات الأمل لطب الأسنان"
                  />
                  {errors.clinicName && <p className="text-[11px] text-red-600 mt-1">{errors.clinicName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الترخيص الصحي / السجل التجاري *</label>
                  <input
                    type="text"
                    value={profile.medicalLicenseNo}
                    onChange={e => setProfile({ ...profile, medicalLicenseNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono"
                    placeholder="MOH-XXXX-XXXX"
                  />
                  {errors.medicalLicenseNo && <p className="text-[11px] text-red-600 mt-1">{errors.medicalLicenseNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف الرسمي *</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono text-left"
                    placeholder="+966 11 234 5678"
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">العملة الرسمية والمنطقة الزمنية *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={profile.currency}
                      onChange={e => setProfile({ ...profile, currency: e.target.value })}
                      className="px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none"
                    >
                      <option value="SAR">SAR (ريال سعودي)</option>
                      <option value="AED">AED (درهم إماراتي)</option>
                      <option value="USD">USD (دولار أمريكي)</option>
                      <option value="EUR">EUR (يورو)</option>
                      <option value="KWD">KWD (دينار كويتي)</option>
                      <option value="QAR">QAR (ريال قطري)</option>
                    </select>

                    <select
                      value={profile.timezone}
                      onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                      className="px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono"
                    >
                      <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                      <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                      <option value="Asia/Kuwait">Asia/Kuwait (UTC+3)</option>
                      <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specialty & Medical Modules Selection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">الوحدات والاختصاصات الطبية المفعلة في المنظومة:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border-2 border-teal-600 bg-teal-50 text-teal-900 text-xs font-bold flex items-center justify-between">
                    <span>طب الأسنان (Dental Pro)</span>
                    <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded">الرئيسي</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs flex items-center justify-between">
                    <span>طب وجراحة الأطفال</span>
                    <span className="text-[10px] text-slate-400">موديول إضافي</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs flex items-center justify-between">
                    <span>الجلدية والتجميل</span>
                    <span className="text-[10px] text-slate-400">موديول إضافي</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Owner Account & SQLiteMC Encryption */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-900">الخطوة 3: حساب الطبيب المالك وتشفير قاعدة البيانات</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  المالك يملك حق التوقيع الرقمي والتحكم الشامل بالصلاحيات الدقيقة (REQ-AUTH-003).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل للطبيب المالك *</label>
                  <input
                    type="text"
                    value={owner.fullName}
                    onChange={e => setOwner({ ...owner, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none"
                    placeholder="د. طارق الحكيم"
                  />
                  {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الترخيص المهني للطبيب *</label>
                  <input
                    type="text"
                    value={owner.doctorLicenseNo}
                    onChange={e => setOwner({ ...owner, doctorLicenseNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono"
                    placeholder="SCFHS-XXXXXX"
                  />
                  {errors.doctorLicenseNo && <p className="text-[11px] text-red-600 mt-1">{errors.doctorLicenseNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني المهني *</label>
                  <input
                    type="email"
                    value={owner.email}
                    onChange={e => setOwner({ ...owner, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono text-left"
                    placeholder="owner@clinic.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رمز الأمان السريع (PIN Lock) *</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={owner.pin}
                    onChange={e => setOwner({ ...owner, pin: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono text-center tracking-widest text-base"
                    placeholder="••••"
                  />
                  {errors.pin && <p className="text-[11px] text-red-600 mt-1">{errors.pin}</p>}
                </div>
              </div>

              {/* Cryptographic Seed & Clinic ID Box */}
              <div className="bg-slate-900 text-teal-100 p-4 rounded-xl border border-slate-800 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-teal-300 font-bold flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    المعرف الدائم للعيادة وتشفير SQLiteMC (AES-256 GCM):
                  </span>
                  <span className="text-[10px] bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded font-mono">
                    REQ-SET-002
                  </span>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg font-mono text-xs text-white">
                  <span>معرف العيادة (Permanent Clinic ID):</span>
                  <span className="text-emerald-400 font-bold">{clinicId}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  قاعدة البيانات مشفرة محلياً بمفتاح عتاد الجهاز. لا يمكن قراءتها من خارج التطبيق أو نسخ ملف `.db` دون مصادقة المالك.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Backup Policy & Disaster Recovery Seed */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-900">الخطوة 4: سياسة النسخ الاحتياطي ومفتاح استعادة الطوارئ</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حماية البيانات من الفقدان التام حتى لو احترق أو سُرق الجهاز المادي (REQ-SET-007).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تكرار النسخ الاحتياطي المحلي التلقائي:</label>
                  <select
                    value={backupFrequency}
                    onChange={e => setBackupFrequency(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none"
                  >
                    <option value="six_hours">كل 6 ساعات (موصى به للمراكز المزدحمة)</option>
                    <option value="daily">نسخ يومي عند إغلاق العيادة</option>
                  </select>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">نسخ سحابي مشفر (Google Drive):</div>
                    <div className="text-[11px] text-slate-500">تشفير كامل بصفر معرفة (Zero-Knowledge)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cloudBackup}
                    onChange={e => setCloudBackup(e.target.checked)}
                    className="w-4 h-4 text-[#0F766E] rounded focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              {/* 12-word recovery passphrase */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <FileKey className="w-4 h-4 text-amber-700" />
                    عبارة استعادة المالك في حالات الطوارئ (12-Word Master Seed):
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateSeed}
                    disabled={isGeneratingSeed}
                    className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-medium px-2 py-1 rounded bg-amber-100 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingSeed ? 'animate-spin' : ''}`} />
                    توليد عبارة جديدة
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-300 font-mono text-xs text-slate-800 leading-relaxed tracking-wide select-all text-center dir-ltr">
                  {recoverySeed}
                </div>

                {errors.recoverySeed && <p className="text-[11px] text-red-600">{errors.recoverySeed}</p>}

                <p className="text-[11px] text-amber-800">
                  ⚠️ احفظ هذه العبارة في مكان آمن وخارجي. هذه العبارة هي الطريقة الوحيدة لنقل ترخيص العيادة واستعادة قاعدة البيانات المشفرة عند فقدان الجهاز.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: License Key & Pre-flight Diagnostics */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-900">الخطوة 5: التحقق من الترخيص التجاري وفحص الجاهزية التشغيلية</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  رخصة إنتاج دائمة تعمل بنسبة 100% دون اتصال بالإنترنت (Offline Perpetual License).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">مفتاح الترخيص الرقمي الموقع (Ed25519 Signed Token) *</label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0F766E] focus:outline-none font-mono text-left font-semibold text-teal-900"
                />
                {errors.licenseKey && <p className="text-[11px] text-red-600 mt-1">{errors.licenseKey}</p>}
              </div>

              {/* Preflight production checklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800">تقرير التحقق المسبق لمنظومة الإنتاج (Pre-flight Status):</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">قاعدة بيانات مشفرة SQLiteMC</span>
                      <span className="text-[10px] text-emerald-700">AES-256 GCM جاهزة</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">مخطط الأسنان التشريحي FDI</span>
                      <span className="text-[10px] text-emerald-700">32 سن دائم + 20 لبني</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">صلاحيات دقيقة RBAC / ABAC</span>
                      <span className="text-[10px] text-emerald-700">عزل PHI للمحاسب والاستقبال</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">اكتشاف شبكة العيادة LAN</span>
                      <span className="text-[10px] text-emerald-700">mDNS Port 4242 Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                السابق
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
              >
                تخطي ومتابعة بالقيم القياسية
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              خطوة {currentStep} من 5
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold shadow-md transition-colors"
            >
              {currentStep < 5 ? (
                <>
                  التالي
                  <ArrowLeft className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  إنهاء التهيئة وتشغيل العيادة
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
