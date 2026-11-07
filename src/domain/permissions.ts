import { UserRole } from '../types/clinic';

export type Resource = 
  | 'patient_demographics'
  | 'patient_clinical_phi' // Medical history, allergies, notes
  | 'dental_odontogram'
  | 'appointments_calendar'
  | 'clinical_encounters'
  | 'prescriptions'
  | 'invoices_payments'
  | 'financial_profit_reports'
  | 'users_roles_management'
  | 'devices_management'
  | 'licensing_entitlements'
  | 'backup_restore';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'sign' | 'export';

export interface PermissionRule {
  resource: Resource;
  action: Action;
  allowedRoles: UserRole[];
}

export const PERMISSION_MATRIX: PermissionRule[] = [
  // Patient Demographics (Name, Phone, MRN)
  { resource: 'patient_demographics', action: 'view', allowedRoles: ['owner', 'doctor', 'receptionist', 'accountant', 'clinic_manager'] },
  { resource: 'patient_demographics', action: 'create', allowedRoles: ['owner', 'doctor', 'receptionist', 'clinic_manager'] },
  { resource: 'patient_demographics', action: 'edit', allowedRoles: ['owner', 'doctor', 'receptionist', 'clinic_manager'] },

  // Confidential Patient Clinical PHI (Allergies, Diseases, Diagnoses, Notes)
  // CRITICAL REQUIREMENT (REQ-AUTH-009 & ACC-003): Receptionist & Accountant CANNOT access detailed clinical PHI
  { resource: 'patient_clinical_phi', action: 'view', allowedRoles: ['owner', 'doctor', 'clinic_manager'] },
  { resource: 'patient_clinical_phi', action: 'edit', allowedRoles: ['owner', 'doctor'] },
  { resource: 'patient_clinical_phi', action: 'create', allowedRoles: ['owner', 'doctor'] },

  // Dental Odontogram (Chart, findings, surface conditions)
  { resource: 'dental_odontogram', action: 'view', allowedRoles: ['owner', 'doctor', 'clinic_manager'] },
  { resource: 'dental_odontogram', action: 'edit', allowedRoles: ['owner', 'doctor'] },

  // Appointments & Calendar
  { resource: 'appointments_calendar', action: 'view', allowedRoles: ['owner', 'doctor', 'receptionist', 'accountant', 'clinic_manager'] },
  { resource: 'appointments_calendar', action: 'create', allowedRoles: ['owner', 'doctor', 'receptionist', 'clinic_manager'] },
  { resource: 'appointments_calendar', action: 'edit', allowedRoles: ['owner', 'doctor', 'receptionist', 'clinic_manager'] },

  // Clinical Encounters & Prescriptions
  { resource: 'clinical_encounters', action: 'view', allowedRoles: ['owner', 'doctor', 'clinic_manager'] },
  { resource: 'clinical_encounters', action: 'create', allowedRoles: ['owner', 'doctor'] },
  { resource: 'clinical_encounters', action: 'sign', allowedRoles: ['owner', 'doctor'] },
  { resource: 'prescriptions', action: 'view', allowedRoles: ['owner', 'doctor'] },
  { resource: 'prescriptions', action: 'create', allowedRoles: ['owner', 'doctor'] },

  // Invoices & Payments (Receptionist can collect payments, Accountant can manage invoices)
  { resource: 'invoices_payments', action: 'view', allowedRoles: ['owner', 'doctor', 'receptionist', 'accountant', 'clinic_manager'] },
  { resource: 'invoices_payments', action: 'create', allowedRoles: ['owner', 'receptionist', 'accountant', 'clinic_manager'] },
  { resource: 'invoices_payments', action: 'edit', allowedRoles: ['owner', 'accountant', 'clinic_manager'] },

  // Financial Profits & Clinic-wide Net Revenue
  // CRITICAL REQUIREMENT (REQ-FIN-004 & ACC-003): Receptionist cannot see clinic profits
  { resource: 'financial_profit_reports', action: 'view', allowedRoles: ['owner', 'accountant', 'clinic_manager'] },

  // Administration, Users, Devices, Licensing, Backup
  { resource: 'users_roles_management', action: 'view', allowedRoles: ['owner', 'clinic_manager'] },
  { resource: 'users_roles_management', action: 'edit', allowedRoles: ['owner'] },
  { resource: 'devices_management', action: 'view', allowedRoles: ['owner', 'clinic_manager'] },
  { resource: 'devices_management', action: 'edit', allowedRoles: ['owner'] },
  { resource: 'licensing_entitlements', action: 'view', allowedRoles: ['owner', 'clinic_manager'] },
  { resource: 'licensing_entitlements', action: 'edit', allowedRoles: ['owner'] },
  { resource: 'backup_restore', action: 'view', allowedRoles: ['owner'] },
  { resource: 'backup_restore', action: 'create', allowedRoles: ['owner'] },
];

export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
  // Deny-by-default (REQ-AUTH-004)
  const rule = PERMISSION_MATRIX.find(r => r.resource === resource && r.action === action);
  if (!rule) return false;
  return rule.allowedRoles.includes(role);
}

export function canViewConfidentialPHI(role: UserRole): boolean {
  return hasPermission(role, 'patient_clinical_phi', 'view');
}

export function canViewFinancialProfits(role: UserRole): boolean {
  return hasPermission(role, 'financial_profit_reports', 'view');
}

export function canSignClinicalEncounter(role: UserRole): boolean {
  return hasPermission(role, 'clinical_encounters', 'sign');
}

export function canManageLicensing(role: UserRole): boolean {
  return hasPermission(role, 'licensing_entitlements', 'edit');
}
