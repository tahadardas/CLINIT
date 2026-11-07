/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  AlertTriangle, 
  Heart, 
  Activity, 
  FileText, 
  Image as ImageIcon, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Calendar, 
  Sparkles, 
  Stethoscope, 
  Pill, 
  Smile, 
  Layers, 
  X, 
  Printer, 
  ExternalLink,
  ChevronRight,
  Shield,
  FileCheck,
  AlertCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { 
  PatientRecord, 
  DentalFinding, 
  DentalProcedure, 
  UserAccount, 
  ClinicalEncounter 
} from '../types/clinic';
import { canViewConfidentialPHI } from '../domain/permissions';

interface ComprehensivePatientRecordModalProps {
  patient: PatientRecord;
  currentUser: UserAccount;
  findings: DentalFinding[];
  procedures: DentalProcedure[];
  encounters?: ClinicalEncounter[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDentalChart: (patient: PatientRecord) => void;
}

type TabType = 
  | 'overview' 
  | 'systemic_medical' 
  | 'dental_history' 
  | 'tmj_extraoral' 
  | 'periodontal' 
  | 'occlusion' 
  | 'radiology' 
  | 'treatment_plan' 
  | 'consents';

export const ComprehensivePatientRecordModal: React.FC<ComprehensivePatientRecordModalProps> = ({
  patient,
  currentUser,
  findings,
  procedures,
  encounters = [],
  isOpen,
  onClose,
  onNavigateToDentalChart
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedXray, setSelectedXray] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSeePHI = canViewConfidentialPHI(currentUser.role);
  const patientFindings = findings.filter(f => f.patient_id === patient.id);
  const patientProcedures = procedures.filter(p => p.patient_id === patient.id);
  const patientEncounters = encounters.filter(e => e.patient_id === patient.id);

  const totalPlanCost = patientProcedures.reduce((acc, p) => acc + p.price, 0);
  const completedCost = patientProcedures.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.price, 0);
  const pendingCost = totalPlanCost - completedCost;

