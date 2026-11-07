import { 
  Appointment, 
  ClinicalEncounter, 
  ClinicDevice, 
  ClinicLicense, 
  DentalFinding, 
  DentalProcedure, 
  Invoice, 
  PatientRecord, 
  PaymentRecord, 
  SyncState, 
  UserAccount 
} from '../types/clinic';

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'user-owner',
    name: 'د. طارق الحكيم',
    role: 'owner',
    title: 'استشاري جراحة الوجه والفكين وزراعة الأسنان (المالك)',
    specialty: 'Oral Surgery & Implants',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    is_active: true
  },
  {
    id: 'user-doctor',
    name: 'د. مريم العوضي',
    role: 'doctor',
    title: 'أخصائية مداواة الأسنان وطب أسنان الأطفال',
    specialty: 'Pediatric & Endodontics',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813596-f83196c3d441?w=150&auto=format&fit=crop&q=80',
    is_active: true
  },
  {
    id: 'user-reception-1',
    name: 'ريم الدوسري',
    role: 'receptionist',
    title: 'مسؤولة الاستقبال وتنسيق المواعيد (الفترة الصباحية)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_active: true
  },
  {
    id: 'user-reception-2',
    name: 'أمل الشمري',
    role: 'receptionist',
    title: 'مسؤولة الاستقبال (الفترة المسائية)',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    is_active: true
  },
  {
    id: 'user-accountant',
    name: 'عمر السليمان',
    role: 'accountant',
    title: 'المحاسب المالي للعيادة',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_active: true
  },
  {
    id: 'user-manager',
    name: 'م. فهد القرني',
    role: 'clinic_manager',
    title: 'مدير العمليات والجودة الطبية',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_active: true
  }
];

