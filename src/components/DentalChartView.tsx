import React, { useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Clock, 
  Eye, 
  FileText, 
  Lock, 
  Plus, 
  ShieldAlert, 
  Trash2, 
  X 
} from 'lucide-react';
import { 
  DentitionType, 
  DentalFinding, 
  DentalProcedure, 
  PatientRecord, 
  ToothConditionCode, 
  ToothSurface, 
  UserAccount,
  ClinicalEncounter
} from '../types/clinic';
import { 
  PERMANENT_TEETH_CODES, 
  PRIMARY_TEETH_CODES, 
  TOOTH_CONDITIONS_META, 
  getToothInfo 
} from '../domain/dental';
import { hasPermission } from '../domain/permissions';
import { AnatomicalDentalArchBoard } from './AnatomicalDentalArchBoard';
import { ComprehensivePatientRecordModal } from './ComprehensivePatientRecordModal';

interface DentalChartViewProps {
  patient: PatientRecord;
  currentUser: UserAccount;
  findings: DentalFinding[];
  procedures: DentalProcedure[];
  encounters?: ClinicalEncounter[];
  onAddFinding: (finding: Omit<DentalFinding, 'id' | 'observed_at'>) => void;
  onAddProcedure: (proc: Omit<DentalProcedure, 'id' | 'planned_at'>) => void;
  onSelectPatient?: (p: PatientRecord) => void;
}

