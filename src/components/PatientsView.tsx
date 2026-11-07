import React, { useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Eye, 
  FileText, 
  Lock, 
  Phone, 
  Plus, 
  Search, 
  ShieldAlert, 
  User, 
  UserCheck, 
  X,
  Stethoscope
} from 'lucide-react';
import { 
  ClinicalEncounter, 
  DentalFinding, 
  DentalProcedure, 
  PatientRecord, 
  UserAccount 
} from '../types/clinic';
import { searchMatches } from '../domain/appointment';
import { canViewConfidentialPHI, hasPermission } from '../domain/permissions';
import { ComprehensivePatientRecordModal } from './ComprehensivePatientRecordModal';

interface PatientsViewProps {
  patients: PatientRecord[];
  currentUser: UserAccount;
  searchQuery: string;
  findings?: DentalFinding[];
  procedures?: DentalProcedure[];
  encounters?: ClinicalEncounter[];
  onSelectPatient: (patient: PatientRecord) => void;
  onNavigateToDentalChart: (patient: PatientRecord) => void;
  onAddPatient: (patient: PatientRecord) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  currentUser,
  searchQuery,
  findings = [],
  procedures = [],
  encounters = [],
  onSelectPatient,
  onNavigateToDentalChart,
  onAddPatient
}) => {
  const canSeePHI = canViewConfidentialPHI(currentUser.role);
  const canCreatePatient = hasPermission(currentUser.role, 'patient_demographics', 'create');

  const [localSearch, setLocalSearch] = useState('');
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<PatientRecord | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // New patient form state
  const [newName, setNewName] = useState('');
  const [newLatinName, setNewLatinName] = useState('');
  const [newDob, setNewDob] = useState('1995-05-10');
  const [newSex, setNewSex] = useState<'male' | 'female'>('female');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');

  // Preflight duplicate check (REQ-PAT-003)
  const effectiveQuery = searchQuery || localSearch;
  const filteredPatients = patients.filter(p => 
    searchMatches(effectiveQuery, p.legal_name, p.latin_name, p.mrn, p.phone)
  );

  const duplicateWarning = newPhone.trim() && patients.some(p => p.phone === newPhone.trim());

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    // Calculate age from DOB
    const birthYear = new Date(newDob).getFullYear();
    const currentYear = 2026;
    const calculatedAge = Math.max(1, currentYear - birthYear);

    const newRecord: PatientRecord = {
      id: `pat-${Date.now()}`,
      clinic_id: 'clinic-main',
      mrn: `MRN-2026-0${140 + patients.length + 1}`,
      legal_name: newName.trim(),
      latin_name: newLatinName.trim() || undefined,
      dob: newDob,
      approx_age: calculatedAge,
      sex: newSex,
      phone: newPhone.trim(),
      address: newAddress.trim() || 'الرياض',
      blood_group: newBloodGroup,
      status: 'active',
      created_at: new Date().toISOString(),
      allergies: [
        {
          id: `alg-${Date.now()}`,
          substance: 'لا توجد حساسية دوائية معروفة حالياً',
          status: 'no',
          recorded_at: new Date().toISOString().slice(0, 10)
        }
      ],
      chronic_conditions: [],
      active_medications: [],
      surgical_history: []
    };

    onAddPatient(newRecord);
    setShowNewPatientModal(false);
    setNewName('');
    setNewLatinName('');
    setNewPhone('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">سجل المرضى والملفات الطبية</h2>
          <p className="text-xs text-slate-500">إدارة الملفات وتدقيق التكرارات والتاريخ السريري</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="تصفية حسب الاسم، الهاتف أو رقم الملف..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-white border border-[#DCE5E9] rounded-lg focus:outline-none focus:border-[#0F766E] text-slate-800"
            />
          </div>

          {canCreatePatient && (
            <button
              type="button"
              onClick={() => setShowNewPatientModal(true)}
              className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مريض جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-[#DCE5E9] font-semibold">
              <tr>
                <th className="py-3 px-4">رقم الملف (MRN)</th>
                <th className="py-3 px-4">اسم المريض الكامل</th>
                <th className="py-3 px-4">العمر والجنس</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">تنبيهات الحساسية</th>
                <th className="py-3 px-4">تاريخ التسجيل</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    لا يوجد مريض يطابق معايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => {
                  const hasSevereAllergy = patient.allergies.some(a => a.status === 'yes');

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#0F766E]">
                        {patient.mrn}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{patient.legal_name}</div>
                        {patient.latin_name && (
                          <div className="text-[10px] text-slate-400 font-sans">{patient.latin_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono">{patient.approx_age}</span> سنة ·{' '}
                        <span>{patient.sex === 'female' ? 'أنثى' : 'ذكر'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        {patient.phone}
                      </td>
                      <td className="py-3 px-4">
                        {canSeePHI ? (
                          hasSevereAllergy ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-medium">
                              <AlertCircle className="w-3 h-3" />
                              حساسية مثبتة
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">لا توجد حساسية</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Lock className="w-3 h-3" />
                            محجوب (PHI)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {patient.created_at.slice(0, 10)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPatientForModal(patient)}
                            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px]"
                          >
                            عرض الملف
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPatient(patient);
                              onNavigateToDentalChart(patient);
                            }}
                            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-[11px] font-medium"
                          >
                            مخطط الأسنان
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Patient Dossier Modal */}
      {selectedPatientForModal && (
        <ComprehensivePatientRecordModal
          patient={selectedPatientForModal}
          currentUser={currentUser}
          findings={findings}
          procedures={procedures}
          encounters={encounters}
          isOpen={!!selectedPatientForModal}
          onClose={() => setSelectedPatientForModal(null)}
          onNavigateToDentalChart={p => {
            onSelectPatient(p);
            onNavigateToDentalChart(p);
            setSelectedPatientForModal(null);
          }}
        />
      )}

      {/* New Patient Registration Modal (REQ-PAT-001 & REQ-PAT-002) */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">تسجيل مريض جديد وفتح ملف رقمي</h3>
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">تحذير تكرار مسبق (Preflight Duplicate Check):</span>
                  رقم الهاتف هذا مسجل بالفعل لمريض سابق في قاعدة البيانات. تحقق من صحة الرقم لمنع تكرار الملفات.
                </div>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">الاسم القانوني بالعربية:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="مثال: عبد الرحمن عبد العزيز العثمان"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الاسم باللاتينية (اختياري):</label>
                <input
                  type="text"
                  value={newLatinName}
                  onChange={e => setNewLatinName(e.target.value)}
                  placeholder="Abdulrahman Abdulaziz Al-Othman"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">رقم الهاتف الجوال:</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="050xxxxxxx"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">تاريخ الميلاد:</label>
                  <input
                    type="date"
                    required
                    value={newDob}
                    onChange={e => setNewDob(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الجنس البيولوجي (مفصول عن العمر):</label>
                  <select
                    value={newSex}
                    onChange={e => setNewSex(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">فصيلة الدم:</label>
                  <select
                    value={newBloodGroup}
                    onChange={e => setNewBloodGroup(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E] font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">عنوان الإقامة والحي:</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="الرياض — حي الندى"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white font-medium shadow-sm"
                >
                  حفظ وتسجيل المريض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