export const MOCK_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-1',
    clinic_id: 'clinic-main',
    mrn: 'MRN-2026-0142',
    legal_name: 'سارة خالد الزهراني',
    latin_name: 'Sarah Khaled Al-Zahrani',
    dob: '1994-06-14',
    approx_age: 32,
    sex: 'female',
    phone: '0541234567',
    email: 'sarah.z@example.com',
    address: 'الرياض — حي الصحافة',
    blood_group: 'O+',
    status: 'active',
    created_at: '2026-01-10T08:30:00Z',
    allergies: [
      {
        id: 'alg-1',
        substance: 'البنسلين ومشتقاته (Penicillin)',
        status: 'yes',
        reaction: 'طفح جلدي حاد وضيق في التنفس',
        severity: 'severe',
        recorded_at: '2026-01-10'
      },
      {
        id: 'alg-2',
        substance: 'مضادات الالتهاب اللاستيرويدية (NSAIDs)',
        status: 'no',
        recorded_at: '2026-01-10'
      },
      {
        id: 'alg-3',
        substance: 'مخدر الليدوكائين (Lidocaine)',
        status: 'unknown',
        recorded_at: '2026-01-10'
      }
    ],
    chronic_conditions: ['ارتفاع ضغط دم خفيف ومضبوط', 'قصور الغدة الدرقية'],
    active_medications: ['Euthyrox 50mcg يومياً صباحاً'],
    surgical_history: ['استئصال الزائدة الدودية عام 2018'],
    emergency_contact: {
      name: 'خالد الزهراني (الوالد)',
      relationship: 'والد المريضة',
      phone: '0505551234'
    },
    national_id: '1092837465',
    occupation: 'مهندسة برمجيات',
    marital_status: 'متزوجة',
    chief_complaint: {
      description: 'ألم نابض متقطع في الجهة العلوية اليسرى (الضرس 26) يزداد مع المشروبات الباردة والسكريات ويدوم لعدة دقائق بعد المثير',
      onset: 'منذ أسبوعين، مع تزايد الشدة خلال الـ 48 ساعة الماضية',
      pain_scale: 7,
      pain_character: 'نابض وحاد (Throbbing, sharp) ينتشر أحياناً إلى منطقة الصدغ الأيسر',
      aggravating_factors: 'المشروبات الباردة والحلويات، والمضغ المباشر على الجهة اليسرى',
      relieving_factors: 'مسكن باراسيتامول 1000mg يعطي راحة مؤقتة خفيفة'
    },
    dental_history: {
      last_visit: '2025-08-20 (قبل 6 أشهر لإجراء تنظيف وتلميع دوري)',
      previous_treatments: [
        'علاج عصب للضرس 46 وتلبيسة زيركون كاملة',
        'حشوات كمبوزيت تجميلية للقواطع الأمامية',
        'قلع جراحي لأضراس العقل السفلية 38 و 48'
      ],
      local_anesthesia_complications: 'لا توجد مضاعفات، استجابة طبيعية ممتازة مع الآرتيكائين 4%',
      dental_anxiety_level: 'mild',
      oral_habits: ['صرير أسنان ليلي خفيف (Mild Bruxism) مع تآكل بسيط في حواف القواطع'],
      brushing_frequency: 'مرتان يومياً بفرشاة ناعمة ومعجون فلورايد',
      flossing_frequency: '3-4 مرات أسبوعياً بخيط مائي'
    },
    vital_signs: {
      blood_pressure: '120/78 mmHg',
      pulse: 74,
      blood_sugar_hba1c: '5.4% (طبيعي وسليم)',
      temperature_celsius: 36.8,
      recorded_at: '2026-11-05 09:30'
    },
    tmj_exam: {
      clicking: 'left',
      crepitus: false,
      pain_on_palpation: false,
      max_mouth_opening_mm: 44,
      deviation_on_opening: 'none',
      masseter_tenderness: true
    },
    soft_tissue_exam: {
      findings: 'الغشاء المخاطي سليم، قاع الفم واللسان طبيعي، لا توجد قرحات أو آفات مشبوهة',
      status: 'normal',
      oral_cancer_screen: 'negative'
    },
    periodontal_summary: {
      classification: 'التهاب لثة موضعي خفيف ناتج عن اللويحة (Localized Plaque-Induced Gingivitis)',
      bop_percent: 14,
      plaque_score_percent: 22,
      generalized_pocket_depth: '1-3 mm (طبيعي وسليم مع جيب موضعي 4mm ملاصق بين 26 و 27)',
      furcation_involvement: false,
      mobility_present: false,
      calculus_level: 'mild'
    },
    occlusion_exam: {
      molar_class_right: 'Class I (علاقة صنف أول نموذجية)',
      molar_class_left: 'Class I (علاقة صنف أول نموذجية)',
      overjet_mm: 2.5,
      overbite_percent: 25,
      crossbite: 'لا يوجد عضة معكوسة',
      midline_deviation: 'متطابق تماماً مع خط منتصف الوجه'
    },
    radiology_records: [
      {
        id: 'rad-1',
        type: 'panoramic_opg',
        title: 'أشعة بانوراما رقمية شاملة (Digital OPG)',
        date: '2026-10-15',
        tooth_codes: [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 47],
        finding_summary: 'مستوى العظم السنخي سليم بنسبة 90%، كثافة عظمية جيدة، الجيوب الفكية خالية، غياب أضراس العقل السفلية 38 و 48 نتيجة قلع مسبق',
        bone_loss_level: 'none'
      },
      {
        id: 'rad-2',
        type: 'periapical',
        title: 'أشعة ذروية رقمية مجزأة للضرس 26 (Digital Periapical)',
        date: '2026-11-05',
        tooth_codes: [26],
        finding_summary: 'نخر عاجي عميق على السطحين الطاحن والإنسي (MO) واصل لثلث العاج العميق مقترب من القرن اللبي، مع سلامة مسافة الرباط الحول سني والذروة العظمية',
        bone_loss_level: 'none'
      },
      {
        id: 'rad-3',
        type: 'bitewing',
        title: 'أشعة أجنحة الإطباق الخلفية الثنائية (Bitewings L/R)',
        date: '2026-11-05',
        tooth_codes: [15, 16, 17, 25, 26, 27, 35, 36, 37, 45, 46, 47],
        finding_summary: 'نخر مينائي بدئي سطحي على السطح الإنسي للسن 15، سلامة الحواف التاجية للسن 46 المغطى بتاج زيركون',
        bone_loss_level: 'none'
      }
    ],
    signed_consents: [
      {
        id: 'cst-1',
        title: 'الموافقة المستنيرة على المعالجة اللبية وحشوات الكمبوزيت المباشرة',
        signed_at: '2026-11-05 09:40',
        status: 'signed',
        doctor_name: 'د. طارق الحكيم',
        scope: 'علاج العصب والترميم التجميلي للسن 26 والتخدير الموضعي'
      },
      {
        id: 'cst-2',
        title: 'الموافقة على التصوير الشعاعي التشخيصي السني (X-Ray Consent)',
        signed_at: '2026-11-05 09:15',
        status: 'signed',
        doctor_name: 'د. طارق الحكيم',
        scope: 'تصوير بانورامي وذروي رقمي منخفض الإشعاع ALARA'
      }
    ],
    risk_factors: {
      smoker: false,
      diabetic: false,
      bleeding_risk: false,
      antibiotic_prophylaxis_needed: false,
      bisphosphonates_history: false,
      pregnancy_status: 'لا يوجد حمل'
    }
  },
  {
    id: 'pat-2',
    clinic_id: 'clinic-main',
    mrn: 'MRN-2026-0143',
    legal_name: 'محمد عبد الله الشهري',
    latin_name: 'Mohammed Abdullah Al-Shehri',
    dob: '1988-11-20',
    approx_age: 38,
    sex: 'male',
    phone: '0559876543',
    email: 'm.shehri@example.com',
    address: 'الرياض — حي النرجس',
    blood_group: 'A+',
    status: 'active',
    created_at: '2026-01-15T09:15:00Z',
    allergies: [
      {
        id: 'alg-4',
        substance: 'حساسية أدوية عامة',
        status: 'no',
        recorded_at: '2026-01-15'
      }
    ],
    chronic_conditions: ['لا يوجد أمراض مزمنة'],
    active_medications: [],
    surgical_history: []
  },
  {
    id: 'pat-3',
    clinic_id: 'clinic-main',
    mrn: 'MRN-2026-0144',
    legal_name: 'ريان ماجد القحطاني',
    latin_name: 'Rayan Majed Al-Qahtani',
    dob: '2019-04-05',
    approx_age: 7,
    sex: 'male',
    phone: '0567778899',
    address: 'الرياض — حي الملقا',
    blood_group: 'B+',
    status: 'active',
    created_at: '2026-02-01T14:00:00Z',
    allergies: [
      {
        id: 'alg-5',
        substance: 'الأسبرين (Aspirin)',
        status: 'yes',
        reaction: 'حساسية مفرطة',
        severity: 'severe',
        recorded_at: '2026-02-01'
      }
    ],
    chronic_conditions: ['ربو تحسسي خفيف عند تغير الفصول'],
    active_medications: ['بخاخ فينتولين عند اللزوم'],
    surgical_history: [],
    emergency_contact: {
      name: 'ماجد القحطاني (ولي الأمر)',
      relationship: 'الأب',
      phone: '0567778899'
    }
  },
  {
    id: 'pat-4',
    clinic_id: 'clinic-main',
    mrn: 'MRN-2026-0145',
    legal_name: 'نورة فيصل المطيري',
    latin_name: 'Noura Faisal Al-Mutairi',
    dob: '2001-08-25',
    approx_age: 25,
    sex: 'female',
    phone: '0533344556',
    address: 'الرياض — حي الياسمين',
    blood_group: 'AB+',
    status: 'active',
    created_at: '2026-02-12T11:20:00Z',
    allergies: [
      {
        id: 'alg-6',
        substance: 'اللاتكس (Latex Gloves)',
        status: 'yes',
        reaction: 'تهيج وتورم موضعي عند الملامسة',
        severity: 'moderate',
        recorded_at: '2026-02-12'
      }
    ],
    chronic_conditions: [],
    active_medications: [],
    surgical_history: []
  },
  {
    id: 'pat-5',
    clinic_id: 'clinic-main',
    mrn: 'MRN-2026-0146',
    legal_name: 'خالد بن فهد العتيبي',
    latin_name: 'Khaled Fahad Al-Otaibi',
    dob: '1975-03-12',
    approx_age: 51,
    sex: 'male',
    phone: '0501239876',
    address: 'الرياض — حي حطين',
    blood_group: 'O-',
    status: 'active',
    created_at: '2026-02-20T16:45:00Z',
    allergies: [],
    chronic_conditions: ['سكري نمط 2 (متوازن مع الجلوكوفاج)'],
    active_medications: ['Metformin 500mg مرتين يومياً'],
    surgical_history: ['قسطرة قلبية تشخيصية 2023']
  }
];

