export type UserRole = 'owner' | 'doctor' | 'receptionist' | 'accountant' | 'clinic_manager';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  specialty?: string;
  avatarUrl?: string;
  is_active: boolean;
}

export type DentitionType = 'permanent' | 'primary';
export type ToothSurface = 'M' | 'D' | 'B' | 'L' | 'O'; // Mesial, Distal, Buccal/Facial, Lingual/Palatal, Occlusal/Incisal

export type ToothConditionCode = 
  | 'healthy'
  | 'caries'
  | 'restoration_composite'
  | 'restoration_amalgam'
  | 'crown'
  | 'bridge_abutment'
  | 'bridge_pontic'
  | 'endodontic'
  | 'extraction'
  | 'missing'
  | 'implant'
  | 'unerupted'
  | 'sealant'
  | 'fracture';

export interface DentalFinding {
  id: string;
  patient_id: string;
  tooth_code: number;
  surfaces?: ToothSurface[];
  condition: ToothConditionCode;
  notes?: string;
  observed_at: string;
  doctor_id: string;
  doctor_name: string;
}

export interface DentalProcedure {
  id: string;
  patient_id: string;
  tooth_code: number;
  surfaces?: ToothSurface[];
  procedure_code: string;
  procedure_name_ar: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  doctor_id: string;
  doctor_name: string;
  planned_at: string;
  completed_at?: string;
  encounter_id?: string;
}

export interface PatientAllergy {
  id: string;
  substance: string;
  status: 'yes' | 'no' | 'unknown';
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  recorded_at: string;
}

export interface PatientRecord {
  id: string;
  clinic_id: string;
  mrn: string; // Medical Record Number
  legal_name: string;
  latin_name?: string;
  dob: string;
  approx_age?: number;
  sex: 'male' | 'female';
  phone: string;
  email?: string;
  address?: string;
  blood_group?: string;
  status: 'active' | 'archived';
  created_at: string;
  national_id?: string;
  occupation?: string;
  marital_status?: string;
  allergies: PatientAllergy[];
  chronic_conditions: string[];
  active_medications: string[];
  surgical_history: string[];
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  // Comprehensive Dental & Medical Fields
  chief_complaint?: {
    description: string;
    onset: string;
    pain_scale: number; // 0-10
    pain_character: string;
    aggravating_factors: string;
    relieving_factors?: string;
  };
  dental_history?: {
    last_visit: string;
    previous_treatments: string[];
    local_anesthesia_complications?: string;
    dental_anxiety_level: 'none' | 'mild' | 'moderate' | 'severe';
    oral_habits: string[];
    brushing_frequency: string;
    flossing_frequency: string;
  };
  vital_signs?: {
    blood_pressure: string;
    pulse: number;
    blood_sugar_hba1c?: string;
    temperature_celsius?: number;
    recorded_at: string;
  };
  tmj_exam?: {
    clicking: 'none' | 'right' | 'left' | 'bilateral';
    crepitus: boolean;
    pain_on_palpation: boolean;
    max_mouth_opening_mm: number;
    deviation_on_opening: 'none' | 'right' | 'left';
    masseter_tenderness: boolean;
  };
  soft_tissue_exam?: {
    findings: string;
    status: 'normal' | 'abnormal';
    oral_cancer_screen: 'negative' | 'suspicious' | 'referred';
  };
  periodontal_summary?: {
    classification: string;
    bop_percent: number; // Bleeding on probing
    plaque_score_percent: number;
    generalized_pocket_depth: string;
    furcation_involvement: boolean;
    mobility_present: boolean;
    calculus_level: 'none' | 'mild' | 'moderate' | 'heavy';
  };
  occlusion_exam?: {
    molar_class_right: string;
    molar_class_left: string;
    overjet_mm: number;
    overbite_percent: number;
    crossbite: string;
    midline_deviation: string;
  };
  radiology_records?: {
    id: string;
    type: 'panoramic_opg' | 'bitewing' | 'periapical' | 'cbct_3d';
    title: string;
    date: string;
    tooth_codes?: number[];
    finding_summary: string;
    bone_loss_level?: 'none' | 'mild_horizontal' | 'moderate' | 'severe_vertical';
  }[];
  signed_consents?: {
    id: string;
    title: string;
    signed_at: string;
    status: 'signed' | 'pending';
    doctor_name: string;
    scope: string;
  }[];
  risk_factors?: {
    smoker: boolean;
    smoking_frequency?: string;
    diabetic: boolean;
    hba1c_level?: string;
    bleeding_risk: boolean;
    antibiotic_prophylaxis_needed: boolean;
    bisphosphonates_history: boolean;
    pregnancy_status?: string;
  };
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_mrn: string;
  doctor_id: string;
  doctor_name: string;
  chair_id: string;
  chair_name: string;
  start_time: string; // ISO string
  end_time: string;
  service_title: string;
  status: 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  commit_state: 'committed' | 'pending';
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  drug_name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ClinicalEncounter {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_id?: string;
  doctor_id: string;
  doctor_name: string;
  encounter_date: string;
  chief_complaint: string;
  clinical_notes: string;
  diagnoses: string[];
  procedures_performed: DentalProcedure[];
  prescriptions: PrescriptionItem[];
  is_signed: boolean;
  signed_at?: string;
  amendments: {
    id: string;
    reason: string;
    amended_at: string;
    doctor_name: string;
    previous_notes: string;
  }[];
}

export interface InvoiceLine {
  id: string;
  procedure_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  patient_id: string;
  patient_name: string;
  encounter_id?: string;
  issued_at: string;
  lines: InvoiceLine[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  paid_amount: number;
  status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'voided';
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  patient_id: string;
  patient_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  paid_at: string;
  receipt_no: string;
  cashier_name: string;
  idempotency_key: string;
  status: 'committed' | 'pending';
}

export interface ClinicLicense {
  license_id: string;
  clinic_id: string;
  clinic_name: string;
  plan: 'dental_standard' | 'dental_pro' | 'center_multispecialty';
  plan_name_ar: string;
  max_active_users: number;
  max_registered_devices: number;
  max_doctors: number;
  enabled_modules: string[];
  valid_from: string;
  valid_until: string | null;
  license_revision: number;
  signature: string;
}

export interface ClinicDevice {
  id: string;
  name: string;
  platform: 'windows' | 'android_tablet' | 'android_phone';
  ip_address: string;
  public_key_fingerprint: string;
  is_coordinator: boolean;
  is_trusted: boolean;
  last_seen: string;
  assigned_room?: string;
}

export interface SyncState {
  is_online: boolean;
  coordinator_device_id: string;
  coordinator_name: string;
  epoch: number;
  sequence: number;
  outbox_pending_count: number;
  inbox_received_count: number;
  last_successful_sync: string;
  conflicts_count: number;
}
