import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Filter, 
  Plus, 
  User, 
  X 
} from 'lucide-react';
import { Appointment, PatientRecord, UserAccount } from '../types/clinic';
import { detectAppointmentConflict } from '../domain/appointment';
import { hasPermission } from '../domain/permissions';

interface ScheduleViewProps {
  appointments: Appointment[];
  patients: PatientRecord[];
  currentUser: UserAccount;
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onSelectPatient: (patient: PatientRecord) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  patients,
  currentUser,
  onAddAppointment,
  onUpdateStatus,
  onSelectPatient
}) => {
  const canBook = hasPermission(currentUser.role, 'appointments_calendar', 'create');

  const [selectedChair, setSelectedChair] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Appointment Form
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [targetDoctorId, setTargetDoctorId] = useState('user-owner');
  const [targetChairId, setTargetChairId] = useState('chair-1');
  const [startTime, setStartTime] = useState('2026-11-07T14:00:00Z');
  const [endTime, setEndTime] = useState('2026-11-07T14:45:00Z');
  const [serviceTitle, setServiceTitle] = useState('فحص دوري وتنظيف');
  const [conflictError, setConflictError] = useState<string | null>(null);

  const chairs = [
    { id: 'chair-1', name: 'كرسي 1 — الجراحة والزرع' },
    { id: 'chair-2', name: 'كرسي 2 — الأطفال والتقويم' },
    { id: 'chair-3', name: 'كرسي 3 — الفحص العام والاستشارات' }
  ];

  const doctors = [
    { id: 'user-owner', name: 'د. طارق الحكيم' },
    { id: 'user-doctor', name: 'د. مريم العوضي' }
  ];

  // Filtering
  const filteredAppointments = appointments.filter(app => {
    if (selectedChair !== 'all' && app.chair_id !== selectedChair) return false;
    if (selectedDoctor !== 'all' && app.doctor_id !== selectedDoctor) return false;
    return true;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    // Collision / Conflict detection (REQ-PAT-009)
    const conflictCheck = detectAppointmentConflict(
      appointments,
      startTime,
      endTime,
      targetDoctorId,
      targetChairId
    );

    if (conflictCheck.hasConflict) {
      setConflictError(conflictCheck.reason || 'تعارض في المواعيد أو الموارد المحجوزة.');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    const doctor = doctors.find(d => d.id === targetDoctorId);
    const chair = chairs.find(c => c.id === targetChairId);

    if (!patient || !doctor || !chair) return;

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      patient_id: patient.id,
      patient_name: patient.legal_name,
      patient_phone: patient.phone,
      patient_mrn: patient.mrn,
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      chair_id: chair.id,
      chair_name: chair.name,
      start_time: startTime,
      end_time: endTime,
      service_title: serviceTitle,
      status: 'scheduled',
      commit_state: 'committed'
    };

    onAddAppointment(newApp);
    setShowNewModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Schedule Header and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">تقويم المواعيد وحجوزات الكراسي</h2>
          <p className="text-xs text-slate-500">مراقبة التعارضات اللحظية وحالات طابور العيادة</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chair Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-white border border-[#DCE5E9] p-1 rounded-lg">
            <span className="text-slate-500 px-1">الكرسي:</span>
            <select
              value={selectedChair}
              onChange={e => setSelectedChair(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">كافة الكراسي (3)</option>
              {chairs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-white border border-[#DCE5E9] p-1 rounded-lg">
            <span className="text-slate-500 px-1">الطبيب:</span>
            <select
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">كافة الأطباء</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {canBook && (
            <button
              type="button"
              onClick={() => {
                setConflictError(null);
                setShowNewModal(true);
              }}
              className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>حجز موعد جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Chairs / Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chairs.map(chair => {
          const chairAppointments = filteredAppointments.filter(a => a.chair_id === chair.id);

          return (
            <div key={chair.id} className="bg-white rounded-xl border border-[#DCE5E9] shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-[#DCE5E9] flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">{chair.name}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-teal-800 border border-slate-200">
                  {chairAppointments.length} مواعيد
                </span>
              </div>

              <div className="p-3 divide-y divide-slate-100 flex-1 space-y-2 overflow-y-auto max-h-[600px]">
                {chairAppointments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    لا توجد مواعيد مجدولة على هذا الكرسي اليوم.
                  </div>
                ) : (
                  chairAppointments.map(app => {
                    const statusColors: Record<Appointment['status'], string> = {
                      scheduled: 'border-slate-200 bg-slate-50/50',
                      arrived: 'border-amber-300 bg-amber-50/60',
                      in_progress: 'border-teal-400 bg-teal-50/80 ring-1 ring-teal-500/20',
                      completed: 'border-emerald-300 bg-emerald-50/40',
                      cancelled: 'border-red-200 bg-red-50/30 opacity-60',
                      no_show: 'border-slate-200 bg-slate-100 opacity-60'
                    };

                    return (
                      <div
                        key={app.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${statusColors[app.status]}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{app.patient_name}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-1 rounded">
                            {app.patient_mrn}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 font-medium">
                          {app.service_title}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {app.start_time.slice(11, 16)} - {app.end_time.slice(11, 16)}
                          </span>
                          <span>{app.doctor_name}</span>
                        </div>

                        {/* Status update quick buttons */}
                        <div className="flex items-center gap-1 pt-2 border-t border-black/5">
                          {app.status === 'scheduled' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(app.id, 'arrived')}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium"
                            >
                              وصل العيادة
                            </button>
                          )}
                          {app.status === 'arrived' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(app.id, 'in_progress')}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#0F766E] text-white hover:bg-[#0d6861] font-medium"
                            >
                              بدء الجلسة
                            </button>
                          )}
                          {app.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(app.id, 'completed')}
                              className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                            >
                              إنهاء العلاج
                            </button>
                          )}
                          <span className="text-[9px] text-slate-400 mr-auto font-mono">
                            {app.commit_state === 'committed' ? '✓ Committed' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Appointment Modal with Conflict Checker */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">حجز موعد سريري جديد</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">اكتشاف تعارض في الموارد (Conflict Detected):</span>
                  {conflictError}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">المريض:</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.legal_name} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الخدمة / سبب الزيارة:</label>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={e => setServiceTitle(e.target.value)}
                  placeholder="مثال: حشوة ضوئية، علاج عصب، تقويم..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الطبيب المعالج:</label>
                  <select
                    value={targetDoctorId}
                    onChange={e => setTargetDoctorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">كرسي العيادة:</label>
                  <select
                    value={targetChairId}
                    onChange={e => setTargetChairId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  >
                    {chairs.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">وقت البدء:</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime.slice(0, 16)}
                    onChange={e => setStartTime(new Date(e.target.value).toISOString())}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E] font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">وقت الانتهاء المتوقع:</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime.slice(0, 16)}
                    onChange={e => setEndTime(new Date(e.target.value).toISOString())}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white font-medium shadow-sm"
                >
                  تأكيد الحجز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
