import { DentitionType, ToothConditionCode, ToothSurface } from '../types/clinic';

export interface FDIToothInfo {
  code: number;
  quadrant: number;
  position: number;
  dentition: DentitionType;
  name_ar: string;
  isAnterior: boolean;
  validSurfaces: ToothSurface[];
}

export const PERMANENT_TEETH_CODES = [
  // Upper Right (Q1)
  18, 17, 16, 15, 14, 13, 12, 11,
  // Upper Left (Q2)
  21, 22, 23, 24, 25, 26, 27, 28,
  // Lower Left (Q3)
  38, 37, 36, 35, 34, 33, 32, 31,
  // Lower Right (Q4)
  41, 42, 43, 44, 45, 46, 47, 48
];

export const PRIMARY_TEETH_CODES = [
  // Upper Right (Q5)
  55, 54, 53, 52, 51,
  // Upper Left (Q6)
  61, 62, 63, 64, 65,
  // Lower Left (Q7)
  75, 74, 73, 72, 71,
  // Lower Right (Q8)
  81, 82, 83, 84, 85
];

export function getToothInfo(code: number): FDIToothInfo {
  const quadrant = Math.floor(code / 10);
  const position = code % 10;
  const isPermanent = quadrant >= 1 && quadrant <= 4;
  const dentition: DentitionType = isPermanent ? 'permanent' : 'primary';

  // Anterior teeth: Central incisor, Lateral incisor, Canine (1, 2, 3)
  const isAnterior = position <= 3;

  // Surfaces: Mesial, Distal, Buccal/Labial, Lingual/Palatal, Occlusal (posteriors) / Incisal (anteriors)
  const validSurfaces: ToothSurface[] = ['M', 'D', 'B', 'L', 'O'];

  const namesPermanent: Record<number, string> = {
    1: 'قاطع مركزي (ثنية)',
    2: 'قاطع جانبي (رباعية)',
    3: 'ناب',
    4: 'ضاحك أول',
    5: 'ضاحك ثانٍ',
    6: 'طاحن أول (ضرس)',
    7: 'طاحن ثانٍ',
    8: 'طاحن ثالث (ضرس العقل)'
  };

  const namesPrimary: Record<number, string> = {
    1: 'قاطع مركزي لبني',
    2: 'قاطع جانبي لبني',
    3: 'ناب لبني',
    4: 'طاحن أول لبني',
    5: 'طاحن ثانٍ لبني'
  };

  const quadrantNames: Record<number, string> = {
    1: 'علوي أيمن',
    2: 'علوي أيسر',
    3: 'سفلي أيسر',
    4: 'سفلي أيمن',
    5: 'لبني علوي أيمن',
    6: 'لبني علوي أيسر',
    7: 'لبني سفلي أيسر',
    8: 'لبني سفلي أيمن'
  };

  const toothType = isPermanent ? namesPermanent[position] : namesPrimary[position];
  const qName = quadrantNames[quadrant] || '';

  return {
    code,
    quadrant,
    position,
    dentition,
    name_ar: `${toothType} (${qName}) - FDI ${code}`,
    isAnterior,
    validSurfaces
  };
}

export interface ConditionMeta {
  code: ToothConditionCode;
  label_ar: string;
  fillColor: string;
  borderColor: string;
  badgeClass: string;
}

export const TOOTH_CONDITIONS_META: Record<ToothConditionCode, ConditionMeta> = {
  healthy: {
    code: 'healthy',
    label_ar: 'سليم',
    fillColor: '#FFFFFF',
    borderColor: '#94A3B8',
    badgeClass: 'text-slate-600 bg-slate-50'
  },
  caries: {
    code: 'caries',
    label_ar: 'تسوس / نخر',
    fillColor: '#EF4444',
    borderColor: '#DC2626',
    badgeClass: 'text-red-700 bg-red-50'
  },
  restoration_composite: {
    code: 'restoration_composite',
    label_ar: 'حشوة تجميلية (كومبوزيت)',
    fillColor: '#3B82F6',
    borderColor: '#2563EB',
    badgeClass: 'text-blue-700 bg-blue-50'
  },
  restoration_amalgam: {
    code: 'restoration_amalgam',
    label_ar: 'حشوة فضية (أملغم)',
    fillColor: '#64748B',
    borderColor: '#475569',
    badgeClass: 'text-slate-700 bg-slate-100'
  },
  crown: {
    code: 'crown',
    label_ar: 'تاج / تلبيسة',
    fillColor: '#F59E0B',
    borderColor: '#D97706',
    badgeClass: 'text-amber-800 bg-amber-50'
  },
  bridge_abutment: {
    code: 'bridge_abutment',
    label_ar: 'دعامة جسر',
    fillColor: '#D97706',
    borderColor: '#B45309',
    badgeClass: 'text-amber-900 bg-amber-100'
  },
  bridge_pontic: {
    code: 'bridge_pontic',
    label_ar: 'دمية جسر معلقة',
    fillColor: '#FBBF24',
    borderColor: '#D97706',
    badgeClass: 'text-amber-900 bg-amber-100'
  },
  endodontic: {
    code: 'endodontic',
    label_ar: 'معالجة لبية (علاج عصب)',
    fillColor: '#8B5CF6',
    borderColor: '#7C3AED',
    badgeClass: 'text-purple-700 bg-purple-50'
  },
  extraction: {
    code: 'extraction',
    label_ar: 'موصى بالقلع',
    fillColor: '#BE123C',
    borderColor: '#9F1239',
    badgeClass: 'text-rose-800 bg-rose-50'
  },
  missing: {
    code: 'missing',
    label_ar: 'مفقود خلقة / مقلوع',
    fillColor: '#E2E8F0',
    borderColor: '#94A3B8',
    badgeClass: 'text-slate-500 bg-slate-100'
  },
  implant: {
    code: 'implant',
    label_ar: 'زرعة سنية',
    fillColor: '#0D9488',
    borderColor: '#0F766E',
    badgeClass: 'text-teal-800 bg-teal-50'
  },
  unerupted: {
    code: 'unerupted',
    label_ar: 'سن غير بازغ / منطمر',
    fillColor: '#E0E7FF',
    borderColor: '#6366F1',
    badgeClass: 'text-indigo-700 bg-indigo-50'
  },
  sealant: {
    code: 'sealant',
    label_ar: 'ساد للميازيب والوهاد',
    fillColor: '#10B981',
    borderColor: '#059669',
    badgeClass: 'text-emerald-700 bg-emerald-50'
  },
  fracture: {
    code: 'fracture',
    label_ar: 'كسر في السن',
    fillColor: '#F97316',
    borderColor: '#EA580C',
    badgeClass: 'text-orange-800 bg-orange-50'
  }
};
