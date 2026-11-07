import React, { useState } from 'react';
import { 
  Check, 
  FileCheck, 
  FileEdit, 
  FileText, 
  Lock, 
  Pencil, 
  Plus, 
  Printer, 
  ShieldAlert, 
  Stethoscope, 
  User, 
  X 
} from 'lucide-react';
import { ClinicalEncounter, PatientRecord, PrescriptionItem, UserAccount } from '../types/clinic';
import { canSignClinicalEncounter, canViewConfidentialPHI } from '../domain/permissions';

interface EncountersViewProps {
  encounters: ClinicalEncounter[];
  patients: PatientRecord[];
  currentUser: UserAccount;
  onAddEncounter: (enc: ClinicalEncounter) => void;
  onAddAmendment: (encounterId: string, reason: string, newNotes: string) => void;
}

export const EncountersView: React.FC<EncountersViewProps> = ({
  encounters,
  patients,
  currentUser,
  onAddEncounter,
  onAddAmendment
}) => {
  const canSeePHI = canViewConfidentialPHI(currentUser.role);
  const canSign = canSignClinicalEncounter(currentUser.role);

  const [selectedEncounter, setSelectedEncounter] = useState<ClinicalEncounter>(encounters[0]);
  const [showNewEncounterModal, setShowNewEncounterModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showPrescriptionPrintModal, setShowPrescriptionPrintModal] = useState(false);

  // New encounter form
  const [targetPatientId, setTargetPatientId] = useState(patients[0]?.id || '');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'p-1',
      drug_name: 'أموكسيسيلين (Amoxicillin 500mg)',
      dose: '500 ملغ',
      frequency: 'كبسولة كل 8 ساعات',
      duration: '5 أيام',
      instructions: 'بعد الأكل مع كمية وافرة من الماء'
    }
  ]);

  // Amendment form
  const [amendmentReason, setAmendmentReason] = useState('');
  const [amendedNotes, setAmendedNotes] = useState('');

  if (!canSeePHI) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-xl border border-amber-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">الملفات والزيارات السريرية محجوبة (REQ-AUTH-009)</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          وفقاً لمصفوفة الصلاحيات المشددة، لا تتاح الملاحظات السريرية، التشخيصات ووصفات الأدوية لحسابات الاستقبال والمحاسبة لحماية الخصوصية الطبية.
        </p>
      </div>
    );
  }

  const handleCreateEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === targetPatientId);
    if (!pat) return;

    const newEnc: ClinicalEncounter = {
      id: `enc-${Date.now()}`,
      patient_id: pat.id,
      patient_name: pat.legal_name,
      doctor_id: currentUser.id,
      doctor_name: currentUser.name,
      encounter_date: new Date().toISOString(),
      chief_complaint: chiefComplaint,
      clinical_notes: clinicalNotes,
      diagnoses: diagnosisInput.split(',').map(d => d.trim()).filter(Boolean),
      procedures_performed: [],
      prescriptions,
      is_signed: true,
      signed_at: new Date().toISOString(),
      amendments: []
    };

    onAddEncounter(newEnc);
    setSelectedEncounter(newEnc);
    setShowNewEncounterModal(false);
    setChiefComplaint('');
    setClinicalNotes('');
  };

  const handleSaveAmendment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter || !amendmentReason.trim() || !amendedNotes.trim()) return;

    onAddAmendment(selectedEncounter.id, amendmentReason, amendedNotes);
    setShowAmendmentModal(false);
    setAmendmentReason('');
    setAmendedNotes('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">سجل الزيارات السريرية والوصفات الطبية</h2>
          <p className="text-xs text-slate-500">توثيق الفحوصات والتشخيص والتصحيحات المعتمدة مع منع الحذف الصامت</p>
        </div>

        {canSign && (
          <button
            type="button"
            onClick={() => setShowNewEncounterModal(true)}
            className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>توثيق زيارة وفحص سريري جديد</span>
          </button>
        )}
      </div>

      {/* 2-Column Layout: Encounters List (Left 4 cols) + Active Encounter Document (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Encounters List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#DCE5E9] p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700 border-b border-slate-100 pb-2">
            الزيارات السريرية المسجلة ({encounters.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {encounters.map(enc => {
              const isSelected = selectedEncounter?.id === enc.id;
              return (
                <button
                  key={enc.id}
                  type="button"
                  onClick={() => setSelectedEncounter(enc)}
                  className={`w-full text-right p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                    isSelected 
                      ? 'border-[#0F766E] bg-[#E7F5F3] shadow-sm' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{enc.patient_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {enc.encounter_date.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{enc.chief_complaint}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{enc.doctor_name}</span>
                    {enc.is_signed && (
                      <span className="text-emerald-700 font-medium">✓ معتمد وموقع</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Encounter Detailed View */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#DCE5E9] p-6 shadow-sm space-y-6">
          {selectedEncounter ? (
            <>
              {/* Document Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-[#0F766E] font-bold">
                    معرف الزيارة: {selectedEncounter.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedEncounter.patient_name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    الطبيب الفاحص: {selectedEncounter.doctor_name} · التاريخ: {selectedEncounter.encounter_date.slice(0, 10)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionPrintModal(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-[#0F766E]" />
                    <span>طباعة الوصفة الطبية (Rx)</span>
                  </button>

                  {canSign && (
                    <button
                      type="button"
                      onClick={() => {
                        setAmendedNotes(selectedEncounter.clinical_notes);
                        setShowAmendmentModal(true);
                      }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                      title="تصحيح السجل المعتمد دون حذف الأصل (REQ-PAT-006)"
                    >
                      <FileEdit className="w-4 h-4" />
                      <span>إجراء تصحيح رسمي (Amendment)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chief Complaint & Notes */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">الشكوى الرئيسية (Chief Complaint):</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                    {selectedEncounter.chief_complaint}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 mb-1">الملاحظات السريرية والفحص (Clinical Findings & SOAP):</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                    {selectedEncounter.clinical_notes}
                  </div>
                </div>

                {/* Diagnoses */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">التشخيصات السريرية (Diagnoses):</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEncounter.diagnoses.map((diag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 font-medium">
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prescriptions */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">الوصفة الدوائية المعتمدة (Prescriptions):</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">اسم الدواء والعيار</th>
                          <th className="py-2 px-3">الجرعة والتكرار</th>
                          <th className="py-2 px-3">المدة</th>
                          <th className="py-2 px-3">التعليمات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEncounter.prescriptions.map(item => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{item.drug_name}</td>
                            <td className="py-2.5 px-3">{item.frequency}</td>
                            <td className="py-2.5 px-3 font-mono">{item.duration}</td>
                            <td className="py-2.5 px-3 text-slate-500">{item.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Amendments History (REQ-PAT-006: Immutable Audit Trail) */}
                {selectedEncounter.amendments && selectedEncounter.amendments.length > 0 && (
                  <div className="pt-4 border-t border-amber-200">
                    <h4 className="font-bold text-xs text-amber-900 mb-2 flex items-center gap-1.5">
                      <FileEdit className="w-4 h-4 text-amber-700" />
                      <span>سجل التصحيحات المعتمدة للملف (Amendment Audit Trail):</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedEncounter.amendments.map(am => (
                        <div key={am.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-amber-900 font-medium">
                            <span>سبب التصحيح: {am.reason}</span>
                            <span className="font-mono text-[10px] text-slate-500">{am.amended_at.slice(0, 16)}</span>
                          </div>
                          <div className="text-slate-700">بواسطة: {am.doctor_name}</div>
                          <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-amber-100">
                            النص الأصلي المحفوظ للأرشفة: {am.previous_notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              اختر زيارة سريرية لعرض تفاصيلها.
            </div>
          )}
        </div>
      </div>

      {/* Prescription Pad Print Modal (A4 / Pad Layout) */}
      {showPrescriptionPrintModal && selectedEncounter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <h3 className="font-bold text-sm text-slate-900">معاينة طباعة الوصفة الطبية (Rx)</h3>
              <button
                type="button"
                onClick={() => setShowPrescriptionPrintModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Prescription Template */}
            <div className="border border-slate-300 p-6 rounded-lg bg-white space-y-4 text-xs font-sans">
              {/* Clinic & Doctor Header */}
              <div className="flex items-center justify-between border-b-2 border-[#164E63] pb-3">
                <div>
                  <h2 className="font-bold text-base text-[#164E63]">عيادات النخبة لطب الأسنان المتقدم</h2>
                  <p className="text-[11px] text-slate-600">{selectedEncounter.doctor_name}</p>
                  <p className="text-[10px] text-slate-500">استشاري جراحة الوجه والفكين وزراعة الأسنان</p>
                </div>
                <div className="text-left text-[11px] font-mono text-slate-600">
                  <div>التاريخ: {selectedEncounter.encounter_date.slice(0, 10)}</div>
                  <div>رقم الزيارة: {selectedEncounter.id}</div>
                </div>
              </div>

              {/* Patient info strip */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500">اسم المريض: </span>
                  <span className="font-bold text-slate-900">{selectedEncounter.patient_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">التشخيص: </span>
                  <span className="font-medium text-slate-800">{selectedEncounter.diagnoses.join('، ')}</span>
                </div>
              </div>

              {/* Rx Symbol & Medication lines */}
              <div className="pt-2 space-y-3">
                <div className="text-2xl font-serif font-bold text-[#164E63]">℞</div>
                <div className="space-y-3 pl-2">
                  {selectedEncounter.prescriptions.map((rx, idx) => (
                    <div key={rx.id} className="border-b border-dashed border-slate-200 pb-2">
                      <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                        <span>{idx + 1}. {rx.drug_name}</span>
                        <span className="font-mono text-slate-600">{rx.duration}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 mt-0.5">{rx.frequency}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">ملاحظات: {rx.instructions}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature line */}
              <div className="pt-8 flex items-center justify-between text-xs border-t border-slate-200 mt-6">
                <div className="text-[10px] text-slate-400">
                  صدرت الوثيقة إلكترونياً وموثقة بسجل التشفير والتدقيق الطبي
                </div>
                <div className="text-center">
                  <div className="font-serif italic text-sm text-teal-800 font-bold mb-1">
                    {selectedEncounter.doctor_name}
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 text-[10px] text-slate-600">
                    توقيع وختم الطبيب المعالج
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 no-print">
              <button
                type="button"
                onClick={() => setShowPrescriptionPrintModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white text-xs font-medium shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Modal (REQ-PAT-006) */}
      {showAmendmentModal && selectedEncounter && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                إجراء تصحيح رسمي مرتبط بالسجل (Medical Record Amendment)
              </h3>
              <button
                type="button"
                onClick={() => setShowAmendmentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAmendment} className="space-y-3 text-xs">
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                وفقاً لمعايير التوثيق الطبي (REQ-PAT-006): يُمنع الحذف الصامت للسجل المعتمد، ويتم حفظ النص الأصلي مع سبب التصحيح وهوية الطبيب والتاريخ.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">سبب التعديل / التصحيح السريري:</label>
                <input
                  type="text"
                  required
                  value={amendmentReason}
                  onChange={e => setAmendmentReason(e.target.value)}
                  placeholder="مثال: تصحيح كود السن المعالج أو تحديث الملاحظات بعد الأشعة..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الملاحظات المصححة الجديدة:</label>
                <textarea
                  rows={4}
                  required
                  value={amendedNotes}
                  onChange={e => setAmendedNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAmendmentModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white font-medium shadow-sm"
                >
                  حفظ وتوثيق التصحيح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