export const MOCK_DENTAL_FINDINGS: DentalFinding[] = [
  {
    id: 'find-1',
    patient_id: 'pat-1',
    tooth_code: 26,
    surfaces: ['O', 'M'],
    condition: 'caries',
    notes: 'نخر عميق واصل إلى عاج السن على السطحين الطاحن والإناداني',
    observed_at: '2026-11-05T10:00:00Z',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم'
  },
  {
    id: 'find-2',
    patient_id: 'pat-1',
    tooth_code: 46,
    surfaces: ['O'],
    condition: 'endodontic',
    notes: 'معالجة لبية مكتملة مسبقاً وتتطلب تاج وقاية',
    observed_at: '2026-10-15T11:30:00Z',
    doctor_id: 'user-doctor',
    doctor_name: 'د. مريم العوضي'
  },
  {
    id: 'find-3',
    patient_id: 'pat-1',
    tooth_code: 16,
    condition: 'crown',
    notes: 'تاج زيركونيا خزفي في حالة ممتازة وحواف محكمة',
    observed_at: '2026-09-01T09:00:00Z',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم'
  },
  {
    id: 'find-4',
    patient_id: 'pat-1',
    tooth_code: 11,
    surfaces: ['M', 'B'],
    condition: 'restoration_composite',
    notes: 'حشوة تجميلية كمبوزيت قديمة بحاجة لتلميع',
    observed_at: '2026-10-15T11:30:00Z',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم'
  },
  {
    id: 'find-5',
    patient_id: 'pat-1',
    tooth_code: 38,
    condition: 'unerupted',
    notes: 'ضرس عقل سفلي أيسر منطمر أفقياً وفق صورة البانوراما',
    observed_at: '2026-11-05T10:00:00Z',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم'
  },
  {
    id: 'find-6',
    patient_id: 'pat-1',
    tooth_code: 36,
    condition: 'missing',
    notes: 'مقلوع قديماً ومكان مخصص لزرعة سنية تعويضية',
    observed_at: '2026-10-15T11:30:00Z',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم'
  }
];

