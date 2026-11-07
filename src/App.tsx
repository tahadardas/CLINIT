import React, { useState } from 'react';
import { 
  Appointment, 
  ClinicalEncounter, 
  ClinicLicense, 
  DentalFinding, 
  DentalProcedure, 
  Invoice, 
  PatientRecord, 
  PaymentRecord, 
  UserAccount 
} from './types/clinic';
import { 
  MOCK_APPOINTMENTS, 
  MOCK_DENTAL_FINDINGS, 
  MOCK_DENTAL_PROCEDURES, 
  MOCK_ENCOUNTERS, 
  MOCK_INVOICES, 
  MOCK_LICENSE, 
  MOCK_PATIENTS, 
  MOCK_PAYMENTS, 
  MOCK_USERS 
} from './data/mockData';
import { NavItem, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DentalChartView } from './components/DentalChartView';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { ScheduleView } from './components/ScheduleView';
import { EncountersView } from './components/EncountersView';
import { BillingView } from './components/BillingView';
import { PermissionsView } from './components/PermissionsView';
import { SyncBackupView } from './components/SyncBackupView';
import { LicensingView } from './components/LicensingView';
import { FlutterCodePackageView } from './components/FlutterCodePackageView';
import { FirstRunWizardModal } from './components/FirstRunWizardModal';
import { LockScreenModal } from './components/LockScreenModal';
import { PreflightDiagnosticsModal } from './components/PreflightDiagnosticsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dental_chart');
  const [currentUser, setCurrentUser] = useState<UserAccount>(MOCK_USERS[0]);
  const [patients, setPatients] = useState<PatientRecord[]>(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord>(MOCK_PATIENTS[0]);
  const [findings, setFindings] = useState<DentalFinding[]>(MOCK_DENTAL_FINDINGS);
  const [procedures, setProcedures] = useState<DentalProcedure[]>(MOCK_DENTAL_PROCEDURES);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [encounters, setEncounters] = useState<ClinicalEncounter[]>(MOCK_ENCOUNTERS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [license, setLicense] = useState<ClinicLicense>(MOCK_LICENSE);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Production State & First-Run Wizard
  const [clinicName, setClinicName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('clinic_profile_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.clinicName) return parsed.clinicName;
        } catch {
          // fallback
        }
      }
    }
    return 'عيادات النخبة لطب وجراحة الأسنان';
  });

  const [isFirstRunOpen, setIsFirstRunOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') return false;
    if (urlParams.get('setup') === '1') return true;
    return !localStorage.getItem('clinic_setup_completed');
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // Handlers
  const handleAddFinding = (findingData: Omit<DentalFinding, 'id' | 'observed_at'>) => {
    const newFinding: DentalFinding = {
      ...findingData,
      id: `find-${Date.now()}`,
      observed_at: new Date().toISOString()
    };
    setFindings(prev => [newFinding, ...prev]);
  };

  const handleAddProcedure = (procData: Omit<DentalProcedure, 'id' | 'planned_at'>) => {
    const newProc: DentalProcedure = {
      ...procData,
      id: `proc-${Date.now()}`,
      planned_at: new Date().toISOString()
    };
    setProcedures(prev => [newProc, ...prev]);
  };

  const handleAddPatient = (patient: PatientRecord) => {
    setPatients(prev => [patient, ...prev]);
    setSelectedPatient(patient);
  };

  const handleAddAppointment = (app: Appointment) => {
    setAppointments(prev => [app, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleAddEncounter = (enc: ClinicalEncounter) => {
    setEncounters(prev => [enc, ...prev]);
  };

  const handleAddAmendment = (encounterId: string, reason: string, newNotes: string) => {
    setEncounters(prev =>
      prev.map(enc => {
        if (enc.id === encounterId) {
          const amendment = {
            id: `amd-${Date.now()}`,
            reason,
            amended_at: new Date().toISOString(),
            doctor_name: currentUser.name,
            previous_notes: enc.clinical_notes
          };
          return {
            ...enc,
            clinical_notes: newNotes,
            amendments: [amendment, ...enc.amendments]
          };
        }
        return enc;
      })
    );
  };

  const handleAddPayment = (pay: PaymentRecord) => {
    setPayments(prev => [pay, ...prev]);
    // update invoice balance
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === pay.invoice_id) {
          const newPaid = inv.paid_amount + pay.amount;
          return {
            ...inv,
            paid_amount: newPaid,
            status: newPaid >= inv.grand_total ? 'paid' : 'partially_paid'
          };
        }
        return inv;
      })
    );
  };

  const tabTitles: Record<NavItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'لوحة التحكم والمتابعة اليومية',
      subtitle: 'حالة العيادة والكراسي ومواعيد اليوم وملخص الأمان'
    },
    dental_chart: {
      title: 'مخطط الأسنان السريري التفاعلي (FDI 2-Digit Notation)',
      subtitle: `المريض الحالي: ${selectedPatient.legal_name} (${selectedPatient.mrn}) · 32 سن دائم + 20 لبني`
    },
    patients: {
      title: 'دليل المرضى وسجلات الملفات الرقمية',
      subtitle: 'بحث ذكي بالتطبيع العربي، كشف التكرار المسبق والتاريخ المرضي'
    },
    schedule: {
      title: 'تقويم المواعيد وإدارة الكراسي الثلاثية',
      subtitle: 'كشف التعارضات اللحظية وطابور انتظار المرضى'
    },
    encounters: {
      title: 'الزيارات السريرية والوصفات الطبية',
      subtitle: 'فحص سريري، توثيق SOAP، وصفات طبية وتصحيحات معتمدة'
    },
    billing: {
      title: 'الفواتير والتحصيل المالي والقبض',
      subtitle: 'حسابات دقيقة بوحدات صغرى (Minor Units) وسندات دفع موثقة'
    },
    permissions: {
      title: 'مصفوفة الصلاحيات الدقيقة (RBAC Policy Engine)',
      subtitle: 'تحكم سيادي لمالك العيادة لكل شاشة ومستخدم وحقل (Deny-by-default)'
    },
    sync_backup: {
      title: 'مزامنة الشبكة المحلية (LAN) والنسخ الاحتياطي المشفر',
      subtitle: 'تشغيل ذاتي بدون خادم Node.js — حماية AEAD AES-256-GCM'
    },
    licensing: {
      title: 'التراخيص والمقاعد التجارية (Offline Licensing)',
      subtitle: 'ترقية وتفعيل المقاعد الموقعة دون مساس بقاعدة بيانات المرضى'
    },
    flutter_code: {
      title: 'حزم كود Flutter & Dart المرجعية (Architecture Packages)',
      subtitle: 'هيكلية Dart الموجهة لتطبيقات Windows و Android وفق وثيقة SRS'
    }
  };

  const currentMeta = tabTitles[currentTab];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F8FA] text-[#1E293B]">
      {/* Sidebar with Medical Premium theme token */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        isOnline={isOnline}
        clinicName={clinicName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          isOnline={isOnline}
          onToggleOnline={() => setIsOnline(!isOnline)}
          onPrint={() => window.print()}
          onOpenFirstRun={() => setIsFirstRunOpen(true)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onLockScreen={() => setIsLocked(true)}
        />

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              patients={patients}
              appointments={appointments}
              onNavigateToTab={setCurrentTab}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {currentTab === 'dental_chart' && (
            <DentalChartView
              patient={selectedPatient}
              currentUser={currentUser}
              findings={findings}
              procedures={procedures}
              encounters={encounters}
              onAddFinding={handleAddFinding}
              onAddProcedure={handleAddProcedure}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsView
              patients={patients}
              currentUser={currentUser}
              searchQuery={searchQuery}
              findings={findings}
              procedures={procedures}
              encounters={encounters}
              onSelectPatient={setSelectedPatient}
              onNavigateToDentalChart={p => {
                setSelectedPatient(p);
                setCurrentTab('dental_chart');
              }}
              onAddPatient={handleAddPatient}
            />
          )}

          {currentTab === 'schedule' && (
            <ScheduleView
              appointments={appointments}
              patients={patients}
              currentUser={currentUser}
              onAddAppointment={handleAddAppointment}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {currentTab === 'encounters' && (
            <EncountersView
              encounters={encounters}
              patients={patients}
              currentUser={currentUser}
              onAddEncounter={handleAddEncounter}
              onAddAmendment={handleAddAmendment}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              invoices={invoices}
              payments={payments}
              currentUser={currentUser}
              onAddPayment={handleAddPayment}
            />
          )}

          {currentTab === 'permissions' && (
            <PermissionsView currentUser={currentUser} />
          )}

          {currentTab === 'sync_backup' && (
            <SyncBackupView
              currentUser={currentUser}
              isOnline={isOnline}
              onToggleOnline={() => setIsOnline(!isOnline)}
            />
          )}

          {currentTab === 'licensing' && (
            <LicensingView
              currentUser={currentUser}
              license={license}
              onUpgradeLicense={setLicense}
            />
          )}

          {currentTab === 'flutter_code' && (
            <FlutterCodePackageView />
          )}
        </main>
      </div>

      {/* Production & Verification Modals */}
      <FirstRunWizardModal
        isOpen={isFirstRunOpen}
        onClose={() => setIsFirstRunOpen(false)}
        onComplete={(setup) => {
          setClinicName(setup.clinicName);
          setIsFirstRunOpen(false);
        }}
      />

      <LockScreenModal
        isOpen={isLocked}
        currentUser={currentUser}
        onUnlock={() => setIsLocked(false)}
      />

      <PreflightDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        isOnline={isOnline}
      />
    </div>
  );
}