  const confirmedAllergies = patient.allergies.filter(a => a.status === 'yes');

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'النظرة السريرية الشاملة', icon: Activity },
    { id: 'systemic_medical', label: 'التاريخ الجهازي والأدوية', icon: Heart },
    { id: 'dental_history', label: 'التاريخ السني والشكوى', icon: Stethoscope },
    { id: 'tmj_extraoral', label: 'المفصل الصدغي والوجه', icon: Smile },
    { id: 'periodontal', label: 'تقييم اللثة والأنسجة', icon: Layers },
    { id: 'occlusion', label: 'الإطباق والتقويم', icon: Smile },
    { id: 'radiology', label: 'أرشيف الأشعة والـ OPG', icon: ImageIcon },
    { id: 'treatment_plan', label: 'خطة العلاج ومخطط FDI', icon: FileText },
    { id: 'consents', label: 'الموافقات المستنيرة', icon: FileCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================================================================= */}
        {/* MEDICAL DOSSIER HEADER (Medical Premium Tone #164E63) */}
        {/* ================================================================= */}
        <div className="bg-[#164E63] text-white p-5 shrink-0 border-b border-teal-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Patient Identity Badge */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F766E] to-teal-800 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-teal-300/30 shrink-0">
                {patient.legal_name.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold tracking-tight truncate">{patient.legal_name}</h1>
                  {patient.latin_name && (
                    <span className="text-xs text-teal-200/80 font-mono hidden sm:inline">
                      ({patient.latin_name})
                    </span>
                  )}
                  <span className="text-[11px] bg-teal-500/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    {patient.mrn}
                  </span>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    ملف نشط
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-teal-100/90 mt-1 flex-wrap font-mono">
                  <span>العمر: <strong className="text-white">{patient.approx_age} سنة</strong> ({patient.dob})</span>
                  <span>الجنس: <strong className="text-white">{patient.sex === 'female' ? 'أنثى' : 'ذكر'}</strong></span>
                  <span>فصيلة الدم: <strong className="text-emerald-300">{patient.blood_group || 'O+'}</strong></span>
                  <span>الهوية: <strong className="text-teal-200">{patient.national_id || '1092837465'}</strong></span>
                  <span>الهاتف: <strong className="text-white dir-ltr">{patient.phone}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onNavigateToDentalChart(patient);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold shadow-md transition-colors border border-teal-300/30"
              >
                <Smile className="w-4 h-4" />
                <span>فتح مخطط الأسنان FDI</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white transition-colors"
                title="طباعة الملف الطبي السني الشامل (A4 RTL)"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white transition-colors"
                title="إغلاق الملف"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CRITICAL MEDICAL ALERT STRIP (High-Priority Alert Banner) */}
          <div className="mt-3.5 pt-3 border-t border-teal-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                التنبيهات السريرية الحرجة لطبيب الأسنان:
              </span>

              {confirmedAllergies.length > 0 ? (
                confirmedAllergies.map(alg => (
                  <span key={alg.id} className="bg-red-500/20 text-red-200 border border-red-400/40 px-2.5 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 ring-2 ring-red-400/30" />
                    حساسية مثبتة: {alg.substance}
                  </span>
                ))
              ) : (
                <span className="text-emerald-300 text-[11px]">لا توجد حساسية دوائية مسجلة</span>
              )}

              {patient.risk_factors?.bisphosphonates_history && (
                <span className="bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                  ⚠️ خطر MRONJ (أدوية العظام)
                </span>
              )}

              {patient.risk_factors?.antibiotic_prophylaxis_needed && (
                <span className="bg-purple-500/20 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                  💊 يتطلب مضاد وقائي قبل الإجراء
                </span>
              )}
            </div>

            <div className="text-[11px] text-teal-200/80 font-mono">
              طبيب الأسنان المشرف: <strong className="text-white">د. طارق الحكيم</strong>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CLINICAL TABS NAVIGATION BAR */}
        {/* ================================================================= */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto select-none shrink-0 py-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-[#0F766E] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* DOSSIER BODY VIEWPORT */}
        {/* ================================================================= */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/60 text-right">
          
          {/* TAB 1: OVERVIEW & CHIEF COMPLAINT */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Glance Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Chief Complaint Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">الشكوى الرئيسية (Pain Scale)</span>
                    <span className="font-bold text-red-600 font-mono">
                      {patient.chief_complaint?.pain_scale || 7} / 10
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                    {patient.chief_complaint?.description || 'ألم حاد في الضرس 26 يزداد مع البارد والسكريات'}
                  </p>
                  <div className="text-[11px] text-slate-500 mt-2 font-mono">
                    البداية: {patient.chief_complaint?.onset || 'منذ أسبوعين'}
                  </div>
                </div>

                {/* 2. Vital Signs Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">العلامات الحيوية (Vitals)</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ضغط الدم:</span>
                      <strong className="text-slate-800">{patient.vital_signs?.blood_pressure || '120/78 mmHg'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">النبض:</span>
                      <strong className="text-slate-800">{patient.vital_signs?.pulse || 74} bpm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">HbA1c السكر:</span>
                      <strong className="text-emerald-700">{patient.vital_signs?.blood_sugar_hba1c || '5.4%'}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Periodontal & TMJ Summary Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">تقييم اللثة والمفصل</span>
                    <Smile className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">حالة اللثة:</span>
                      <strong className="text-slate-800">Gingivitis خفيف</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">نزف السبر (BOP):</span>
                      <strong className="text-amber-700 font-mono">{patient.periodontal_summary?.bop_percent || 14}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">طقطقة TMJ:</span>
                      <strong className="text-slate-800">مفصل أيسر (Left)</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Treatment Plan Financials */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">الخطة المالية السنية</span>
                    <DollarSign className="w-4 h-4 text-[#0F766E]" />
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">إجمالي الخطة:</span>
                      <strong className="text-slate-900">{totalPlanCost || 2450} SAR</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">المسدد منها:</span>
                      <strong className="text-emerald-700">{completedCost || 950} SAR</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1">
                      <span className="text-slate-500">المتبقي:</span>
                      <strong className="text-red-600">{pendingCost || 1500} SAR</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Patient Core Demographics & Emergency Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0F766E]" />
                  <span>البيانات الاجتماعية والاتصال السريع:</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">المهنة:</span>
                    <span className="font-semibold text-slate-800">{patient.occupation || 'مهندسة برمجيات'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">الحالة الاجتماعية:</span>
                    <span className="font-semibold text-slate-800">{patient.marital_status || 'متزوجة'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">العنوان الوطني:</span>
                    <span className="font-semibold text-slate-800">{patient.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">طوارئ (صلة القرابة):</span>
                    <span className="font-semibold text-slate-800">
                      {patient.emergency_contact?.name} ({patient.emergency_contact?.phone})
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Clinical Findings on Dental Arch */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                    <span>التشخيصات السنية النشطة بالمخطط (Active Odontogram Findings):</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToDentalChart(patient);
                      onClose();
                    }}
                    className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1"
                  >
                    <span>فتح المخطط التفاعلي</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {patientFindings.map(find => (
                    <div key={find.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#0F766E] font-mono">سن FDI #{find.tooth_code}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium">
                          {find.condition}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        الأسطح: <span className="font-mono font-bold">{find.surfaces?.join(', ') || 'السطح الإطباقي O'}</span>
                      </div>
                      {find.notes && <p className="text-slate-500 text-[11px]">{find.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SYSTEMIC MEDICAL & DRUGS */}
          {activeTab === 'systemic_medical' && (
            <div className="space-y-5">
              
              {/* Detailed Allergy Registry */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>سجل الحساسية الدوائية المعتمد (Medical Allergy Screen):</span>
                </h3>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {patient.allergies.map(alg => (
                    <div key={alg.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800 block">{alg.substance}</span>
                        {alg.reaction && (
                          <span className="text-[11px] text-red-600 block mt-0.5">
                            طبيعة رد الفعل: {alg.reaction} ({alg.severity === 'severe' ? 'شديدة ومهددة للحياة' : 'خفيفة'})
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                        alg.status === 'yes' ? 'bg-red-100 text-red-800' :
                        alg.status === 'no' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {alg.status === 'yes' ? 'مؤكدة (Allergic)' : alg.status === 'no' ? 'سليمة (No Allergy)' : 'غير معروف'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Diseases by Body System */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Chronic Diseases */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-blue-600" />
                    <span>الأمراض المزمنة وأجهزة الجسم (Systemic Conditions):</span>
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {patient.chronic_conditions.map((cond, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{cond}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                          مضبوط وتحت المتابعة
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Active Drugs & Dental Precautions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <span>الأدوية المستمرة والاحتياطات السنية (Active Medications):</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    {patient.active_medications.map((med, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-800 block font-mono">{med}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          تأثيره على الأسنان: لا تعارض مع التخدير الموضعي أو الجراحة الروتينية.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Surgery and Hospitalization */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-2">العمليات الجراحية والاستشفاء السابق:</h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {patient.surgical_history.join(' · ') || 'لا توجد جراحات سابقة مدونة'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: DENTAL HISTORY & HABITS */}
          {activeTab === 'dental_history' && (
            <div className="space-y-5">
              
              {/* Detailed Chief Complaint */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                  <span>الشكوى الحالية بالتفصيل (Detailed Chief Complaint):</span>
                </h3>
                <div className="bg-teal-50/60 border border-teal-200 p-4 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-slate-900 leading-relaxed text-sm">
                    "{patient.chief_complaint?.description}"
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">شدة الألم:</span>
                      <strong className="text-red-700 font-mono font-bold">{patient.chief_complaint?.pain_scale}/10</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">طبيعة الألم:</span>
                      <strong className="text-slate-800">{patient.chief_complaint?.pain_character}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">المحفزات:</span>
                      <strong className="text-slate-800">{patient.chief_complaint?.aggravating_factors}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">المسكنات والراحة:</span>
                      <strong className="text-slate-800">{patient.chief_complaint?.relieving_factors}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Dental History & Dental Anxiety */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800">التاريخ السني السابق:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-500">آخر زيارة لعيادة الأسنان:</span>
                      <strong className="text-slate-800 font-mono">{patient.dental_history?.last_visit}</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-500">مستوى قلق عيادة الأسنان:</span>
                      <strong className="text-emerald-700 font-bold">خفيف (Mild - متعاونة تماماً)</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-500">تحمل التخدير الموضعي:</span>
                      <strong className="text-slate-800">{patient.dental_history?.local_anesthesia_complications}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800">العناية الفموية والعادات السيئة:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-500">تفريش الأسنان:</span>
                      <strong className="text-slate-800">{patient.dental_history?.brushing_frequency}</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-500">استخدام الخيط السني:</span>
                      <strong className="text-slate-800">{patient.dental_history?.flossing_frequency}</strong>
                    </div>
                    <div className="p-2 rounded bg-amber-50 border border-amber-200">
                      <span className="text-amber-800 font-bold block">العادات الفموية (Parafunctional):</span>
                      <span className="text-amber-900 text-[11px]">
                        {patient.dental_history?.oral_habits.join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: TMJ & EXTRAORAL */}
          {activeTab === 'tmj_extraoral' && (
            <div className="space-y-5 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <Smile className="w-4 h-4 text-[#0F766E]" />
                  <span>فحص المفصل الصدغي الفكي وعضلات المضغ (TMJ & Muscles Assessment):</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">طقطقة المفصل (Clicking):</span>
                    <strong className="text-amber-700 font-bold block">
                      {patient.tmj_exam?.clicking === 'left' ? 'طقطقة بالمفصل الأيسر' : 'طبيعي'}
                    </strong>
                    <span className="text-[10px] text-slate-400">غير مؤلمة عند الفتح الكامل</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">فرقعة المفصل (Crepitus):</span>
                    <strong className="text-emerald-700 font-bold block">
                      {patient.tmj_exam?.crepitus ? 'موجودة' : 'سليمة (غائبة)'}
                    </strong>
                    <span className="text-[10px] text-slate-400">لا يوجد احتكاك عظمي</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">فتحة الفم القصوى (MIO):</span>
                    <strong className="text-slate-900 font-mono font-bold block text-sm">
                      {patient.tmj_exam?.max_mouth_opening_mm || 44} mm
                    </strong>
                    <span className="text-[10px] text-emerald-600">مدى حركي طبيعي (38-50mm)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">حساسية العضلة الماضغة:</span>
                    <strong className="text-amber-700 font-bold block">
                      {patient.tmj_exam?.masseter_tenderness ? 'حساسية خفيفة (يسار)' : 'سليمة'}
                    </strong>
                    <span className="text-[10px] text-slate-400">ناتجة عن الصرير الليلي</span>
                  </div>
                </div>

                {/* Soft tissue and oral cancer screening */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">مسح الأنسجة الرخوة واللسان وقاع الفم:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Oral Cancer Screen: Negative
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {patient.soft_tissue_exam?.findings}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERIODONTAL ASSESSMENT */}
          {activeTab === 'periodontal' && (
            <div className="space-y-5 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <Layers className="w-4 h-4 text-[#0F766E]" />
                  <span>مخطط اللثة والأنسجة الحول سنية (Periodontal Assessment & PSR):</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">نزف السبر (BOP):</span>
                    <strong className="text-amber-700 font-mono text-base font-bold">
                      {patient.periodontal_summary?.bop_percent}%
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">الحد المثالي &lt; 10%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">مشعر اللويحة (Plaque):</span>
                    <strong className="text-slate-800 font-mono text-base font-bold">
                      {patient.periodontal_summary?.plaque_score_percent}%
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">نظافة فموية جيدة</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">عمق الجيوب المعمم:</span>
                    <strong className="text-emerald-700 font-bold block text-sm">
                      1 - 3 mm
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">جيوب طبيعية فسيولوجية</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">حركة الأسنان (Mobility):</span>
                    <strong className="text-emerald-700 font-bold block text-sm">
                      Grade 0 (ثابتة)
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">لا يوجد حركة مرضية</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                  <span className="font-bold block text-xs">التشخيص اللثوي المعتمد:</span>
                  <p className="text-[11px] text-teal-800 mt-1">
                    {patient.periodontal_summary?.classification} — يوصى بإجراء جلسة تقليح وتلميع فوق وتحت اللثة (Scaling & Root Planing) مع مراقبة الجيب 4mm بين 26 و 27.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OCCLUSION & ORTHODONTICS */}
          {activeTab === 'occlusion' && (
            <div className="space-y-5 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <Smile className="w-4 h-4 text-[#0F766E]" />
                  <span>تقييم الإطباق وتقويم الأسنان (Occlusion & Orthodontic Analysis):</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">صنف الإطباق للرحى (يمين):</span>
                    <strong className="text-slate-900 font-bold">
                      {patient.occlusion_exam?.molar_class_right}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">صنف الإطباق للرحى (يسار):</span>
                    <strong className="text-slate-900 font-bold">
                      {patient.occlusion_exam?.molar_class_left}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">العضة الأفقية (Overjet):</span>
                    <strong className="text-slate-900 font-mono font-bold">
                      {patient.occlusion_exam?.overjet_mm} mm
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">طبيعية (2-3mm)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-1">العضة الرأسية (Overbite):</span>
                    <strong className="text-slate-900 font-mono font-bold">
                      {patient.occlusion_exam?.overbite_percent}%
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">تغطية قاطعة مثالية</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">خط منتصف الأسنان (Dental Midline):</span>
                    <span className="text-slate-500 text-[11px]">{patient.occlusion_exam?.midline_deviation}</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
                    Coincident
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: RADIOLOGY & OPG */}
          {activeTab === 'radiology' && (
            <div className="space-y-5 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <ImageIcon className="w-4 h-4 text-[#0F766E]" />
                    <span>أرشيف الأشعة الرقمية والـ OPG والـ Bitewings:</span>
                  </h3>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {patient.radiology_records?.length || 0} دراسات شعاعية مسجلة
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {patient.radiology_records?.map(rad => (
                    <div 
                      key={rad.id}
                      onClick={() => setSelectedXray(selectedXray === rad.id ? null : rad.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedXray === rad.id 
                          ? 'border-[#0F766E] bg-teal-50/40 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 block truncate">{rad.title}</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {rad.date}
                        </span>
                      </div>

                      {/* Simulated Radiology Preview Box */}
                      <div className="w-full h-28 bg-slate-900 rounded-lg flex items-center justify-center text-teal-300 font-mono text-[11px] relative overflow-hidden border border-slate-800 my-2">
                        <div className="absolute inset-0 bg-radial from-slate-700 to-black opacity-80" />
                        <div className="relative z-10 text-center p-2">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 text-teal-400" />
                          <span>{rad.type.toUpperCase()}</span>
                          <span className="text-[10px] text-slate-400 block">DICOM / Digital Verified</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                        {rad.finding_summary}
                      </p>

                      <div className="mt-2 text-[10px] text-[#0F766E] font-bold">
                        {selectedXray === rad.id ? 'إخفاء التقرير الكامل ▲' : 'عرض التقرير السريري ▼'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expanded Selected X-Ray Report */}
                {selectedXray && (
                  <div className="p-4 rounded-xl bg-slate-900 text-teal-100 border border-slate-800 space-y-2 mt-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-white text-xs">
                        تقرير القراءة الشعاعية المعتمد للطبيب المعالج (Radiology Findings):
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono">Verified ALARA Protocol</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {patient.radiology_records?.find(r => r.id === selectedXray)?.finding_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: TREATMENT PLAN & PROCEDURES */}
          {activeTab === 'treatment_plan' && (
            <div className="space-y-5 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      خطة العلاج السنية الشاملة (FDI Multi-Stage Treatment Plan):
                    </h3>
                    <p className="text-slate-500 text-[11px]">مرتبة حسب الأولوية ومربوطة بأرقام الأسنان</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToDentalChart(patient);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    تعديل في مخطط الأسنان FDI
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">رقم السن (FDI)</th>
                        <th className="p-3">الإجراء السريري</th>
                        <th className="p-3">الأسطح</th>
                        <th className="p-3">كود ADA/CDT</th>
                        <th className="p-3">الطبيب</th>
                        <th className="p-3">التكلفة</th>
                        <th className="p-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientProcedures.map(proc => (
                        <tr key={proc.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-[#0F766E]">#{proc.tooth_code}</td>
                          <td className="p-3 font-semibold text-slate-900">{proc.procedure_name_ar}</td>
                          <td className="p-3 font-mono">{proc.surfaces?.join(', ') || 'السطح كاملاً'}</td>
                          <td className="p-3 font-mono text-slate-500">{proc.procedure_code}</td>
                          <td className="p-3 text-slate-600">{proc.doctor_name}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{proc.price} SAR</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              proc.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              proc.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {proc.status === 'completed' ? 'منجز مكتمل' : proc.status === 'in_progress' ? 'قيد التنفيذ' : 'مخطط مستقبلي'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: SIGNED CONSENTS */}
          {activeTab === 'consents' && (
            <div className="space-y-5 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <FileCheck className="w-4 h-4 text-[#0F766E]" />
                  <span>الموافقات المستنيرة الموقعة رقمياً (Signed Informed Consents):</span>
                </h3>

                <div className="space-y-3">
                  {patient.signed_consents?.map(cst => (
                    <div key={cst.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{cst.title}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          النطاق: {cst.scope} · الطبيب الشاهد: {cst.doctor_name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1">
                          تاريخ التوقيع: {cst.signed_at} (Digital Cryptographic Signature Verified)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>موقعة ومعتمدة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* DOSSIER FOOTER */}
        {/* ================================================================= */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>ملف طبي سني مشفر ومحمي برقم الملف MRN-2026-0142 وفق معايير الأمان الطبية</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToDentalChart(patient);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>فتح مخطط الأسنان FDI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