export const MOCK_DENTAL_PROCEDURES: DentalProcedure[] = [
  {
    id: 'proc-1',
    patient_id: 'pat-1',
    tooth_code: 26,
    surfaces: ['O', 'M'],
    procedure_code: 'D2392',
    procedure_name_ar: 'حشوة كمبوزيت تجميلية لسطحين خلفيين (MO)',
    status: 'planned',
    price: 350.00,
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    planned_at: '2026-11-05T10:30:00Z'
  },
  {
    id: 'proc-2',
    patient_id: 'pat-1',
    tooth_code: 46,
    procedure_code: 'D2740',
    procedure_name_ar: 'تاج خزفي كامل (Zirconia Crown)',
    status: 'planned',
    price: 1200.00,
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    planned_at: '2026-11-05T10:30:00Z'
  },
  {
    id: 'proc-3',
    patient_id: 'pat-1',
    tooth_code: 46,
    procedure_code: 'D3330',
    procedure_name_ar: 'إعادة معالجة قناة الجذر لسن خلفي ثلاثي القنوات',
    status: 'completed',
    price: 950.00,
    doctor_id: 'user-doctor',
    doctor_name: 'د. مريم العوضي',
    planned_at: '2026-10-15T11:30:00Z',
    completed_at: '2026-10-25T12:00:00Z'
  },
  {
    id: 'proc-4',
    patient_id: 'pat-1',
    tooth_code: 36,
    procedure_code: 'D6010',
    procedure_name_ar: 'زرعة سنية جراحية نوع تيتانيوم (Straumann)',
    status: 'planned',
    price: 3200.00,
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    planned_at: '2026-11-05T10:30:00Z'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    patient_id: 'pat-1',
    patient_name: 'سارة خالد الزهراني',
    patient_phone: '0541234567',
    patient_mrn: 'MRN-2026-0142',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    chair_id: 'chair-1',
    chair_name: 'كرسي 1 — الجراحة والزرع',
    start_time: '2026-11-07T09:00:00Z',
    end_time: '2026-11-07T09:45:00Z',
    service_title: 'حشوة كمبوزيت سن 26 واستشارة زرع',
    status: 'in_progress',
    commit_state: 'committed',
    notes: 'المريضة لديها حساسية بنسلين مثبتة في الملف'
  },
  {
    id: 'app-2',
    patient_id: 'pat-2',
    patient_name: 'محمد عبد الله الشهري',
    patient_phone: '0559876543',
    patient_mrn: 'MRN-2026-0143',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    chair_id: 'chair-1',
    chair_name: 'كرسي 1 — الجراحة والزرع',
    start_time: '2026-11-07T10:00:00Z',
    end_time: '2026-11-07T10:45:00Z',
    service_title: 'معاينة دورية وأخذ قياس جسر سن 21',
    status: 'arrived',
    commit_state: 'committed',
    notes: 'وصل قبل 10 دقائق وهو في صالة الانتظار'
  },
  {
    id: 'app-3',
    patient_id: 'pat-3',
    patient_name: 'ريان ماجد القحطاني',
    patient_phone: '0567778899',
    patient_mrn: 'MRN-2026-0144',
    doctor_id: 'user-doctor',
    doctor_name: 'د. مريم العوضي',
    chair_id: 'chair-2',
    chair_name: 'كرسي 2 — عيادة الأطفال والتقويم',
    start_time: '2026-11-07T10:30:00Z',
    end_time: '2026-11-07T11:15:00Z',
    service_title: 'تطبيق فلورايد وساد للوهاد للأسنان اللبنية',
    status: 'scheduled',
    commit_state: 'committed',
    notes: 'مرافقة مع والدته — عمره 7 سنوات'
  },
  {
    id: 'app-4',
    patient_id: 'pat-4',
    patient_name: 'نورة فيصل المطيري',
    patient_phone: '0533344556',
    patient_mrn: 'MRN-2026-0145',
    doctor_id: 'user-doctor',
    doctor_name: 'د. مريم العوضي',
    chair_id: 'chair-2',
    chair_name: 'كرسي 2 — عيادة الأطفال والتقويم',
    start_time: '2026-11-07T11:30:00Z',
    end_time: '2026-11-07T12:00:00Z',
    service_title: 'شد تقويم وتغيير الأسلاك المطاطية',
    status: 'scheduled',
    commit_state: 'committed'
  },
  {
    id: 'app-5',
    patient_id: 'pat-5',
    patient_name: 'خالد بن فهد العتيبي',
    patient_phone: '0501239876',
    patient_mrn: 'MRN-2026-0146',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    chair_id: 'chair-1',
    chair_name: 'كرسي 1 — الجراحة والزرع',
    start_time: '2026-11-07T12:00:00Z',
    end_time: '2026-11-07T12:45:00Z',
    service_title: 'قلع جراحي لضرس العقل المنطمر 38',
    status: 'scheduled',
    commit_state: 'committed',
    notes: 'تحضير تخدير موضعي خالي من الأدرينالين لمرضى الضغط والقلب'
  }
];