export const DentalChartView: React.FC<DentalChartViewProps> = ({
  patient,
  currentUser,
  findings,
  procedures,
  encounters = [],
  onAddFinding,
  onAddProcedure,
  onSelectPatient
}) => {
  const canView = hasPermission(currentUser.role, 'dental_odontogram', 'view');
  const canEdit = hasPermission(currentUser.role, 'dental_odontogram', 'edit');

  const [dentitionMode, setDentitionMode] = useState<DentitionType | 'mixed'>('permanent');
  const [chartViewMode, setChartViewMode] = useState<'arch' | 'grid'>('arch');
  const [showComprehensiveDossier, setShowComprehensiveDossier] = useState(false);
  const [selectedToothCode, setSelectedToothCode] = useState<number | null>(26); // Default select tooth 26
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>(['O']);
  const [selectedCondition, setSelectedCondition] = useState<ToothConditionCode>('caries');
  const [findingNotes, setFindingNotes] = useState('');
  const [showAddFindingModal, setShowAddFindingModal] = useState(false);

  // If role does not have permission, show RBAC barrier as specified in REQ-AUTH-009
  if (!canView) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-xl border border-amber-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">وصول محجوب وفق الصلاحيات (REQ-AUTH-009)</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          حسابك الحالي بدور <span className="font-semibold text-amber-800 font-mono">[{currentUser.role}]</span> غير مصرح له بالاطلاع على التفاصيل الطبية الدقيقة ومخطط الأسنان السريري لحماية خصوصية المريض.
        </p>
        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
          للاطلاع على المخطط السني الكامل، يرجى تبديل المستخدم في القائمة الجانبية إلى <strong>د. طارق الحكيم (المالك)</strong> أو <strong>د. مريم العوضي (طبيبة)</strong>.
        </p>
      </div>
    );
  }

  // Find findings & procedures for selected tooth
  const toothFindings = findings.filter(f => f.tooth_code === selectedToothCode);
  const toothProcedures = procedures.filter(p => p.tooth_code === selectedToothCode);
  const selectedToothInfo = selectedToothCode ? getToothInfo(selectedToothCode) : null;

  // Render tooth icon / surface layout
  const renderToothCell = (code: number) => {
    const info = getToothInfo(code);
    const toothFindingsList = findings.filter(f => f.tooth_code === code);
    const toothProcsList = procedures.filter(p => p.tooth_code === code);
    const isSelected = selectedToothCode === code;

    // Determine primary condition
    const primaryFinding = toothFindingsList[0];
    const conditionMeta = primaryFinding 
      ? TOOTH_CONDITIONS_META[primaryFinding.condition] 
      : TOOTH_CONDITIONS_META.healthy;

    const hasMissing = toothFindingsList.some(f => f.condition === 'missing');
    const hasCaries = toothFindingsList.some(f => f.condition === 'caries');
    const hasCrown = toothFindingsList.some(f => f.condition === 'crown');
    const hasEndo = toothFindingsList.some(f => f.condition === 'endodontic');
    const hasImplant = toothFindingsList.some(f => f.condition === 'implant');

    return (
      <button
        key={code}
        type="button"
        onClick={() => setSelectedToothCode(code)}
        className={`group relative flex flex-col items-center p-1.5 rounded-lg border transition-all ${
          isSelected 
            ? 'border-[#0F766E] bg-[#E7F5F3] shadow-md ring-2 ring-[#0F766E]/20' 
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {/* FDI Code */}
        <span className="text-[11px] font-bold text-slate-700 font-mono tabular-nums mb-1">
          {code}
        </span>

        {/* 2D Anatomical Multi-Surface Schematic Tooth */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          {hasMissing ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-100 rounded border border-slate-300">
              ✕
            </div>
          ) : hasImplant ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-teal-800 text-[10px] font-bold bg-teal-100 rounded border border-teal-500">
              <span>IMP</span>
              <span className="text-[8px] font-mono">⚓</span>
            </div>
          ) : (
            <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-slate-400 shadow-inner bg-slate-100">
              {/* Buccal (Top) */}
              <div 
                className={`absolute top-0 inset-x-0 h-2 transition-colors ${
                  toothFindingsList.some(f => f.surfaces?.includes('B')) 
                    ? 'bg-red-500' 
                    : hasCrown ? 'bg-amber-400' : 'bg-slate-50 hover:bg-slate-200'
                }`}
                title="السطح الخدي / الدهليزي (B)"
              />
              {/* Lingual / Palatal (Bottom) */}
              <div 
                className={`absolute bottom-0 inset-x-0 h-2 transition-colors ${
                  toothFindingsList.some(f => f.surfaces?.includes('L')) 
                    ? 'bg-red-500' 
                    : hasCrown ? 'bg-amber-400' : 'bg-slate-50 hover:bg-slate-200'
                }`}
                title="السطح اللساني / الحنكي (L)"
              />
              {/* Mesial (Right in upper right, etc.) */}
              <div 
                className={`absolute inset-y-2 right-0 w-2 transition-colors ${
                  toothFindingsList.some(f => f.surfaces?.includes('M')) 
                    ? 'bg-red-500' 
                    : hasCrown ? 'bg-amber-400' : 'bg-slate-100 hover:bg-slate-200'
                }`}
                title="السطح الإنسي (M)"
              />
              {/* Distal (Left) */}
              <div 
                className={`absolute inset-y-2 left-0 w-2 transition-colors ${
                  toothFindingsList.some(f => f.surfaces?.includes('D')) 
                    ? 'bg-red-500' 
                    : hasCrown ? 'bg-amber-400' : 'bg-slate-100 hover:bg-slate-200'
                }`}
                title="السطح الوحشي (D)"
              />
              {/* Occlusal / Incisal (Center) */}
              <div 
                className={`absolute inset-2 border border-slate-300 flex items-center justify-center transition-colors ${
                  toothFindingsList.some(f => f.surfaces?.includes('O')) 
                    ? 'bg-red-600' 
                    : hasEndo ? 'bg-purple-500' : hasCrown ? 'bg-amber-500' : 'bg-white'
                }`}
                title="السطح الطاحن / القاطع (O)"
              >
                {hasEndo && <span className="text-[8px] text-white font-bold">R</span>}
                {hasCrown && <span className="text-[8px] text-white font-bold">C</span>}
              </div>
            </div>
          )}
        </div>

        {/* Status mini dots */}
        <div className="flex gap-0.5 mt-1 h-1.5 items-center">
          {hasCaries && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="تسوس" />}
          {hasEndo && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="علاج عصب" />}
          {hasCrown && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="تاج" />}
          {toothProcsList.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title="إجراء مخطط" />}
        </div>
      </button>
    );
  };

  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToothCode) return;

    onAddFinding({
      patient_id: patient.id,
      tooth_code: selectedToothCode,
      surfaces: selectedSurfaces,
      condition: selectedCondition,
      notes: findingNotes,
      doctor_id: currentUser.id,
      doctor_name: currentUser.name
    });

    setFindingNotes('');
    setShowAddFindingModal(false);
  };

  const handleAddQuickProcedure = (name: string, code: string, price: number) => {
    if (!selectedToothCode) return;
    onAddProcedure({
      patient_id: patient.id,
      tooth_code: selectedToothCode,
      surfaces: selectedSurfaces,
      procedure_code: code,
      procedure_name_ar: name,
      price,
      status: 'planned',
      doctor_id: currentUser.id,
      doctor_name: currentUser.name
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Patient Header Alert Strip */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-sm">
            {patient.legal_name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-900">{patient.legal_name}</h2>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {patient.mrn}
              </span>
              <span className="text-xs text-slate-500">
                العمر: {patient.approx_age} سنة ({patient.sex === 'female' ? 'أنثى' : 'ذكر'})
              </span>
            </div>
            {patient.allergies.some(a => a.status === 'yes') && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>تنبيه حساسية مثبتة: </span>
                <span>
                  {patient.allergies.filter(a => a.status === 'yes').map(a => a.substance).join('، ')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Comprehensive Medical Dossier Button */}
          <button
            type="button"
            onClick={() => setShowComprehensiveDossier(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#164E63] hover:bg-[#113d4e] text-white text-xs font-bold shadow-xs transition-colors border border-teal-700/50"
            title="فتح الملف الطبي السني الشامل للمريض"
          >
            <FileText className="w-4 h-4 text-teal-300" />
            <span>الملف الطبي الشامل (Dossier)</span>
            {patient.allergies.some(a => a.status === 'yes') && (
              <span className="w-2 h-2 rounded-full bg-red-400 ring-2 ring-red-400/40 mr-1" />
            )}
          </button>

          {/* Dentition View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setDentitionMode('permanent')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              dentitionMode === 'permanent' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الأسنان الدائمة (32 سن)
          </button>
          <button
            type="button"
            onClick={() => setDentitionMode('primary')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              dentitionMode === 'primary' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الأسنان اللبنية (20 سن)
          </button>
          <button
            type="button"
            onClick={() => setDentitionMode('mixed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              dentitionMode === 'mixed' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسنين مختلط (Mixed)
          </button>
        </div>
      </div>
    </div>

      {/* Main Grid: Odontogram Chart (Left 2/3) + Selected Tooth Panel (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Odontogram Visual Board */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#DCE5E9] p-5 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0F766E]" />
              <h3 className="font-bold text-sm text-slate-900">مخطط الأسنان السريري (FDI Dental Arch)</h3>
            </div>
            
            {/* View Mode Toggle: Arch View (User's reference image) vs Grid View */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setChartViewMode('arch')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  chartViewMode === 'arch' 
                    ? 'bg-[#0F766E] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                القوس التشريحي (Arch View)
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('grid')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  chartViewMode === 'grid' 
                    ? 'bg-[#0F766E] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                المخطط المربعي (Grid View)
              </button>
            </div>
          </div>

          {/* Render Arch View (matching user reference image) or Grid View */}
          {chartViewMode === 'arch' ? (
            <div className="py-2">
              <AnatomicalDentalArchBoard
                dentitionMode={dentitionMode}
                selectedToothCode={selectedToothCode}
                findings={findings}
                procedures={procedures}
                onSelectTooth={setSelectedToothCode}
              />
            </div>
          ) : (
            <>
              {/* PERMANENT UPPER JAW (Maxilla) */}
              {(dentitionMode === 'permanent' || dentitionMode === 'mixed') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
                    <span>الفك العلوي الأيمن (Q1: 18 - 11)</span>
                    <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px]">الفك العلوي (Maxilla)</span>
                    <span>الفك العلوي الأيسر (Q2: 21 - 28)</span>
                  </div>
                  <div className="grid grid-cols-16 gap-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-8 grid grid-cols-8 gap-1">
                      {[18, 17, 16, 15, 14, 13, 12, 11].map(renderToothCell)}
                    </div>
                    <div className="col-span-8 grid grid-cols-8 gap-1 border-r border-dashed border-slate-300 pr-1">
                      {[21, 22, 23, 24, 25, 26, 27, 28].map(renderToothCell)}
                    </div>
                  </div>
                </div>
              )}

              {/* PRIMARY TEETH (Deciduous) in Mixed or Primary mode */}
              {(dentitionMode === 'primary' || dentitionMode === 'mixed') && (
                <div className="space-y-2 py-2 border-y border-dashed border-teal-200 bg-teal-50/30 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-800 px-2">
                    <span>الأسنان اللبنية العلوية (Q5: 55 - 51)</span>
                    <span className="text-teal-900 font-bold">تسنين الأطفال (Primary Teeth)</span>
                    <span>الأسنان اللبنية العلوية (Q6: 61 - 65)</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 max-w-xl mx-auto">
                    <div className="col-span-5 grid grid-cols-5 gap-1">
                      {[55, 54, 53, 52, 51].map(renderToothCell)}
                    </div>
                    <div className="col-span-5 grid grid-cols-5 gap-1 border-r border-dashed border-teal-300 pr-1">
                      {[61, 62, 63, 64, 65].map(renderToothCell)}
                    </div>
                  </div>

                  {/* Primary Lower */}
                  <div className="grid grid-cols-10 gap-1.5 max-w-xl mx-auto pt-2">
                    <div className="col-span-5 grid grid-cols-5 gap-1">
                      {[85, 84, 83, 82, 81].map(renderToothCell)}
                    </div>
                    <div className="col-span-5 grid grid-cols-5 gap-1 border-r border-dashed border-teal-300 pr-1">
                      {[71, 72, 73, 74, 75].map(renderToothCell)}
                    </div>
                  </div>
                </div>
              )}

              {/* PERMANENT LOWER JAW (Mandible) */}
              {(dentitionMode === 'permanent' || dentitionMode === 'mixed') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
                    <span>الفك السفلي الأيمن (Q4: 48 - 41)</span>
                    <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px]">الفك السفلي (Mandible)</span>
                    <span>الفك السفلي الأيسر (Q3: 31 - 38)</span>
                  </div>
                  <div className="grid grid-cols-16 gap-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-8 grid grid-cols-8 gap-1">
                      {[48, 47, 46, 45, 44, 43, 42, 41].map(renderToothCell)}
                    </div>
                    <div className="col-span-8 grid grid-cols-8 gap-1 border-r border-dashed border-slate-300 pr-1">
                      {[31, 32, 33, 34, 35, 36, 37, 38].map(renderToothCell)}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Clinical Visual Legend (دليل الرموز والألوان) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 mb-2.5">دليل الحالات السريرية المعتمد (Legend):</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                <span className="truncate">تسوس / نخر</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">حشوة كمبوزيت</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">تاج / تلبيسة</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">معالجة عصب</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-teal-600 shrink-0" />
                <span className="truncate">زرعة سنية</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-200">
                <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">مفقود / مقلوع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Tooth Details & Treatment Action Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedToothInfo ? (
            <div className="bg-white rounded-xl border border-[#DCE5E9] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs text-slate-500 font-mono">FDI #{selectedToothInfo.code}</div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedToothInfo.name_ar}</h4>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setShowAddFindingModal(true)}
                    className="flex items-center gap-1 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تشخيص جديد</span>
                  </button>
                )}
              </div>

              {/* Surface Selector Visualizer */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>الأسطح المحددة:</span>
                  <span className="text-[11px] font-mono text-[#0F766E] font-bold">
                    {selectedSurfaces.join(' + ') || 'لا يوجد'}
                  </span>
                </div>
                <div className="flex gap-1.5 justify-center pt-1">
                  {(['M', 'D', 'B', 'L', 'O'] as ToothSurface[]).map(s => {
                    const active = selectedSurfaces.includes(s);
                    const surfaceNames: Record<ToothSurface, string> = {
                      M: 'إنسي (M)',
                      D: 'وحشي (D)',
                      B: 'خدي (B)',
                      L: 'لساني (L)',
                      O: 'طاحن (O)'
                    };
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setSelectedSurfaces(selectedSurfaces.filter(x => x !== s));
                          } else {
                            setSelectedSurfaces([...selectedSurfaces, s]);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded border font-mono font-medium transition-colors ${
                          active
                            ? 'bg-[#0F766E] text-white border-[#0F766E]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title={surfaceNames[s]}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tooth History & Current Findings */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700">التشخيصات السريرية المسجلة للسن:</h5>
                {toothFindings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">لا توجد إصابات أو تشخيصات مسجلة (السن سليم).</p>
                ) : (
                  <div className="space-y-2">
                    {toothFindings.map(f => {
                      const meta = TOOTH_CONDITIONS_META[f.condition];
                      return (
                        <div key={f.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${meta.badgeClass}`}>
                              {meta.label_ar}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                              {f.observed_at.slice(0, 10)}
                            </span>
                          </div>
                          {f.surfaces && f.surfaces.length > 0 && (
                            <div className="text-[11px] text-slate-600 font-mono">
                              الأسطح: {f.surfaces.join(', ')}
                            </div>
                          )}
                          {f.notes && (
                            <p className="text-[11px] text-slate-600 leading-normal">{f.notes}</p>
                          )}
                          <div className="text-[10px] text-slate-400">بواسطة: {f.doctor_name}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tooth Treatment Plans & Procedures */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-700">الإجراءات وخطط العلاج للسن:</h5>
                {toothProcedures.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">لا توجد إجراءات مسجلة.</p>
                ) : (
                  <div className="space-y-2">
                    {toothProcedures.map(p => (
                      <div key={p.id} className="p-2 rounded-lg border border-teal-100 bg-teal-50/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-teal-900">{p.procedure_name_ar}</span>
                          <span className="font-mono font-bold text-slate-800">{p.price} SAR</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>الحالة: {p.status === 'completed' ? 'منجز مكتمل' : 'مخطط'}</span>
                          <span>كود: {p.procedure_code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Procedure Buttons */}
                {canEdit && (
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-500 mb-1.5 font-medium">إضافة سريعة لخطة العلاج:</div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleAddQuickProcedure('حشوة كمبوزيت ضوئية', 'D2391', 250)}
                        className="p-1.5 rounded border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50 text-slate-800 text-right truncate transition-colors"
                      >
                        + حشوة كمبوزيت (250 SAR)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickProcedure('علاج عصب (قناة جذر)', 'D3330', 950)}
                        className="p-1.5 rounded border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50 text-slate-800 text-right truncate transition-colors"
                      >
                        + علاج عصب (950 SAR)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickProcedure('تاج زيركون كامل', 'D2740', 1200)}
                        className="p-1.5 rounded border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50 text-slate-800 text-right truncate transition-colors"
                      >
                        + تاج زيركون (1200 SAR)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickProcedure('قلع جراحي بسيط', 'D7140', 300)}
                        className="p-1.5 rounded border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50 text-slate-800 text-right truncate transition-colors"
                      >
                        + قلع سن (300 SAR)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#DCE5E9] p-8 text-center text-slate-400 text-xs">
              اختر سناً من المخطط لعرض حالته وإجراءاته السريرية.
            </div>
          )}
        </div>
      </div>

      {/* Add Finding Modal */}
      {showAddFindingModal && selectedToothInfo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                تسجيل تشخيص سريري للسن #{selectedToothInfo.code}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFindingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFinding} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">نوع الحالة / التشخيص السريري:</label>
                <select
                  value={selectedCondition}
                  onChange={e => setSelectedCondition(e.target.value as ToothConditionCode)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                >
                  {Object.entries(TOOTH_CONDITIONS_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الأسطح المصابة:</label>
                <div className="flex gap-2">
                  {(['M', 'D', 'B', 'L', 'O'] as ToothSurface[]).map(s => {
                    const checked = selectedSurfaces.includes(s);
                    return (
                      <label key={s} className="flex items-center gap-1 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedSurfaces(selectedSurfaces.filter(x => x !== s));
                            } else {
                              setSelectedSurfaces([...selectedSurfaces, s]);
                            }
                          }}
                          className="rounded text-[#0F766E]"
                        />
                        <span className="font-mono font-medium">{s}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ملاحظات الطبيب السريرية:</label>
                <textarea
                  rows={3}
                  value={findingNotes}
                  onChange={e => setFindingNotes(e.target.value)}
                  placeholder="وصف شدة الإصابة، عمق النخر، الأعراض المرافقة..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFindingModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6861] text-white font-medium shadow-sm"
                >
                  حفظ في المخطط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Patient Medical Dossier Modal */}
      <ComprehensivePatientRecordModal
        patient={patient}
        currentUser={currentUser}
        findings={findings}
        procedures={procedures}
        encounters={encounters}
        isOpen={showComprehensiveDossier}
        onClose={() => setShowComprehensiveDossier(false)}
        onNavigateToDentalChart={() => setShowComprehensiveDossier(false)}
      />
    </div>
  );
};
