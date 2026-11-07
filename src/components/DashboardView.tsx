import React from 'react';
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Stethoscope, 
  UserPlus, 
  Users 
} from 'lucide-react';
import { Appointment, PatientRecord, UserAccount } from '../types/clinic';
import { canViewConfidentialPHI, canViewFinancialProfits } from '../domain/permissions';
import { formatCurrency } from '../domain/billing';

interface DashboardViewProps {
  currentUser: UserAccount;
  patients: PatientRecord[];
  appointments: Appointment[];
  onNavigateToTab: (tab: any) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onSelectPatient: (patient: PatientRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  patients,
  appointments,
  onNavigateToTab,
  onUpdateAppointmentStatus,
  onSelectPatient
}) => {
  const canSeePHI = canViewConfidentialPHI(currentUser.role);
  const canSeeProfits = canViewFinancialProfits(currentUser.role);

  // Statistics
  const todayAppointments = appointments;
  const inProgress = appointments.filter(a => a.status === 'in_progress');
  const arrivedWaiting = appointments.filter(a => a.status === 'arrived');
  const completedToday = appointments.filter(a => a.status === 'completed');

  // Critical allergy patients
  const allergyPatients = patients.filter(p => p.allergies.some(a => a.status === 'yes'));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Role-Aware Banner */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
            {currentUser.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">مرحباً بك، {currentUser.name}</h2>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E]">
                دور النظام: {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.title} · العيادة تعمل بنظام المزامنة المشفرة دون خادم خارجي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('schedule')}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            جدول المواعيد الكامل
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('dental_chart')}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white font-medium transition-colors shadow-sm"
          >
            مخطط الأسنان FDI
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointments */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>مواعيد اليوم</span>
            <Calendar className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {todayAppointments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium">{completedToday.length} مكتمل</span>
            <span>·</span>
            <span className="text-amber-600 font-medium">{arrivedWaiting.length} في الانتظار</span>
          </div>
        </div>

        {/* Card 2: In-Chair Active Patients */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>حالياً على كرسي العلاج</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {inProgress.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {inProgress.length > 0 ? inProgress[0].patient_name : 'الكرسي متاح لاستقبال المريض'}
          </div>
        </div>

        {/* Card 3: Patients Count */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>إجمالي المرضى المسجلين</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {patients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ملفات رقمية مشفرة محلياً (SQLite)
          </div>
        </div>

        {/* Card 4: Financial Collection (Restricted to Owner & Accountant by REQ-FIN-004) */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>تحصيلات اليوم</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          {canSeeProfits ? (
            <>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {formatCurrency(1373, 'SAR')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                تم استلامها ومطابقتها دفترياً
              </div>
            </>
          ) : (
            <div className="p-2 rounded bg-amber-50 text-amber-800 text-[11px] flex items-center gap-1.5 mt-1 border border-amber-200">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>محجوب بموجب صلاحيات الاستقبال (REQ-FIN-004)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Waiting Queue & Active Chairs (8 cols) + Clinical Alerts / Shortcuts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Waiting Queue & Appointments Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#DCE5E9] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">طابور الانتظار ومواعيد الكراسي اليوم</h3>
              <p className="text-xs text-slate-500">حالات الوصول والمباشرة على كرسي العلاج</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('schedule')}
              className="text-xs text-[#0F766E] font-medium hover:underline"
            >
              عرض التقويم
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.map(app => {
              const statusBadges: Record<Appointment['status'], { label: string; class: string }> = {
                scheduled: { label: 'مجدول', class: 'bg-slate-100 text-slate-700' },
                arrived: { label: 'وصل / في الانتظار', class: 'bg-amber-50 text-amber-800 border border-amber-200' },
                in_progress: { label: 'على الكرسي الآن', class: 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold' },
                completed: { label: 'مكتمل', class: 'bg-emerald-50 text-emerald-700' },
                cancelled: { label: 'ملغي', class: 'bg-red-50 text-red-600' },
                no_show: { label: 'لم يحضر', class: 'bg-slate-100 text-slate-500' }
              };

              const badge = statusBadges[app.status];

              return (
                <div key={app.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{app.patient_name}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {app.patient_mrn}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{app.service_title}</span>
                      <span>·</span>
                      <span className="text-teal-800 font-medium">{app.chair_name}</span>
                      <span>·</span>
                      <span>{app.doctor_name}</span>
                    </div>
                  </div>

                  {/* Queue Control Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {app.status === 'scheduled' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAppointmentStatus(app.id, 'arrived')}
                        className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-colors"
                      >
                        تسجيل وصول
                      </button>
                    )}
                    {app.status === 'arrived' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAppointmentStatus(app.id, 'in_progress')}
                        className="px-2.5 py-1 rounded bg-[#0F766E] hover:bg-[#0d6861] text-white text-[11px] font-medium transition-colors shadow-sm"
                      >
                        إدخال إلى الكرسي
                      </button>
                    )}
                    {app.status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAppointmentStatus(app.id, 'completed')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                      >
                        إنهاء الزيارة
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const pat = patients.find(p => p.id === app.patient_id);
                        if (pat) {
                          onSelectPatient(pat);
                          onNavigateToTab('dental_chart');
                        }
                      }}
                      className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px]"
                    >
                      فتح المخطط
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Medical Safety Alerts & Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Critical Allergy & Medical Risk Alerts (PHI - Only Doctor/Owner) */}
          <div className="bg-white rounded-xl border border-[#DCE5E9] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>تنبيهات الحساسية والأمان الطبي</span>
              </div>
              <span className="text-[10px] font-mono text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                {allergyPatients.length} حالات
              </span>
            </div>

            {canSeePHI ? (
              <div className="space-y-2 text-xs">
                {allergyPatients.map(p => {
                  const confirmedAllergies = p.allergies.filter(a => a.status === 'yes');
                  return (
                    <div key={p.id} className="p-2.5 rounded-lg border border-red-100 bg-red-50/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{p.legal_name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{p.mrn}</span>
                      </div>
                      <div className="text-[11px] text-red-700">
                        حساسية: {confirmedAllergies.map(a => a.substance).join('، ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 text-center">
                <Lock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span>محجوب بموجب سياسة خصوصية البيانات الطبية (REQ-AUTH-009)</span>
              </div>
            )}
          </div>

          {/* Quick System Health & Sync Card */}
          <div className="bg-white rounded-xl border border-[#DCE5E9] p-4 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              حالة الأجهزة والمزامنة المحلية (LAN)
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الجهاز المنسق (Coordinator):</span>
                <span className="font-semibold text-slate-800">محطة العيادة الرئيسية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الأجهزة المتصلة بالعيادة:</span>
                <span className="font-mono text-teal-800 font-bold">4 أجهزة موثوقة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">عمليات معلقة في Outbox:</span>
                <span className="font-mono text-emerald-600 font-bold">0 (متزامن كلياً)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('sync_backup')}
              className="w-full text-center py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              فحص تفاصيل المزامنة والنسخ الاحتياطي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