export const MOCK_ENCOUNTERS: ClinicalEncounter[] = [
  {
    id: 'enc-1',
    patient_id: 'pat-1',
    patient_name: 'سارة خالد الزهراني',
    doctor_id: 'user-owner',
    doctor_name: 'د. طارق الحكيم',
    encounter_date: '2026-11-05T10:00:00Z',
    chief_complaint: 'ألم حاد مع المشروبات الباردة والحلويات في الجهة العلوية اليسرى منذ 4 أيام',
    clinical_notes: 'الفحص السريري: نخر واصل للعاج في السن 26 (MO)، استجابة إيجابية لاختبار البرودة وتتراجع سريعاً دون ألم ليلي عفوي (Reversible Pulpitis). اللثة سليمة وعمق الجيوب ضمن الحدود الطبيعية 2mm.',
    diagnoses: ['Reversible Pulpitis - Tooth 26', 'Missing Tooth 36', 'Impacted Wisdom Tooth 38'],
    procedures_performed: [],
    prescriptions: [
      {
        id: 'rx-1',
        drug_name: 'إيبوبروفين (Ibuprofen)',
        dose: '400 mg',
        frequency: 'قرص كل 8 ساعات بعد الطعام',
        duration: '3 أيام',
        instructions: 'مسكن ألم عند الحاجة وتجنب تناوله على معدة فارغة'
      },
      {
        id: 'rx-2',
        drug_name: 'غسول فم كلورهيكسيدين (Chlorhexidine 0.12%)',
        dose: '15 ml',
        frequency: 'مرتين يومياً بعد تفريش الأسنان',
        duration: 'أسبوع واحد',
        instructions: 'مضمضة لمدة دقيقة واحدة ثم البصق دون بلع'
      }
    ],
    is_signed: true,
    signed_at: '2026-11-05T10:45:00Z',
    amendments: []
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoice_no: 'INV-2026-0089',
    patient_id: 'pat-1',
    patient_name: 'سارة خالد الزهراني',
    issued_at: '2026-10-25T12:30:00Z',
    lines: [
      {
        id: 'line-1',
        description: 'إعادة معالجة قناة الجذر لسن خلفي (سن 46)',
        quantity: 1,
        unit_price: 950.00,
        discount: 50.00,
        total: 900.00
      },
      {
        id: 'line-2',
        description: 'صورة أشعة ذروية رقمية (Periapical X-Ray)',
        quantity: 2,
        unit_price: 60.00,
        discount: 0,
        total: 120.00
      }
    ],
    subtotal: 1070.00,
    discount_total: 50.00,
    tax_total: 153.00,
    grand_total: 1173.00,
    paid_amount: 1173.00,
    status: 'paid'
  },
  {
    id: 'inv-102',
    invoice_no: 'INV-2026-0090',
    patient_id: 'pat-1',
    patient_name: 'سارة خالد الزهراني',
    issued_at: '2026-11-05T11:00:00Z',
    lines: [
      {
        id: 'line-3',
        description: 'كشف واستشارة طب أسنان متقدمة',
        quantity: 1,
        unit_price: 150.00,
        discount: 0,
        total: 150.00
      },
      {
        id: 'line-4',
        description: 'صورة بانورامية رقمية لكامل الفكين (OPG Panoramic)',
        quantity: 1,
        unit_price: 200.00,
        discount: 0,
        total: 200.00
      }
    ],
    subtotal: 350.00,
    discount_total: 0,
    tax_total: 52.50,
    grand_total: 402.50,
    paid_amount: 200.00,
    status: 'partially_paid'
  }
];

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-201',
    invoice_id: 'inv-101',
    patient_id: 'pat-1',
    patient_name: 'سارة خالد الزهراني',
    amount: 1173.00,
    payment_method: 'card',
    paid_at: '2026-10-25T12:35:00Z',
    receipt_no: 'REC-2026-0089',
    cashier_name: 'ريم الدوسري',
    idempotency_key: 'tx_987123984712',
    status: 'committed'
  },
  {
    id: 'pay-202',
    invoice_id: 'inv-102',
    patient_id: 'pat-1',
    patient_name: 'سارة خالد الزهراني',
    amount: 200.00,
    payment_method: 'cash',
    paid_at: '2026-11-05T11:15:00Z',
    receipt_no: 'REC-2026-0090',
    cashier_name: 'أمل الشمري',
    idempotency_key: 'tx_123490182390',
    status: 'committed'
  }
];

