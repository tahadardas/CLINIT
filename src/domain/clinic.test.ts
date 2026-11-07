import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  PERMANENT_TEETH_CODES, 
  PRIMARY_TEETH_CODES, 
  getToothInfo 
} from './dental';
import { 
  hasPermission, 
  canViewConfidentialPHI, 
  canViewFinancialProfits 
} from './permissions';
import { calculateInvoiceTotals } from './billing';
import { normalizeArabicText, detectAppointmentConflict } from './appointment';
import { Appointment } from '../types/clinic';

test('Dental domain - FDI codes and tooth classification', () => {
  assert.equal(PERMANENT_TEETH_CODES.length, 32, 'Must have 32 permanent teeth');
  assert.equal(PRIMARY_TEETH_CODES.length, 20, 'Must have 20 primary teeth');

  const tooth26 = getToothInfo(26);
  assert.equal(tooth26.quadrant, 2, 'Tooth 26 is in Upper Left quadrant');
  assert.equal(tooth26.isAnterior, false, 'Tooth 26 (first molar) is posterior');
  assert.equal(tooth26.dentition, 'permanent', 'Tooth 26 is permanent');

  const tooth51 = getToothInfo(51);
  assert.equal(tooth51.quadrant, 5, 'Tooth 51 is primary upper right');
  assert.equal(tooth51.isAnterior, true, 'Tooth 51 is anterior central incisor');
  assert.equal(tooth51.dentition, 'primary', 'Tooth 51 is deciduous');
});

test('RBAC Permissions - Deny-by-default and role isolation (REQ-AUTH-009, REQ-FIN-004)', () => {
  // 1. Receptionist must NOT view confidential PHI / clinical history
  assert.equal(canViewConfidentialPHI('receptionist'), false, 'Receptionist must be denied confidential PHI access');
  assert.equal(hasPermission('receptionist', 'dental_odontogram', 'view'), false, 'Receptionist cannot view odontogram');

  // 2. Receptionist must NOT view clinic-wide profit reports
  assert.equal(canViewFinancialProfits('receptionist'), false, 'Receptionist must not view net profit');

  // 3. Receptionist CAN manage appointments and collect payments
  assert.equal(hasPermission('receptionist', 'appointments_calendar', 'create'), true, 'Receptionist can book appointments');
  assert.equal(hasPermission('receptionist', 'invoices_payments', 'create'), true, 'Receptionist can collect payments');

  // 4. Accountant sees finances, but CANNOT view clinical notes or dental chart
  assert.equal(canViewFinancialProfits('accountant'), true, 'Accountant can view profits');
  assert.equal(hasPermission('accountant', 'invoices_payments', 'view'), true, 'Accountant views invoices');
  assert.equal(canViewConfidentialPHI('accountant'), false, 'Accountant denied patient clinical PHI');
  assert.equal(hasPermission('accountant', 'dental_odontogram', 'view'), false, 'Accountant denied dental odontogram');

  // 5. Doctor can view clinical and odontogram, but cannot edit license or system devices
  assert.equal(canViewConfidentialPHI('doctor'), true, 'Doctor views clinical PHI');
  assert.equal(hasPermission('doctor', 'dental_odontogram', 'edit'), true, 'Doctor edits dental chart');
  assert.equal(hasPermission('doctor', 'licensing_entitlements', 'edit'), false, 'Doctor cannot alter licenses');

  // 6. Owner has full access
  assert.equal(canViewConfidentialPHI('owner'), true);
  assert.equal(canViewFinancialProfits('owner'), true);
  assert.equal(hasPermission('owner', 'licensing_entitlements', 'edit'), true);
});

test('Billing domain - Exact minor units monetary calculation (REQ-FIN-006)', () => {
  const sampleLines = [
    { id: '1', description: 'حشوة ضوئية سن 26', quantity: 1, unit_price: 250.50, discount: 20.00, total: 230.50 },
    { id: '2', description: 'تنظيف وتكلس', quantity: 1, unit_price: 150.00, discount: 0, total: 150.00 }
  ];

  const totals = calculateInvoiceTotals(sampleLines, 15); // 15% VAT
  assert.equal(totals.subtotal, 400.50);
  assert.equal(totals.discount_total, 20.00);
  assert.equal(totals.grand_total, 437.58); // (400.50 - 20) * 1.15 = 380.50 * 1.15 = 437.575 -> 437.58
});

test('Appointment domain - Arabic text normalization and conflict detection', () => {
  assert.equal(normalizeArabicText('أَحْمَدُ'), 'احمد');
  assert.equal(normalizeArabicText('فاطمة'), 'فاطمه');
  assert.equal(normalizeArabicText('إبراهيم'), 'ابراهيم');

  const existing: Appointment[] = [
    {
      id: 'app-1',
      patient_id: 'p-1',
      patient_name: 'سارة خالد',
      patient_phone: '0501112233',
      patient_mrn: 'MRN-1001',
      doctor_id: 'doc-1',
      doctor_name: 'د. طارق',
      chair_id: 'chair-1',
      chair_name: 'كرسي 1',
      start_time: '2026-11-07T10:00:00Z',
      end_time: '2026-11-07T10:45:00Z',
      service_title: 'علاج عصب',
      status: 'scheduled',
      commit_state: 'committed'
    }
  ];

  // Overlapping appointment with same doctor
  const conflictDoc = detectAppointmentConflict(
    existing,
    '2026-11-07T10:30:00Z',
    '2026-11-07T11:00:00Z',
    'doc-1',
    'chair-2'
  );
  assert.equal(conflictDoc.hasConflict, true, 'Should detect conflict with doctor');

  // Overlapping appointment with same chair
  const conflictChair = detectAppointmentConflict(
    existing,
    '2026-11-07T10:15:00Z',
    '2026-11-07T10:40:00Z',
    'doc-2',
    'chair-1'
  );
  assert.equal(conflictChair.hasConflict, true, 'Should detect conflict with chair');

  // Non-overlapping appointment
  const noConflict = detectAppointmentConflict(
    existing,
    '2026-11-07T11:00:00Z',
    '2026-11-07T11:30:00Z',
    'doc-1',
    'chair-1'
  );
  assert.equal(noConflict.hasConflict, false, 'Should allow non-overlapping appointment');
});