export const MOCK_DEVICES: ClinicDevice[] = [
  {
    id: 'dev-1',
    name: 'محطة العيادة الرئيسية (Windows Desktop - Coordinator)',
    platform: 'windows',
    ip_address: '192.168.1.100',
    public_key_fingerprint: 'SHA256:7e8b91c...f0a1',
    is_coordinator: true,
    is_trusted: true,
    last_seen: 'الآن (متصل)',
    assigned_room: 'غرفة الطبيب المالك 1'
  },
  {
    id: 'dev-2',
    name: 'تابلت كرسي العلاج 1 (Samsung Galaxy Tab S9)',
    platform: 'android_tablet',
    ip_address: '192.168.1.102',
    public_key_fingerprint: 'SHA256:4b2190e...a78c',
    is_coordinator: false,
    is_trusted: true,
    last_seen: 'قبل 2 دقيقة',
    assigned_room: 'كرسي 1 — د. طارق'
  },
  {
    id: 'dev-3',
    name: 'تابلت كرسي الأطفال 2 (Android Tablet Pro)',
    platform: 'android_tablet',
    ip_address: '192.168.1.103',
    public_key_fingerprint: 'SHA256:91df34b...1109',
    is_coordinator: false,
    is_trusted: true,
    last_seen: 'قبل 5 دقائق',
    assigned_room: 'كرسي 2 — د. مريم'
  },
  {
    id: 'dev-4',
    name: 'كمبيوتر مكتب الاستقبال (Windows 11)',
    platform: 'windows',
    ip_address: '192.168.1.105',
    public_key_fingerprint: 'SHA256:882ac00...3e41',
    is_coordinator: false,
    is_trusted: true,
    last_seen: 'الآن (متصل)',
    assigned_room: 'مكتب الاستقبال الرئيسي'
  }
];

export const MOCK_LICENSE: ClinicLicense = {
  license_id: 'lic-sa-2026-8819',
  clinic_id: 'clinic-main',
  clinic_name: 'عيادات النخبة لطب الأسنان المتقدم',
  plan: 'dental_pro',
  plan_name_ar: 'الباقة المتقدمة لطب الأسنان (Dental Pro)',
  max_active_users: 3,
  max_registered_devices: 4,
  max_doctors: 2,
  enabled_modules: ['core_clinic', 'dental_odontogram', 'billing_invoicing', 'lan_sync', 'encrypted_backup'],
  valid_from: '2026-01-01',
  valid_until: '2027-01-01',
  license_revision: 3,
  signature: 'SIG_ED25519_88f912e77b10c9...'
};

export const MOCK_SYNC_STATE: SyncState = {
  is_online: true,
  coordinator_device_id: 'dev-1',
  coordinator_name: 'محطة العيادة الرئيسية (Windows Desktop)',
  epoch: 14,
  sequence: 2841,
  outbox_pending_count: 0,
  inbox_received_count: 142,
  last_successful_sync: 'قبل 15 ثانية',
  conflicts_count: 0
};
