# Clinic Platform — Complete SRS (Concatenated Edition)

**Baseline 1.0.0 — 2026-11-07**. This single file is a convenience copy. **The authoritative implementation package includes** `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `schemas/requirements_baseline.json`, `schemas/requirements_catalog.json`, `schemas/requirements_progress.json` and separate `docs/*.md`. If these conflict, the original separate baseline files and change-control process take priority.

## Table of contents

- `docs/00_MASTER_SRS.md`
- `docs/01_ARCHITECTURE_AND_TOPOLOGY.md`
- `docs/02_DATA_MODEL_AND_RULES.md`
- `docs/03_SYNC_PROTOCOL.md`
- `docs/04_SECURITY_PERMISSIONS_LICENSING.md`
- `docs/05_BACKUP_DRIVE_RECOVERY.md`
- `docs/06_DENTAL_AND_SPECIALTIES.md`
- `docs/07_DESIGN_SYSTEM_AND_SCREENS.md`
- `docs/08_TECH_STACK_AND_COMPLIANCE.md`
- `docs/09_DELIVERY_PLAN.md`
- `docs/10_TEST_STRATEGY.md`
- `docs/11_BACKLOG_AND_DECISIONS.md`
- `docs/12_OPERATIONS_AND_SUPPORT.md`
- `docs/13_REQUIREMENTS_MATRIX.md`
- `docs/14_CHANGE_REQUEST_TEMPLATE.md`

---



---

<!-- SOURCE: docs/00_MASTER_SRS.md -->

# المواصفات الرسمية لمتطلبات النظام — Clinic Platform

**Document:** SRS-CLINIC-001  
**Version:** 1.0.0 (Baseline)  
**Date:** 2026-11-07  
**Status:** خط أساس تنفيذي مقترح؛ موافقات التصميم السريرية والقانونية واختبارات الأجهزة مطلوبة قبل البيع  
**Language:** العربية RTL في الواجهة؛ الأرقام الإنكليزية `0-9`؛ المصطلحات البرمجية بالإنكليزية  
**Primary targets:** Windows Desktop + Android Tablet (Android phone بتخطيط ملائم إن سمحت مساحة الشاشة)

> هذه الوثيقة والمتطلبات المرتبطة بها **ملزمة للتنفيذ**. لا يعني تأجيل متطلب إلى إصدار لاحق حذفه. أي تغيير في المتطلبات يتم عبر Change Request موثق، وتحديث مصفوفة التتبع، واعتماد مالك المنتج.

## 1. التعريف والرؤية

منتج تجاري طبي مستقل يُباع للعيادات والمراكز الطبية. يبدأ بوحدة **طب الأسنان** كاملة قابلة للاستخدام، مع نواة طبية عامة ومحرك وحدات اختصاصات قابل للتوسع إلى القلب، العيون، الجلدية، النسائية، الأطفال، العظمية، والطب العام وغيرها. يستخدم العيادة محلياً **دون Node.js، دون خادم منفصل إجباري، دون إنترنت دائم**. لكل جهاز قاعدة SQLite محلية مشفرة، وتكتشف نسخ التطبيق الأجهزة الموثوقة على شبكة LAN وتزامن التغييرات لحظياً حين تكون متصلة. يوفر النظام صلاحيات دقيقة يتحكم بها مالك العيادة من جهازه، وترخيصاً تجارياً مستقلاً عن بيانات المرضى، ونسخاً احتياطية مضغوطة مشفرة محلياً وإلى Google Drive. يمكن لاحقاً إضافة VPS كبوابة مزامنة أو استضافة دون إعادة بناء الواجهات الطبية.

### 1.1 أهداف الأعمال

- **BUS-01** بيع تراخيص حسب المنشأة وعدد الأجهزة والمستخدمين والأطباء والوحدات، وقابلية ترقية الباقة دون مسح البيانات.
- **BUS-02** دعم طبيب منفرد، عيادة بطبيب وسكرتيرتين، عيادة متعددة الأطباء، ومركز متعدد الاختصاصات.
- **BUS-03** تكلفة تشغيل منخفضة: تثبيت التطبيق على الأجهزة المسموح بها، واكتشاف تلقائي عبر LAN، دون خادم Node.js.
- **BUS-04** ملف طبي موثوق يمكن استعادته عند فقد الجهاز، دون رهن وصول المنشأة إلى بيانات المرضى بالتجديد التجاري.
- **BUS-05** أداء مرتفع وسرعة إدخال على اللمس والكيبورد، وتعلم تفضيلات الإدخال محلياً وفق الصلاحيات.
- **BUS-06** هوية بصرية واحدة Medical Premium، قابلة للتخصيص المنضبط وبلا اختلافات عشوائية بين الشاشات.

### 1.2 أصحاب المصلحة والأدوار

مالك المنتج/مزود البرنامج؛ مالك العيادة (الطبيب)؛ أطباء متعددون؛ السكرتيرة 1/2؛ المساعد؛ المحاسب؛ مدير مركز/فرع؛ المريض (ليس مستخدم تطبيق في الإصدار الأول)؛ الدعم الفني التجاري بموافقة المالك فقط؛ المسؤول الأمني/القانوني.

### 1.3 قاموس مصطلحات

- **Clinic/Tenant**: منشأة مستقلة ذات `clinic_id` وهوية ومفاتيح وبيانات معزولة.
- **Owner**: الطبيب/الشخص المخوّل بإدارة الصلاحيات والأجهزة والسياسات محلياً.
- **Device**: تثبيت موثوق له مفتاح خاص محمي، وليس مجرد عنوان IP.
- **Coordinator**: دور تقني مؤقت داخل تطبيق معتمد لتسلسل تغييرات مشتركة حساسة، **لا** يعني امتلاك صلاحيات الطبيب.
- **Peer**: جهاز مرخص وموثوق مرتبط بالعيادة.
- **Encounter**: زيارة طبية فعلية، مستقلة عن Appointment (الحجز).
- **Odontogram**: مخطط الأسنان متعدد الأسطح.
- **Clinical Finding**: ملاحظة أو تشخيص موثق، لا يساوي تنفيذ العلاج.
- **Treatment Plan**: خطة وإجراءات منتظرة، منفصلة عن الإجراءات المنفذة.
- **Module**: حزمة وظائف اختصاص/خدمة معرفة بإصدار وصلاحيات وسكيما ومفعلة بترخيص.
- **RPO/RTO**: هدف أقصى فقد بيانات مقبول / زمن استعادة مستهدف وفق خطة النشر.
- **Committed**: عملية مشتركة معتمدة بتسلسل ومنسق موثوق؛ **Pending**: عملية محلية لم تُعتمد بعد.

### 1.4 تعريف MUST / SHOULD / MAY

- **MUST**: إلزامي ضمن المرحلة المحددة، لا يجوز إسقاطه بصمت.
- **SHOULD**: افتراضي موصى به ويستدعي تبريراً مكتوباً عند استبداله.
- **MAY**: خيار غير مانع للإصدار الأول.
- **P0/P1/P2**: أولوية تأسيسية / أساسية للنسخة التجارية الأولى / لاحقة موثقة. **لا تعني P2 الحذف**.

## 2. نطاق الإصدارات

- **Phase 0 — إثبات الفرضيات والأمان:** Windows↔Android اكتشاف/ربط/تشفير/مزامنة، اختبار صلاحيات، Backup/Restore، مفاتيح التراخيص؛ لا بيانات مرضى حقيقية.
- **Phase 1 — نواة العيادة القابلة للتجربة:** مالك/مستخدمون/أجهزة، مرضى، مواعيد، زيارات، ملفات، إدخال ذكي، مالية أساسية، تصميم؛ اختبارات تكامل.
- **Phase 2 — Dental MVP تجاري:** مخطط الأسنان، السطوح، العلاجات والخطط، الأشعة/المرفقات، موافقات، وصفات، تقرير، صلاحيات، نسخ، تراخيص، طباعة، ثبات الإنتاج.
- **Phase 3 — نمو عيادات الأسنان:** لثة متقدم، مخابر الأسنان، تقويم، زرعات، مخزون وعمولات وتقارير مالية موسعة.
- **Phase 4 — اختصاصات أخرى وVPS:** Specialty SDK، تكاملات DICOM/FHIR حسب متطلبات السوق، بوابة VPS والمزامنة الهجينة إذا ثبتت الحاجة.

**خارج نطاق الإصدار التجاري الأول:** التشخيص الذاتي بالذكاء الاصطناعي، وصف العلاج آلياً، أنظمة التأمين الشاملة، المزامنة الثنائية السحابية العامة، تشغيل خادم إلزامي، تحميل كود Dart تنفيذي غير موثوق من الإنترنت، وربط الأجهزة الطبية دون اعتماد بروتوكولها واختباره. يجب أن تكون المعمارية جاهزة لتوسعتها لاحقاً.

## 3. متطلبات المنصة والتشغيل

| ID | الأولوية | المتطلب / معيار الملاحظة |
|---|---|---|
| REQ-PLAT-001 | P0 | التطبيق Flutter/Dart من قاعدة كود مشتركة على Windows وAndroid، مع Native bridges محدودة وموثقة عند الحاجة. |
| REQ-PLAT-002 | P0 | **ممنوع** افتراض Node.js أو خدمة API خارجية أو إنترنت إلزامي لتشغيل العيادة محلياً. |
| REQ-PLAT-003 | P0 | إنشاء عيادة محلية من جهاز المالك، واكتشافها والانضمام إليها عبر LAN دون إدخال IP في المسار العادي. |
| REQ-PLAT-004 | P0 | يعمل جهاز منفرد دون Wi-Fi؛ وتعمل الأجهزة الموثوقة معاً عبر LAN حتى في غياب الإنترنت. |
| REQ-PLAT-005 | P0 | قاعدة بيانات مستقلة **مشفرة لكل جهاز/عيادة** عبر Drift + SQLite3MultipleCiphers أو بديل تم التحقق منه، ولا تُشارك ملفات SQLite عبر SMB أو NAS. |
| REQ-PLAT-006 | P0 | واجهات وصلاحيات وبيانات منفصلة على أساس `clinic_id` و`device_id` و`user_id`؛ لا تسرب بين العيادات. |
| REQ-PLAT-007 | P1 | Windows 10/11 x64 والأجهزة اللوحية Android وفق مصفوفة دعم يثبتها الفريق؛ تحقق خاص من الأجهزة الفعلية. |
| REQ-PLAT-008 | P1 | تمكين إعادة اتصال تلقائي ومزامنة مستأنفة، وحالة مزامنة ظاهرة للمستخدم. |
| REQ-PLAT-009 | P2 | تهيئة بروتوكولات sync قابلة لإضافة VPS كـpeer/coordinator أو بوابة معزولة لاحقاً. |
| REQ-PLAT-010 | P0 | يجب الإفصاح صراحة في الواجهة عن قيود Android على الخدمة في الخلفية، وقيد إلغاء الصلاحية على الأجهزة غير المتصلة. |

## 4. إنشاء العيادة والأجهزة والمستخدمون

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-SET-001 | P0 | First-Run Wizard: لغة، إنشاء/الانضمام، اسم العيادة، اختصاص، مالك، عملة، منطقة زمنية، سياسة نسخ، طريقة استعادة، رخصة. |
| REQ-SET-002 | P0 | إنشاء معرف `clinic_id` عشوائي دائم ومفاتيح هوية العيادة؛ لا يعاد توليده عند تحديث التطبيق. |
| REQ-SET-003 | P0 | إعلان خدمة LAN باكتشاف mDNS/DNS-SD، مع بديل QR أو رمز اقتران في الشبكات التي تمنع multicast. |
| REQ-SET-004 | P0 | طلب انضمام الجهاز يتطلب موافقة مالك مخوّل، تبادل مفاتيح وتحقيق بصمة قناة، وتسجيل الجهاز وربطه بمقعد الترخيص. |
| REQ-SET-005 | P0 | كل جهاز يرى فقط البيانات المصرح بها؛ النسخ المحلي غير المصرح من السجلات الطبية **ممنوع**. |
| REQ-SET-006 | P1 | إدارة عيادات/أفرع وغرف وكراسي عمل ومناوبات العاملين، مع نطاقات محكمة. |
| REQ-SET-007 | P0 | إجراء استعادة هوية المالك ونقل جهازه بعد فقدان الجهاز، دون إعطاء الدعم الفني مفاتيح بيانات المرضى. |
| REQ-SET-008 | P1 | إدارة انتقال موظف بين جهازين، إنهاء جلسة، إيقاف مستخدم، وإلغاء ثقة جهاز مع سجل تدقيق. |

## 5. الهوية والصلاحيات الدقيقة

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-AUTH-001 | P0 | RBAC للأدوار + ABAC لنطاق بيانات العيادة/الفرع/الطبيب/المريض + Device Bound Policy. |
| REQ-AUTH-002 | P0 | صلاحية منفصلة لكل `module.resource.action.scope`؛ الإجراءات `view/create/update/delete/cancel/approve/print/export/assign`. |
| REQ-AUTH-003 | P0 | مالك العيادة يفعّل/يعطل للمستخدم جهازاً وشاشة وحقلاً وعملاً ونطاق مرضى من جهازه. |
| REQ-AUTH-004 | P0 | نموذج منع افتراضي Deny-by-default، وتقييم صلاحية وقت العملية وليس بمجرد إخفاء زر. |
| REQ-AUTH-005 | P0 | نشر سياسة موقعة ذات `policy_version` على جميع الأجهزة؛ لا يجوز لإصدار أقدم توسيع الصلاحيات. |
| REQ-AUTH-006 | P0 | عند إلغاء صلاحية جهاز متصل: إغلاق المشاهدات المحمية، إبطال الرموز المؤقتة، تنظيف أي كاش محمي؛ الجهاز المنفصل يلتزم بصلاحيات Offline TTL أو يُمنع. |
| REQ-AUTH-007 | P0 | سجلات `who/when/device/action/before-after-reference/reason` لكل تغيير صلاحيات ووصول حساس. |
| REQ-AUTH-008 | P1 | أدوار جاهزة: Owner, Doctor, Assistant, Receptionist, Accountant, ClinicManager, Support (مقيد بموافقة). |
| REQ-AUTH-009 | P0 | يجب ألا يتلقى جهاز الاستقبال تفاصيل الأمراض/الأدوية/الأشعة في مزامنته ما لم تتطلب الصلاحية ذلك؛ حظر الإفراط في نسخ البيانات. |
| REQ-AUTH-010 | P0 | لا تخوّل شخصية Coordinator امتيازات Owner؛ ولا تتيح كلمة مرور مستخدم الدخول من جهاز غير موثوق بلا إجراء اقتران. |
| REQ-AUTH-011 | P1 | تغيير كلمات المرور وإغلاق الجلسات وخيارات قفل تلقائي مع إعادة مصادقة على الإجراءات الحساسة. |

## 6. المرضى والمواعيد والزيارات

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-PAT-001 | P1 | بطاقة مريض: رقم ملف، الاسم العربي/اللاتيني اختيارياً، الاسم المستعار، الميلاد/عمر تقديري، الجنس، الهواتف، عنوان، جهات اتصال. |
| REQ-PAT-002 | P1 | فصل الجنس عن تصنيف العمر (طفل/بالغ)؛ حساب العمر من الميلاد دون استخدام «طفل» كقيمة جنس. |
| REQ-PAT-003 | P1 | بحث بالعربية بعد التطبيع مع الحفاظ على القيمة الأصلية، بحث هاتف/ملف، وكشف تكرارات قبل التسجيل. |
| REQ-PAT-004 | P1 | التاريخ الطبي: حساسية، أمراض مزمنة، أدوية، عمليات، تنبيهات، مع نعم/لا/غير معروف، وتاريخ المصدر. |
| REQ-PAT-005 | P1 | ملف متعدد الزيارات مع طبيب وتاريخ وسبب زيارة ونتائج وفحوص وتشخيصات وإجراءات ومرفقات. |
| REQ-PAT-006 | P1 | منع الحذف الصامت للسجل المعتمد؛ يسمح بالتصحيح المرتبط بالأصل مع المستخدم والسبب والوقت. |
| REQ-PAT-007 | P1 | دمج ملفين مكررين بمراجعة واعتماد، مع الاحتفاظ بالمعرّفات القديمة والروابط وسجل التدقيق. |
| REQ-PAT-008 | P1 | المواعيد Appointment منفصلة عن Encounter الفعلي، مع حالات الحجز/الوصول/الانتظار/الدخول/الإنهاء/الإلغاء/عدم الحضور. |
| REQ-PAT-009 | P1 | تقويم يومي/أسبوعي/شهري لكل طبيب وكرسي وغرفة؛ كشف تعارض الموارد على المنسق. |
| REQ-PAT-010 | P1 | قائمة انتظار/أولوية/مناوبة واستراحة وأجازات الطبيب، ومواعيد متكررة/متابعة. |
| REQ-PAT-011 | P1 | تسجيل موافقة المريض على إجراء أو علاج وإصدار وثيقة ذات إصدار وتوقيع وتاريخ ونطاق واضح. |
| REQ-PAT-012 | P1 | وصفات وتقارير وإحالات يراجعها الطبيب ويعتمدها؛ لا تشخيص أو وصف آلي دون اعتماد. |
| REQ-PAT-013 | P1 | مسودات الزيارات تحفظ تلقائياً وتبقى غير معتمدة حتى توقيع/اعتماد الطبيب. |

## 7. وحدة طب الأسنان

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-DEN-001 | P1 | Odontogram رسومي تفاعلي يدعم الأسنان الدائمة 32 واللبنية 20، ومرحلة الأسنان المختلطة وترقيم FDI. |
| REQ-DEN-002 | P1 | منطقة قابلة للنقر لكل سن ولكل سطح طبي مناسب (M/D/B أو F/L أو P/O/I حسب نوع السن)، مع توضيح وتعليمات. |
| REQ-DEN-003 | P1 | حالة السن مشتقة من Findings/Procedures/ToothEvents المؤرخة، لا تُخزن فقط كألوان. |
| REQ-DEN-004 | P1 | حالات تسوس، حشوة، تاج، جسر، معالجة جذور، قلع، مفقود، زرع، سن غير بازغ، وغيرها عبر قاموس حالات قابل للتوسيع. |
| REQ-DEN-005 | P1 | اختيار سن أو عدة أسنان وأسـطح وربط الإجراءات بالزيارة والطبيب والتكلفة والملفات. |
| REQ-DEN-006 | P1 | فصل خطة العلاج الموصى بها عن تنفيذها، وتوثيق الحالة (planned/in-progress/completed/cancelled). |
| REQ-DEN-007 | P1 | سجل سن زمني مع صور أشعة وملاحظات ومعالجات، وإظهار حالة المخطط في تاريخ معين. |
| REQ-DEN-008 | P1 | دعم لمس/قلم/فأرة وتكبير وسحب، ومفاتيح اختيار، وأداء بلا تهنيج عند التغيير. |
| REQ-DEN-009 | P2 | Periodontal chart بقياسات الموقع واللثة والنزف وفق تعريف طبي معتمد من مراجعي الاختصاص. |
| REQ-DEN-010 | P2 | وحدات تقويم وزرعات ومخابر أسنان وطلبات التيجان وإشعارات الاستلام. |
| REQ-DEN-011 | P1 | وسيلة إيضاح موحدة للحالات، مع رموز بالإضافة إلى الألوان، واعتماد اصطلاحات مع طبيب أسنان قبل البيع. |

## 8. الإدخال الذكي والقوالب

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-INP-001 | P1 | جميع حقول الخيارات تدعم نمطاً مناسباً: radio/segmented/select/search/multi-select/date/time/number/yes-no-unknown. |
| REQ-INP-002 | P1 | Autocomplete محلي سريع ضمن سياق الحقل، مرتب بالتكرار والحداثة وتفضيلات المستخدم والاختصاص. |
| REQ-INP-003 | P1 | لكل مستخدم تاريخ اقتراحات خاص، ولا تنتقل اقتراحات خاصة أو حساسة بين صلاحيات مختلفة. |
| REQ-INP-004 | P1 | دعم قوالب فحوص وعبارات جاهزة ومتغيرات، مع عدم اعتماد نتيجة سريرية لم يُثبتها الطبيب. |
| REQ-INP-005 | P1 | Form Engine شرطي ذو أنواع ونسخ وقواعد تحقق، مع سجل إصدار للنماذج المستخدمة في زيارة سابقة. |
| REQ-INP-006 | P1 | تطبيع عربي للبحث (الألف، التشكيل...) لا يغير النص الأصلي الطبي؛ فهرسة SQLite FTS عند الحاجة. |
| REQ-INP-007 | P1 | Windows: Tab/Shift+Tab، Enter للاختيار، أسهم للقوائم، Esc للإغلاق، Ctrl+S للحفظ، Ctrl+F للبحث، اختصارات موثقة. |
| REQ-INP-008 | P1 | Android: عناصر لمس كبيرة، لوحة رقمية للحقول الرقمية، إدخال دون تبديل غير ضروري بين اللوحات. |
| REQ-INP-009 | P1 | حفظ مسودات تلقائي، منع الحفظ المكرر، تحذير عند فقد التغييرات، وحالات انتظار/نجاح/فشل مفهومة. |
| REQ-INP-010 | P1 | خيارات القواميس القياسية منفصلة عن قيم المستخدم التعليمية؛ لا تصبح الأخطاء المصطلحية تشخيصات معتمدة تلقائياً. |

## 9. الحسابات التشغيلية والفوترة

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-FIN-001 | P1 | تسعير إجراءات وخطط علاج حسب العيادة/الطبيب/العملة، مع تاريخ سعر وموافقة على الخصم. |
| REQ-FIN-002 | P1 | فاتورة خدمات وسطور متعددة، حسومات، ضرائب قابلة للتكوين بحسب السوق، دفع جزئي، دفعات، رصيد ومديونية. |
| REQ-FIN-003 | P1 | سجل قبض وإلغاء/رد وتصحيح لا يزيل القيود الأصلية؛ منع عمليات الدفع المزدوجة بأرقام idempotency. |
| REQ-FIN-004 | P1 | فصل الصلاحيات: استقبال يمكنه التحصيل دون معرفة أرباح العيادة؛ المحاسب يرى حسب التفويض. |
| REQ-FIN-005 | P1 | تقارير يومية عن الفواتير والتحصيلات والأرصدة والمواعيد ومرضى جدد والعمليات حسب الطبيب. |
| REQ-FIN-006 | P1 | قيم مالية دقيقة Decimal أو مبالغ بوحدات صغرى محددة لكل عملة؛ **ممنوع** Float/Double للحسابات المالية. |
| REQ-FIN-007 | P2 | جلسات صندوق، تسويات، عمولات الأطباء، تكلفة المستهلكات، حساب الربحية التقديرية، العملات المتعددة. |
| REQ-FIN-008 | P2 | مخزون المواد الطبية والأدوية وعمليات الإدخال/الإخراج، حد إعادة الطلب، دفعات وانتهاء صلاحية. |
| REQ-FIN-009 | P1 | الطبيب يستطيع إضافة محاسب أو مقعد مستخدم دون أي حذف/إعادة إنشاء لقاعدة بيانات العيادة. |

## 10. المرفقات والوصفات والتقارير

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-DOC-001 | P1 | رفع/عرض صور الأسنان والأشعة العادية وPDF، وربطها بمريض وزيارة وسن ونسخة. |
| REQ-DOC-002 | P1 | تخزين ملفات أصيلة غير معدلة، وتوليد thumbnails منفصلة، مع Hash وسجل من رفع/فتح/تصدير. |
| REQ-DOC-003 | P1 | تنزيل/فتح الملفات وفق الصلاحيات فقط، وحظر ملفات مسار مطلق غير آمن أو مسارات traversal. |
| REQ-DOC-004 | P1 | طباعة PDF عربية RTL بترويسة عيادة وشعار وطبيب وتاريخ، وجداول وخطوط ومجاميع وتذييل واضح. |
| REQ-DOC-005 | P1 | طباعات: بطاقة مريض، موعد، وصفة، موافقة، خطة علاج، فاتورة، سند قبض، تقرير، صورة مع شرح. |
| REQ-DOC-006 | P1 | تصدير CSV/Excel للأقسام المسموحة وفق الصلاحية وسياسة الخصوصية، مع سجل عملية التصدير. |
| REQ-DOC-007 | P2 | محرك DICOM عند تحديد الأجهزة والصيغ والتراخيص واختبار أمان المحتوى؛ FHIR compatibility mapping مستقبلاً. |

## 11. مزامنة LAN والتناسق

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-SYN-001 | P0 | اكتشاف آمن عبر mDNS/DNS-SD وFallback QR/manual host؛ لا يُعتبر اسم الخدمة دليلاً للثقة. |
| REQ-SYN-002 | P0 | Pairing آمن بموافقة المالك وتبادل مفاتيح وتوثيق طرفين وتشفير نقل؛ لا تشارك العيادة بياناتها لجهاز غير موثوق. |
| REQ-SYN-003 | P0 | تغيير ذري محلي: تحديث البيانات + تدوين Outbox داخل نفس Transaction؛ الاستقبال idempotent. |
| REQ-SYN-004 | P0 | كل رسالة تحتوي `op_id`, `clinic_id`, `actor_id`, `device_id`, `aggregate_id`, `schema_version`, `policy_version`, `timestamp`, `signature`, `payload`. |
| REQ-SYN-005 | P0 | تسلسل/اعتماد مركزي **منطقي** لعمليات المواعيد الحساسة والدفعات والتغييرات الإدارية دون خادم منفصل؛ عند غياب المنسق تحفظ كمسودة Pending ولا تُعتبر Committed. |
| REQ-SYN-006 | P0 | المحررات الطبية تحفظ تصحيحات مؤرخة ذات إصدارات؛ لا تعتمد قاعدة آخر كتابة يفوز على جميع الملفات. |
| REQ-SYN-007 | P0 | معالجة انقطاع وإعادة إرسال/إقرار/checkpoints/backpressure ونقل ملفات تدريجي واستعادة نقل عند انقطاع. |
| REQ-SYN-008 | P0 | لا يُسمح بتزامن ما لا يحق للمستقبل معرفته؛ الترشيح قبل النقل والتخزين وليس عند العرض فقط. |
| REQ-SYN-009 | P0 | كشف تعارض تعديل السجل نفسه وإيقاف التغييرات غير القابلة للدمج وإظهار تسوية للمخوّل مع سجل تدقيق. |
| REQ-SYN-010 | P1 | رؤية حالة Online/Offline/Pending/Conflict لكل عملية حساسة وسجل آخر مزامنة. |
| REQ-SYN-011 | P0 | منع انقسام السلطة (Split Brain) بمنسق له Epoch/Lease/Term؛ لا يقبل جهازان تعيين نفسيهما مالكين لاعتماد العمليات المالية ذاتها. |
| REQ-SYN-012 | P0 | تحقق توافق بروتوكول/سكيما بين الإصدارات؛ جهاز قديم غير متوافق يصبح Read-only أو يُمنع حتى التحديث، دون تلف بيانات. |

## 12. التراخيص التجارية والترقيات

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-LIC-001 | P0 | رخصة منشأة موقعة رقمياً تحدد `max_active_users`, `max_registered_devices`, `max_doctors`, `enabled_modules`, `expiry`, `license_revision`. |
| REQ-LIC-002 | P0 | ربط كل جهاز بهوية مفتاح عام/خاص محمي بنظام التشغيل بقدر الإمكان؛ **لا** اعتماد IMEI/MAC وحدهما. |
| REQ-LIC-003 | P0 | تفعيل Offline عبر طلب QR وتوقيع من أداة License Issuer منفصلة بمفتاح خاص لا يُضمن في تطبيق العميل. |
| REQ-LIC-004 | P1 | دعم التفعيل Online الاختياري مستقبلاً؛ لا اتصال إلزامي بالخادم أثناء العمل المحلي. |
| REQ-LIC-005 | P0 | إضافة محاسب/طبيب/جهاز/موديول عبر رخصة ترقية signed revision دون مساس ببيانات المرضى أو إعادة تثبيت التطبيق. |
| REQ-LIC-006 | P0 | منع تطبيق رخصة من عيادة أخرى، أو نسخة أقدم تُرجع الاستحقاقات، أو نسخ ملفات ترخيص غير صالحة لجهاز جديد. |
| REQ-LIC-007 | P1 | نقل الترخيص عند ضياع جهاز وفق إجراء استعادة معتمد، وإيقاف الجهاز القديم عند اتصال شبكة موثوقة. |
| REQ-LIC-008 | P0 | بقاء آلية آمنة لقراءة/تصدير البيانات الطبية عند انتهاء الرخصة وفق سياسة وواجبات قانونية؛ لا ابتزاز بيانات. |
| REQ-LIC-009 | P1 | شاشة استحقاقات وتراخيص: مستخدمون نشطون، أجهزة، أطباء، موديلات، تاريخ انتهاء، سجل ترقيات. |

## 13. النسخ الاحتياطي والاستعادة

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-BKP-001 | P0 | كل نسخة احتياطية يدوية/آلية **تُضغط وتُشفّر** قبل التخزين المحلي أو السحابي، بصيغة `.clinicbak` ذات إصدار. |
| REQ-BKP-002 | P0 | Snapshot متسق من SQLite عبر Online Backup API أو مكافئ مثبت، مع manifest للمرفقات ووضع التزامن. |
| REQ-BKP-003 | P0 | ضغط Streaming Zstd أو بديل موثق، ثم تشفير AEAD مثل AES-256-GCM على أجزاء فريدة Nonce، مع Integrity وHash manifest. |
| REQ-BKP-004 | P0 | مفتاح نسخ عشوائي خاص بالعيادة وحماية عبر عبارة استرداد/مفتاح ملفوف بآلية اشتقاق قوية؛ لا يوضع مفتاح المستخدم الصريح داخل الأرشيف. |
| REQ-BKP-005 | P1 | نسخ محلي/Google Drive عبر OAuth 2.0 بحد وصول محدود مثل `drive.file`، وإرسال resumable مع إعادة محاولة واستكمال. |
| REQ-BKP-006 | P1 | جدولة يومية افتراضية وتحديد احتفاظ وأشعة/مرفقات وحجم وطاقة وWi-Fi؛ مع تنبيه عند عدم تحقق النسخة. |
| REQ-BKP-007 | P0 | اختبار سلامة بعد الإنشاء وبعد الرفع، وتجربة استعادة دورية، وأرشفة نسخ متعددة (لا الاستبدال الصامت لآخر نسخة صالحة). |
| REQ-BKP-008 | P0 | الاستعادة في بيئة مؤقتة وفحص قاعدة البيانات والمرفقات/الإصدارات، ثم نقل آمن؛ لا تُبدَّل بيانات نشطة دون موافقة وتعافٍ منسق. |
| REQ-BKP-009 | P0 | استعادة بيانات العيادة مستقلة عن نقل رخصة الجهاز أو مفاتيح هوية جهاز سابق. |
| REQ-BKP-010 | P1 | التدرج مستقبلاً إلى نسخ تزايدية مشفرة مع snapshots كاملة دورية واختبار قابلية الاستعادة. |

## 14. الهوية والتصميم وتجربة الاستخدام

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-UX-001 | P0 | هوية **Medical Premium**: Sidebar بترولي `#164E63`، زر أساسي تركوازي `#0F766E`، خلفية `#F5F8FA`، أسطح `#FFFFFF`، نص `#1E293B`، حدود `#DCE5E9`. |
| REQ-UX-002 | P0 | واجهة RTL عربية كاملة، أرقام إنكليزية 0-9، اتجاه أرقام الهواتف والتواريخ محفوظ. |
| REQ-UX-003 | P1 | خط عربي واضح مثل IBM Plex Sans Arabic ضمن شروط ترخيصه، أحجام مريحة ونسبة تباين لا تقل عن WCAG AA عند الإمكان. |
| REQ-UX-004 | P1 | تخطيط متكيف: Windows قوائم وجداول غنية؛ Tablet عناصر لمس ومخطط واسع؛ عدم مجرد تصغير الواجهة. |
| REQ-UX-005 | P1 | القائمة الرئيسية تظهر وفق صلاحيات المستخدم، وأزرار مهمة ثابتة وواضحة، وحالات empty/error/loading/success متسقة. |
| REQ-UX-006 | P1 | شاشات أساس: First-run، الدخول، dashboard حسب الدور، المرضى، مريض، المواعيد، الزيارة، odontogram، مالية، المستخدمون والصلاحيات، الترخيص، النسخ، حالة المزامنة، التقارير. |
| REQ-UX-007 | P1 | Light الافتراضي مع Dark اختياري دون تغير ألوان المعاني الطبية، وتخصيص الكثافة/الخط ضمن حدود التصميم. |
| REQ-UX-008 | P1 | قائمة جانبية قابلة للطي على Windows، وواجهة تابلت متجاوبة، ودعم تكبير النص والملاحة بلوحة المفاتيح وقارئ الشاشة. |
| REQ-UX-009 | P1 | ألوان رسم الأسنان تمثل معاني موحدة بأيقونات/رموز إلى جانب اللون وليس بالألوان وحدها. |

## 15. الوحدات والاختصاصات

| ID | الأولوية | المتطلب |
|---|---|---|
| REQ-MOD-001 | P0 | نواة محايدة تخصصياً: Patient/Encounter/Appointment/Provider/Forms/Docs/Billing/Permissions/Sync. |
| REQ-MOD-002 | P0 | واجهة `SpecialtyModule` توضح ID/version/dependencies/permissions/forms/reports/migrations/license flags. |
| REQ-MOD-003 | P1 | وحدة الأسنان أول وحدة، يجب ألا تضع حقولها حصراً داخل جدول المريض العام. |
| REQ-MOD-004 | P1 | محرك نماذج الاختصاص قابل للتعريف بالبيانات مع Validation/Visibility/Versioning، لا يعتمد على JSON واحد لكل البيانات المنظمة. |
| REQ-MOD-005 | P2 | اختصاصات مستقبلية: قلب، عيون، نسائية، جلدية، أطفال، عظمية، باطنية وطب عام، لكل منها Forms/Resources/Reports. |
| REQ-MOD-006 | P0 | الترخيص يفعّل وحدات مجمعة بصورة آمنة؛ **لا تحميل أو تنفيذ كود Dart غير موقع داخل التطبيق المنشور**. |

## 16. متطلبات الجودة غير الوظيفية

> الحدود التالية **أهداف قبول مرجعية** على أجهزة الاختبار المحددة في `docs/10_TEST_STRATEGY.md`؛ لا تدّعي ضمان كل الظروف.

| ID | الأولوية | معيار غير وظيفي قابل للقياس |
|---|---|---|
| REQ-NFR-001 | P0 | صفر فقد صامت للبيانات في اختبارات انقطاع الشبكة والقتل المفاجئ وإعادة التشغيل. |
| REQ-NFR-002 | P1 | واجهة اختيار سن/سطح تتفاعل في الإطار التالي عملياً عند 60fps مستهدف على عتاد مرجعي؛ لا إعادة بناء شاشة كاملة لكل نقرة. |
| REQ-NFR-003 | P1 | فتح مريض مخزن محلياً P95 ≤ 150ms، واقتراحات حقل P95 ≤ 120ms، بعد warm-up في سيناريو 20 ألف مريض. |
| REQ-NFR-004 | P1 | ظهور حدث مُعتمد على نظير متصل عبر LAN P95 ≤ 500ms بحمل طبيعي وشبكة اختبار محددة؛ لا يشمل رفع الأشعة. |
| REQ-NFR-005 | P1 | عدم حجب UI أثناء النسخ والضغط والمزامنة، ومعالجة جداول بصفحات وvirtualization وفهرسة. |
| REQ-NFR-006 | P0 | تخزين/اتصال مشفر، أسرار في مخزن آمن، تطبيق OWASP MASVS وضوابط ASVS المناسبة للمنافذ المحلية. |
| REQ-NFR-007 | P0 | تحكم خصوصية صارم وسجل تدقيق طبي ومالي وإداري دون حذف صامت. |
| REQ-NFR-008 | P1 | تحقق الترجمة RTL، ودعم خط واضح، تباين WCAG AA للنص العادي حيث تنطبق المعايير. |
| REQ-NFR-009 | P1 | عمليات Migration مرقمة/قابلة للاختبار مع نسخ سابق وخطة rollback أو recovery مثبتة. |
| REQ-NFR-010 | P1 | حزمة Android APK/AAB موقعة وWindows MSIX/مثبت مناسب وموقع، مع Release Notes ونسخة سكيما/بروتوكول. |
| REQ-NFR-011 | P1 | فحوص CI: format/analyze/test/schema-lint/secret-scan/dependency-license-check وRelease smoke tests. |
| REQ-NFR-012 | P0 | لا سطور كود تحتوي secrets فعلية ولا إدراج بيانات مرضى حقيقية في telemetry أو logs. |
| REQ-NFR-013 | P0 | جميع النسخ والملفات والاتصالات تُقيَّد على أساس السياسة/السياق؛ مصدر الحقيقة ليس الـUI وحدها. |
| REQ-NFR-014 | P1 | استخدام معايير توثيق سريري ومراجعة أطباء قبل تسويق القوالب الطبية كإجراءات معتمدة. |
| REQ-NFR-015 | P1 | تحديثات موقعة، توافق protocol/schema، منع downgrade خطر، واستعادة تلقائية عند فشل الترحيل. |

## 17. مراجع الملحقات الملزمة

- `01_ARCHITECTURE_AND_TOPOLOGY.md`: معماريات النشر والحالات غير المتصلة ودور المنسق.
- `02_DATA_MODEL_AND_RULES.md`: جداول DB والمفاتيح والقيود وترحيلها.
- `03_SYNC_PROTOCOL.md`: بروتوكول peer، قواعد اعتماد وتعارضات.
- `04_SECURITY_PERMISSIONS_LICENSING.md`: التهديدات والصلاحيات والترخيص والتعافي.
- `05_BACKUP_DRIVE_RECOVERY.md`: تنسيق `.clinicbak` وجداول النسخ والاستعادة.
- `06_DENTAL_AND_SPECIALTIES.md`: نموذج الأسنان ومحرك النماذج/الاختصاصات.
- `07_DESIGN_SYSTEM_AND_SCREENS.md`: مواصفات الواجهة والألوان والحقول وخرائط الشاشات.
- `08_TECH_STACK_AND_COMPLIANCE.md`: الحزم وخطة تثبيتها وتراخيصها.
- `09_DELIVERY_PLAN.md`: مراحل الإنجاز والقيود على الوكلاء البرمجيين.
- `10_TEST_STRATEGY.md`: اختبارات التتبع والقبول والسلامة.
- `11_BACKLOG_AND_DECISIONS.md`: الفجوات المؤجلة وقرارات التنفيذ الافتراضية.
- `12_OPERATIONS_AND_SUPPORT.md`: التثبيت، الدعم، التحديث، الاستيراد/التصدير، السوق.

## 18. ضوابط قبول تغيير المتطلبات

- كل متطلب يملك ID ثابتاً ولا يُحذف من التاريخ؛ يمكن تحويل حالته إلى `Deferred/Superseded` بإحالة وسبب واعتماد.
- عند طلب تغيير: تحليل أثره على DB، الأمن، المزامنة، الواجهات، التراخيص، النسخ، الاختبارات، والترحيل.
- أي Implementation PR يذكر IDs المنفذة، Tests، مخاطر، توثيق، ونتائج تشغيل Windows/Android حسب نطاقه.
- ممنوع الادعاء بأن البرنامج «مكتمل» لأن المشروع يبني أو لأن الواجهة تظهر؛ يجب اجتياز بوابة القبول في `10_TEST_STRATEGY.md`.


---

<!-- SOURCE: docs/01_ARCHITECTURE_AND_TOPOLOGY.md -->

# 01 — معمارية التطبيق والطوبولوجيا

## 1. مبادئ لا تقبل التفاوض

1. Flutter Desktop/Android، قاعدة كود مشتركة، وحزم Domain مستقلة.
2. بيانات كل جهاز تُقرأ من **قاعدة محلية مشفرة**؛ لا انتظار طلب HTTP عند فتح ملف موجود.
3. لا Node.js ولا خادم مستقل إلزامي. المنسق **دور ضمن نفس التطبيق** وبديله وفق سياسات موثقة.
4. لا P2P ساذجة لكل العمليات: بعض الأشياء Local Draft، وبعضها تحتاج **قراراً متسلسلاً** من منسق.
5. الطبيب هو **مالك الصلاحية** عبر مفتاح إداري موثق؛ المنسق ليس بالضرورة جهاز الطبيب ولا يمتلك ملكية.
6. العميل المستهدف عيادة واحدة على شبكة محلية أولاً، وتعدد الفروع/الشبكات والسحابة لاحقاً دون وعد بمزامنة لحظية خارج LAN.
7. التثبيت والمعمارية يعملان دون شبكة أو إنترنت على جهاز واحد؛ فقط الخدمات السحابية والتفعيل Online تستهلك الإنترنت.

## 2. المخطط المنطقي

```text
+---------------------- LAN / Wi-Fi / Ethernet -----------------------------+
| Android (Doctor)           Android (Reception)       Windows (optional) |
|  Flutter UI                  Flutter UI                 Flutter UI       |
|  Domain/Permissions          Domain/Permissions         Domain         |
|  Drift+SQLiteMC             Drift+SQLiteMC             Drift+SQLiteMC  |
|  Secure KeyStore             Secure KeyStore            TPM/DPAPI       |
|  Sync+Outbox                 Sync+Outbox                Sync+Outbox    |
|    <--------- encrypted authenticated peer communication ----------->   |
|                   Elected/assigned coordinator role                       |
+---------------------------------------------------------------------------+
          Optional INTERNET (never mandatory for local clinic)
            |                                         |
  Google Drive encrypted backups       Future VPS sync gateway/licensing
```

## 3. طبقات التطبيق

- **Presentation:** Design tokens, responsive layouts, Riverpod view models, keyboard/touch interactions.
- **Application services:** Use cases، مدقق صلاحيات، سيناريوهات المستخدم، المزامنة، التدقيق، إدارة الترخيص.
- **Domain:** Entities, Value Objects, State Machines, typed errors, business invariants (لا استيراد Flutter widgets).
- **Persistence:** Drift DAOs، migrations، per-device encrypted SQLite، FTS5، Outbox/Inbox.
- **Transport:** Bonsoir/mDNS، QR fallback، WS أو framed secure channels، framing/replay protection، attachments streaming.
- **Platform:** Android Keystore/NSD/scheduler، Windows CNG/DPAPI/installer، الكاميرا والطباعة والملفات.
- **Backup/License:** بنية مستقلة بحواجز أمان واضحة.

**ممنوع:** وضع SQL مباشرة داخل Widget، توزيع صلاحيات في UI فقط، جعل معاملات مالية تعتمد على optimistic UI دون اعتماد، نسخ SQLite عبر شبكة ملفات مشتركة.

## 4. أوضاع تشغيل العيادة

| Mode | الأجهزة | المنسق | اتصال Internet | سلوك البيانات |
|---|---|---|---|---|
| Solo | 1 | الجهاز نفسه | لا | محلي مع تشفير ونسخ احتياطي اختياري |
| LAN small | 2–5 | أحد الأجهزة الموثوقة عند تشغيله | لا | مزامنة فورية عند الاتصال |
| LAN center | 5+ | يفضل Windows ثابت التشغيل، **داخل التطبيق** | لا | تنسيق موحد + Peer caches |
| Hybrid future | عدة شبكات | Gateway/Coordinator مطور مستقل | اختياري | مواصفات Protocol نفسها، تسوية عبر WAN عند الاتصال |

### 4.1 المنسق ودوره

- اختيار الجهاز المفضل بمعرف موثق من المالك. وجود الجهاز ليس شرطاً لاستخدام *كل* الوظائف محلياً.
- إذا اختفى المنسق، عمليات كتابة ملاحظة/مسودة محلية تستمر حسب policy؛ الحجز النهائي والدفع والتحويلات والحقوق الإدارية تبقى Pending حتى يُستعاد منسق موثوق.
- يمكن اعتماد failover فقط ببروتوكول epoch/quorum/lease يضمن عدم وجود منسقين يثبتان نفس الماليات؛ إذا تعذر إثبات انفراد السلطة، **fail closed** للمعاملات المشتركة.
- كل Commit يحمل `coordinator_epoch`, `commit_sequence`, توقيع/إثباتاً وإقراراً. لا نقبل إدخالاً قديماً يناقض تسلسلاً أحدث.
- دعم Windows powered-on كمنسق اختياري هو تحسين للموثوقية، وليس شرط بيع أو تشغيل.

## 5. حالات الاتصال (مصوفة تشغيل)

| العمل | جهاز غير متصل محلياً | متصل بلا منسق | منسق متاح |
|---|---|---|---|
| فتح مريض مخزن ومصرّح | نعم ضمن صلاحية/TTL | نعم | نعم |
| إدخال مسودة ملاحظة | نعم، Pending | نعم، Pending | نعم، Commit عند الاعتماد |
| تعديل سجل طبي معتمد | تصحيح Pending دون إلغاء الأصل | Pending | اعتماد تصحيح بمراجعة/نسخة |
| إنشاء موعد نهائي | طلب Pending فقط | Pending | يُقبل أو يرفض بسبب تعارض |
| قبض نهائي/فاتورة مرحّلة | إيصال مؤقت غير معتمد فقط إذا فعّل المالك السياسة | Pending | اعتماد idempotent |
| تغيير صلاحيات/ترخيص | لا (طلب مؤجل) | لا (طلب مؤجل) | بعد توقيع المالك وفحص revision |
| إضافة بيانات حساسة من جهاز استقبال | فقط الصلاحيات المعروفة والنطاق المحلي | نفس الشيء | نفس الشيء |
| نسخ احتياطي | snapshot محلي مع وصف حالة sync | نعم | النسخة المعتمدة + حالة commit |

**المبدأ:** لا يُعرض Pending مالياً أو سريرياً كأنه Committed. واجهة المستخدم تظهر الحالة والسبب وزر إعادة المزامنة.

## 6. نموذج تعدد العيادات

- كل إنشاء عيادة يملك clinic_id + master clinic recovery identity + encryption keys + license certificate.
- يجب ألا تتشارك مفاتيح قواعد بين عيادتين أو بين جهازين دون غلاف مفاتيح منفصل.
- عند استخدام نفس الجهاز لعدة عيادات، لكل عيادة مساحة قاعدة/ملفات/سياق مستخدم مع Session isolation والتبديل بعد إغلاق جلسة سابقة.
- لا دمج سجلات مرضى بين مؤسستين تلقائياً؛ نقل ملفات بإذن وتصدير مُراجع.

## 7. تحديثات وموافقات الإصدار

- كل بناء يحمل `app_version, db_schema_version, sync_protocol_min/max, module_versions, license_format_version`.
- في Network handshake يقارن الطرفان النسخ قبل تبادل البيانات.
- Migrations تطبيقية وموثقة: `prepare -> backup -> migrate -> integrity check -> activate`.
- لا تنشيط schema أحدث مع Peer يكتب بنسخة أقدم غير متوافقة.
- تحديثات الموديولات/الشاشات لا تتطلب تغيير ملكية بيانات العيادة؛ الإصدارات القديمة للزيارات تحفظ schema_id/version.

## 8. ملفات المشروع المطلوبة

```text
clinic-platform/
  apps/clinic_app/                  Flutter Windows/Android
  packages/
    clinic_core/                   errors, ids, policies, domain
    clinic_database/               Drift schema, migrations, encrypted executor
    clinic_security/               crypto, identities, secure storage
    clinic_permissions/            policies, scoped access, enforcement
    clinic_licensing/              signed entitlement verifier
    clinic_network/                pairing, discovery, transport
    clinic_sync/                   outbox, inbox, coordinator, conflicts
    clinic_backup/                 snapshot, encrypted archive, Drive
    clinic_ui/                     theme, common widgets, accessibility
    clinic_smart_input/            forms, history, autocomplete
    clinic_printing/               PDF, printable templates
    patients/ appointments/ clinical_records/ dental_chart/
    billing/ inventory/ reports/ specialty_sdk/
  tools/license_issuer/            offline signer, PRIVATE KEY NEVER IN APP
  integration_tests/              Windows/Android/LAN fault injection
  docs/                            SRS and Architecture Decisions
```

## 9. قيود واقعية يجب عدم إخفائها

- Android قد يوقف الشبكة والخدمات عند إغلاق التطبيق/توفير الطاقة؛ لا ادعاء تزامن غير مشروط 24/7 على جهاز نائم.
- mDNS قد يفشل عند عزل العملاء أو اختلاف VLAN؛ يجب QR/manual fallback.
- لا ضمان إلغاء فوري لصلاحية جهاز غير متصل وكان لديه بيانات مخزنة؛ تقييد البيانات/TTL هو التعويض الأمني.
- اختبار استهلاك الذاكرة على أجهزة متوسطة السعر إلزامي؛ لا يُحمَّل كل جدول وكل أشعة دفعة واحدة.


---

<!-- SOURCE: docs/02_DATA_MODEL_AND_RULES.md -->

# 02 — نموذج البيانات والمخططات المنطقية وقواعد الاتساق

> **ليس DDL نهائياً**؛ هذه قائمة الجداول والقيود الإلزامية. على المنفذ إنتاج schema.sql/Drift migrations وERD قابل للفحص وقيود DB، وربط كل جدول بمتطلب SRS. يُمنع الاعتماد على JSON غير منضبط بدلاً من الجداول الجوهرية.

## 1. قواعد مشتركة

- كل كيان طبي/مالي يملك UUID عشوائي ثابت قابل للمزامنة، و`clinic_id`, `created_at_utc`, `updated_at_utc`, `created_by`, `origin_device_id`, `row_version`, `deleted_at_utc` عند السماح بالإلغاء المنطقي.
- الأوقات تخزن UTC مع `timezone_id` عند العرض/الحجز، لا تؤخذ منطقة نظام التشغيل كحقيقة دائمة.
- المال `amount_minor BIGINT` أو Decimal مضبوط `currency_code, scale`؛ **لا Floating Point**.
- التواريخ الطبية `event_at_utc`, `recorded_at_utc`, `effective_at_utc` وقد تختلف لأسباب مهنية؛ لا تغيير صامت.
- File IDs + checksum + storage pointer، وليس صوراً ضخمة في SQLite بلا سبب.
- `FK` حقيقية، `CHECK`, `UNIQUE`, indexes مناسبة، ومؤشر تعديل `row_version` لقفل متفائل.
- قيم الجنس منفصلة عن العمر/الأسنان اللبنية، والحساسية ثلاثية yes/no/unknown.
- DB مشفرة والمرفقات encrypted at rest؛ لا حذف فعلي لسجلات معتمدة إلا وفق سياسة retention وطلبات قانونية موثقة.

## 2. قوائم الجداول الأساسية

### A — Platform, Users, Access

| Table | Minimum fields / invariants |
|---|---|
| `clinics` | id PK, legal_name, display_name, timezone, default_currency, locale, status |
| `branches` | id, clinic_id FK, name, address, phone, status |
| `clinic_settings` | clinic_id, key, typed_value, version, updated_by, audit_ref |
| `practitioners` | id, clinic_id, display_name, specialty_id, license_number?, is_active |
| `users` | id, clinic_id, login_identifier, name, password_hash, status, person_practitioner_id? |
| `roles` | id, clinic_id nullable for system templates, code, display_name |
| `permissions` | code PK, module_code, resource, action, possible_scope |
| `role_permissions` | role_id, permission_code, scope_constraint_json, effect, version |
| `user_roles` | user_id, role_id, valid_from, valid_to |
| `user_permissions` | user_id, permission_code, effect, scope_constraint_json, version |
| `device_registry` | id, clinic_id, public_key, fingerprint, platform, status, last_seen, join_approved_by, joined_at |
| `device_permissions` | device_id, permission_code, effect, field_scope, version |
| `access_policies` | id, clinic_id, rules, version, signer_id, signature, effective_from |
| `sessions` | id, user_id, device_id, issued_at, expires_at, policy_version, revoked_at |
| `permission_audit` | id, actor, device, action, policy_before_hash, after_hash, reason, at, signature |
| `device_revocations` | device_id, revoked_at, policy_version, approved_by, reason, signature |

### B — Licensing / ownership

| Table | Minimum fields / invariants |
|---|---|
| `clinic_owners` | clinic_id, owner_user_id, active_owner_key_id, recovery_policy, revision |
| `license_certificates` | license_id, clinic_id, signed_payload, signature, issuer_key_id, revision, issued_at |
| `license_features` | license_revision, module_code, entitlement_value |
| `license_devices` | license_id, device_id, activation_cert, status, activated_at, transferred_at |
| `license_audit` | id, license_revision, action, device_id, at, issuer_reference |

### C — Core clinical

| Table | Minimum fields / invariants |
|---|---|
| `patients` | id, clinic_id, medical_record_number UNIQUE-per-clinic, legal_name, latin_name?, dob?, approx_age?, sex_code, contact_preference, status |
| `patient_contacts` | id, patient_id, kind, phone/email, priority, is_primary |
| `patient_addresses` | id, patient_id, address_lines, city, country |
| `patient_relations` | patient_id, related_person_id, relationship, guardian_flag, consent_scope |
| `patient_allergies` | id, patient_id, substance, reaction, severity?, status(yes/no/unknown), recorded_by, reviewed_at |
| `patient_conditions` | id, patient_id, coded_condition, status, source, onset, note |
| `patient_medications` | id, patient_id, drug_ref/text, dose?, frequency?, start/end, reviewed_at |
| `patient_medical_history` | id, patient_id, risk_note, surgical_history, version, recorded_by |
| `appointments` | id, patient_id, doctor_id, branch_id, start_utc, end_utc, room_id, chair_id?, status, coordinator_commit? |
| `appointment_resources` | appointment_id, resource_id, resource_kind, reserved_range |
| `clinic_resources` | id, branch_id, type(room/chair/equipment), display_name, capacity, active |
| `work_schedules` | id, practitioner_id, weekdays, local_hours, effective_dates, exception_rules |
| `waiting_queue` | id, appointment_id, arrived_at, urgency, status, called_at, entered_at |
| `encounters` | id, patient_id, practitioner_id, appointment_id nullable, start/end, reason, status, signed_by?, signed_at? |
| `clinical_notes` | id, encounter_id, author_id, schema_version, content_structured, text_note, status, signed_version, correction_of_id? |
| `observations` | id, encounter_id, code, measured_value, unit, interpretation?, recorded_at |
| `diagnoses` | id, encounter_id, concept_code/text, certainty, status, on_tooth_id?, source |
| `treatment_plans` | id, patient_id, owner_practitioner_id, status, estimate_currency, approved_at? |
| `treatment_plan_items` | id, plan_id, procedure_catalog_id, teeth_links, status, planned_at, price_snapshot |
| `procedures` | id, encounter_id, plan_item_id?, procedure_code, performer, performed_at?, status, price_snapshot |
| `prescriptions` | id, encounter_id, issue_date, prescriber, status, signed_at, file_ref |
| `prescription_items` | prescription_id, medication, strength, dose, route, frequency, duration, instructions |
| `patient_consents` | id, patient_id, encounter_id?, template_version, scope, signer_role, signed_at, signature_ref, withdrawn_at? |
| `referrals` | id, patient_id, from/to, reason, status, attached_document_id? |
| `medical_record_amendments` | id, entity_type, entity_id, original_version, amended_version, reason, actor, at, signature |

### D — Dental

| Table | Minimum fields / invariants |
|---|---|
| `dental_dentitions` | id, patient_id, stage(primary/permanent/mixed), effective_at, chart_version |
| `dental_teeth` | id, patient_id, fdi_code, dentition_type, episode_id?; UNIQUE(patient_id, fdi_code, dentition_type, episode_id?) |
| `dental_tooth_surfaces` | id, tooth_id, surface_code, current_projection_state (derived cache only) |
| `dental_findings` | id, patient_id, tooth_id, surface_code?, finding_code, severity?, status, observed_at, encounter_id, recorder_id |
| `dental_procedure_teeth` | procedure_id, tooth_id, surface_code nullable; permits many-to-many |
| `dental_tooth_events` | id, tooth_id, event_type, effective_at, source_record_id, supersedes_event_id? |
| `dental_chart_snapshots` | id, patient_id, as_of, projection_version, source_cutoff, cached_payload; never sole source of truth |
| `periodontal_assessments` | id, patient_id, encounter_id, performed_at, clinician_id |
| `periodontal_measurements` | assessment_id, tooth_id, site_code, probing_depth_mm?, recession_mm?, bleeding?, plaque?, mobility? |
| `dental_lab_orders` | id, patient_id, encounter_id, provider_id, lab_name, material, shade?, due_at, status |

### E — Finance / Inventory / Operational

| Table | Minimum fields / invariants |
|---|---|
| `service_catalog` | id, code, name, specialty_id, active, default_duration, type |
| `price_lists` | id, branch_id?, currency, version, effective_date |
| `service_prices` | price_list_id, service_id, amount_minor, tax_rule_id?, valid_from |
| `invoices` | id, patient_id, invoice_no scoped per clinic/period, status, currency, subtotal_minor, discount_minor, tax_minor, total_minor, issued_at |
| `invoice_lines` | id, invoice_id, procedure_id?, service_id, description, qty_decimal, unit_minor, discount_minor, tax_minor, total_minor |
| `payments` | id, patient_id, amount_minor, currency, method, paid_at, coordinator_commit, idempotency_key UNIQUE, status |
| `payment_allocations` | payment_id, invoice_id, applied_minor |
| `refunds_and_adjustments` | id, original_doc_id, reason, amount_minor, approved_by, idempotency_key |
| `cash_sessions` | id, cashier_id, opening_minor, closing_minor?, status |
| `doctor_commissions` | id, practitioner_id, procedure_id, rule_version, amount_minor, status |
| `warehouses` | id, branch_id, display_name, active |
| `inventory_items` | id, name, unit, batch_tracking, expiry_tracking, minimum_qty |
| `inventory_batches` | id, item_id, lot, expires_on, received_qty |
| `stock_movements` | id, item_id, warehouse_id, qty_decimal, movement_type, original_document_id, at, actor |

### F — Documents/Forms/Smart input

| Table | Minimum fields / invariants |
|---|---|
| `attachments` | id, clinic_id, owner_type/id, mime, original_filename, encrypted_storage_ref, sha256, size_bytes, created_by, at |
| `attachment_versions` | attachment_id, version, checksum, original_flag, encryption_meta |
| `document_templates` | id, clinic_id, type, locale, version, content_ref, active |
| `field_definitions` | field_id, module_id, field_type, code, label, validation_spec, sensitivity_class, version |
| `field_options` | field_id, option_code, display_ar, display_en, order_index, active, coded_catalog_ref? |
| `form_definitions` | id, module_id, revision, layout_schema, rules, published_at |
| `form_submissions` | id, form_id, revision, encounter_id, values, status, signed_at, author_id |
| `user_input_preferences` | user_id, field_id, option_code, pinned, priority, last_used_at, count (no PHI in ranking) |
| `text_snippets` | id, owner_scope, owner_id, trigger, content_template, sensitivity, version |
| `search_fts` | indexes patient search text; no unnecessary PHI on restricted peers |

### G — LAN sync / Operations / Backup

| Table | Minimum fields / invariants |
|---|---|
| `outbox_operations` | op_id PK, clinic_id, actor_id, device_id, aggregate_id, payload, schema_version, policy_version, signature, state, created_at |
| `inbox_operations` | op_id PK (dedupe), received_at, validated_at, applied_at, rejection_reason? |
| `sync_peer_state` | device_id, last_ack_sequence, epoch, policy_version, schema_version, last_seen |
| `sync_commits` | epoch, sequence UNIQUE, op_id UNIQUE, committed_by, commit_hash, created_at |
| `sync_conflicts` | id, record_id, local_op_id, remote_op_id, conflict_type, resolution_status, resolved_by, at |
| `sync_leases` | clinic_id, coordinator_device_id, epoch, expires_at, quorum_evidence |
| `media_transfer_chunks` | transfer_id, attachment_id, chunk_no, chunk_sha256, status |
| `audit_events` | id, clinic_id, actor, device, action, entity_ref, at, correlation_id, signed_chain_ref |
| `backup_runs` | id, clinic_id, trigger, source_checkpoint, file_ref, format_version, status, verified_at, size_bytes |
| `backup_destinations` | id, clinic_id, provider(local/drive), display_name, encrypted_token_ref?, retention_policy |
| `restore_runs` | id, clinic_id, archive_hash, started/completed_at, validation_results, actor, status |
| `schema_migrations` | version, checksum, applied_at, result |

## 3. قواعد تخزين حساسة

1. **لا** ترسل كامل `patient_medical_history` أو `clinical_notes` إلى Peer الاستقبال دون صلاحية حقيقية، حتى لو كانت واجهته تخفيها.
2. الإلغاء المسموح لسجل معتمد عبر status/reversal/amendment، وليس DELETE العادي.
3. كل Payment مربوط idempotency key وقيد coordinator commit، وكل تعديل أسعار يعتمد snapshot لا قيمة الكتالوج الحالية.
4. المخطط السني عرض مشتق من أحداث مدققة، يدعم استرجاع حالة تاريخية بدون تغيير الحدث الأصلي.
5. Recovery archive يجب أن يحفظ `schema_version` و`sync_checkpoint` وصلة المرفقات وقواعد الاستعادة.
6. أرقام الملفات الطبية والفواتير تنشأ وفق منسق أو Reservation range موثقة لمنع تصادم بين الأجهزة.
7. تقييد جداول الرسوم والمرفقات بالعيادة والمستخدم والجهاز، مع ترشيح الصلاحيات في طبقة الإرسال.
8. جداول `JSON` المسموحة للحقول القابلة للتمدد فقط؛ علاقات أسنان/إجراءات/مبالغ/حقوق مهمة تكون جداول منظمة.
9. **لا** تخزين refresh tokens أو recovery seed كنص صريح داخل SQLite، حتى وإن كانت مشفرة؛ تستخدم secret store وآلية enveloping.
10. كل عنصر نسخ/استعادة/استيراد ينفذ حجماً أقصى وchecksums لمنع Zip bomb أو file traversal.

## 4. فهارس أساسية مقترحة

`patients(clinic_id, medical_record_number)` UNIQUE؛ `patients(clinic_id, normalized_search_name)`؛ `patient_contacts(patient_id, is_primary)`؛ `appointments(practitioner_id, start_utc, end_utc, status)`؛ `encounters(patient_id, start_utc DESC)`؛ `dental_findings(tooth_id, observed_at DESC)`؛ `invoice_lines(invoice_id)`؛ `payments(idempotency_key)` UNIQUE؛ `outbox_operations(state, created_at)`؛ `inbox_operations(op_id)` UNIQUE؛ `sync_commits(epoch,sequence)` UNIQUE؛ `audit_events(entity_ref, at DESC)`.

## 5. سير الترحيل

- إصدار Drift schema snapshot قابل للاسترجاع واختبارات migration-from-every-supported-version.
- قبل تعديل قاعدة: Snapshot مشفر + فحص مساحة كافية + قفل ترحيل + migration transactional حيث يدعم النظام، ثم foreign key/integrity check.
- إن فشل الترحيل: لا تشغّل التطبيق على قاعدة نصف مُرحّلة، قدم recovery آمن دون محو.
- لا تُسقط أعمدة أو جداول تحتوي بيانات مستخدم حقيقية دون آلية backfill والتحقق ونافذة توافق peer.


---

<!-- SOURCE: docs/03_SYNC_PROTOCOL.md -->

# 03 — بروتوكول LAN Sync وملحق الاعتماد والتعارض

## 1. النطاق والهدف

هذا بروتوكول تطبيق مخصص؛ **ليس** استنساخاً لسجلات SQLite ولا shared database ولا مجرد بث WebSocket. يجب أن يضمن عدم فقد صامت، عدم مضاعفة المعاملة المالية، عدم تزوير جهاز أو سياسة، عدم نقل بيانات لا يحق للمتلقي الاطلاع عليها، واستكمال العمل بعد الانقطاع.

## 2. الهوية والاقتران

1. عند إنشاء العيادة يُولد Clinic ID وهوية مالك ومفاتيح بيانات منفصلة؛ تحفظ المفاتيح في مخزن النظام الآمن حيث أمكن.
2. mDNS ينشر فقط `service_type`, `protocol_version`, `clinic_alias`, `ephemeral_endpoint` دون أسماء مرضى أو أسرار.
3. ينشئ العميل الجديد device key pair؛ يعرض QR يحوي public key وبصمة/رمز قصير مؤقت وnonce.
4. المالك يوافق على جهاز، دور، نطاق بيانات، seat/license، وتاريخ/أسباب الارتباط؛ يتم إنشاء Trust Certificate موقعة.
5. النقل يتم عبر TLS/تشفير مصادق وتوثيق طرفين مع ربط هوية الجهاز بالمفتاح العام وcertificate pinning أو بروتوكول مُراجع؛ اسم mDNS أو عنوان IP **ليس** ثقة.
6. أي اتصال مجهول أو إصبع بصمة خاطئ يُرفض قبل عرض بيانات.
7. آلية إعادة اقتران ونقل جهاز لا تستنسخ المفتاح الخاص من جهاز قديم ولا تفتح بيانات المريض لمجرد معرفة كلمة مرور المستخدم.

## 3. Envelope: قيود إلزامية

```json
{
  "protocol_version": 1,
  "message_type": "operation",
  "clinic_id": "uuid",
  "op_id": "uuid",
  "aggregate_type": "appointment",
  "aggregate_id": "uuid",
  "base_version": 12,
  "actor_user_id": "uuid",
  "origin_device_id": "uuid",
  "policy_version": 9,
  "schema_version": 3,
  "created_at_utc": "2026-11-07T00:00:00Z",
  "coordinator_epoch": 20,
  "payload_cipher_or_structured": "typed payload",
  "prev_commit_hash": "digest",
  "signature": "detached authenticated signature"
}
```

هذا مثال شكل فقط؛ يجب تحديد Canonical Serialization قبل توقيع payload؛ لا توقّع JSON حر قابل لتغيير ترتيب الحقول. يجب توثيق حجم الرسالة والنسخة والتحقق من schema قبل فكها. مفاتيح الأجهزة لا يُسمح باستخدامها خارج مجالها المصرح.

## 4. آلة حالات العملية

`CreatedLocal -> OutboxQueued -> Sent -> Received -> Validated -> Committed -> Applied -> Acked`

أو `Rejected / Conflict / NeedsCoordinator / ExpiredPolicy / Quarantined`.

**قاعدة ACID:** كتابة سجل Domain وOutbox داخل معاملة SQLite واحدة؛ وبعد الاستقبال، إضافة Inbox وApply وAck مع الحفاظ على idempotency في المعاملة المناسبة. التكرار المقصود بسبب الشبكة **لا** يُنتج أثرين.

## 5. أنواع العمليات وقواعد الاعتماد

| Aggregate | Local pending | Commit rule | Conflict resolution |
|---|---|---|---|
| User preferences | نعم | محلي + مشاركة اختيارية | آخر نسخة داخل نفس المستخدم وفق vector/version |
| Clinical draft | نعم | إنشاء مستقل مؤرخ | إذا ملاحظتان فاحتفظ بهما، لا تمحُ إحداهما |
| Signed clinical note | Amendment pending | موافقة مسجل/توقيع إصدار | لا Last-write-wins؛ Correction record |
| Appointment booking | نعم، غير نهائي | منسق يتحقق من تداخل الطبيب/الغرفة/الكرسي | رفض أو اقتراح موعد آخر |
| Payment | Pending غير نهائي | منسق + idempotency key + authoritative sequence | reject duplicate أو reconcile |
| Invoice finalization | Pending | منسق، رقم إصدار موحد، عدم تعديل صامت | إلغاء/تعديل مستندي |
| Role/permission policy | لا اعتماد Offline | توقيع مالك + revision أعلى + trusted coordinator | reject older version |
| Device/license seats | طلب اقتران فقط | موافقة المالك + تحقق شهادة الترخيص | reject if limit exceeded |
| Attachment | محلي + queue | ينقل chunks وفق ACL وبصمات | retry missing chunks, dedupe hash |

## 6. منسق دون خادم منفصل

- يحوي تطبيق كل جهاز حزمة Coordinator Service اختيارية.
- اختيار جهاز مفضل يقرره الطبيب، ويمكن Windows ثابت العمل ليكون المفضل.
- لا يعني «ربط جهازين» تلقائياً وجود ضمان خطي (linearizability) عند فقدان الشبكة؛ العمليات الحرجة تستخدم coordinator term/epoch and fencing token.
- Failover آلي **مسموح فقط** إذا توافر بروتوكول انتخاب موثوق يمنع split brain في cluster المعروف، وإلا تبقى العمليات الحساسة Pending حتى عودة الجهاز المفضل أو اعتماد إعادة انتخاب يدوي موثوق.
- لا تنفذ عملية دفع «نهائية» على جهازين مفصولين ثم يتم دمجها عشوائياً؛ هذه تجربة قبول فشل صريحة.
- في مرحلة أولى، يوصى بتعيين منسق واحد واضح/بديل يدوي مع التحقق من عدم وجود المنسق القديم؛ ذلك أبسط وأأمن من انتخاب غير مكتمل.

## 7. إدارة التغييرات والنسخ

- لكل Aggregate `row_version`، لكل Peer checkpoint، ولـCoordinator `epoch + sequence`.
- تزامن Delta وليس reload شامل؛ يدعم Catch-Up بعد أسابيع، مع Pagination/Batch Size/Backpressure.
- قبل إرسال معلومات حساسة: `Authorize(actor? receiving device/user context, record, fields, purpose)`؛ لا يُرسَل ما لا يجوز تخزينه.
- إبطال السياسة الأعلى يحجب نقل/فتح معلومات، ويصدر إجراءات تنظيف مخازن مشتقة على الجهاز حين يصل؛ البيانات الخارجة من جهاز سابق غير متصل لا يمكن سحبها مادياً.
- بروتوكول مصادقة handshake يتأكد من `min/max protocol`، `db_schema`, `clinic_id`, `license_revision`, `policy_version`.
- استعادة backup قديمة تخضع لفحص anti-rollback في policy/license وتحقق تفرد قاعدة سجل الالتزام؛ لا تستبدل قاعدة جديدة صامتاً.

## 8. نقل الأشعة والمرفقات

- File encryption عند التخزين، وChunked streaming عند النقل، مع per-chunk hash وfile SHA256 نهائي.
- لا عرض حجم الملف كله في RAM؛ chunk sizes يحددها اختبار الأداء (مثل 256KiB–1MiB كنقطة اختبار لا كالتزام نهائي).
- حالة نقل `queued/transferring/paused/verified/failed` مع progress.
- Prioritization: أحداث حجز/صلاحيات صغيرة قبل ملفات الأشعة الضخمة.
- التحميل الجزئي: metadata أولاً وthumbnail فقط للأجهزة المرخصة، والمحتوى الكامل بطلب مصرح عند الحاجة وفق سياسة offline caching.

## 9. سياسة الفشل والاستئناف

| الفشل | السلوك الإجباري |
|---|---|
| فقد Wi-Fi | استمرار قراءة المصرح به محلياً ومسودات Pending، حالة Offline ظاهرة |
| تطبيق توقف فجأة | Recovery من Outbox/Inbox/WAL دون تكرار العملية |
| جهاز يحمل ساعة خاطئة | لا يجعل UTC المحلي أساس تسلسل المعاملة؛ يستخدم commit sequence وإشعار فرق الوقت |
| جهاز قديم | compatibility gate قبل Sync، Read-only عند الحاجة |
| وصول عملية من جهاز ملغى | reject + audit، ولو كانت op id جديدة |
| إعادة إرسال قديمة | dedupe/op_id + epoch fencing + no downgrade |
| تعارض سريري | سجل Conflict واضح وتدخل مخوّل قبل اعتماد الحل |
| خطأ مرفق | إعادة طلب chunks وتحقق hash، وعدم إظهار ملف ناقص كأصل |
| فصل شبكة إلى مجموعتين | لا commit مالي مزدوج ولا حجز نهائي متضارب |

## 10. Observability آمنة

قياس latency P50/P95/P99، retries، حجم Outbox، عدد conflicts، آخر checkpoint، version skew، انتقالات coordinator، عدد rejected ops، مع `correlation_id`. يمنع تسجيل محتوى PHI في Logs العامة. صلاحية الاطلاع على سجل مزامنة التفاصيل الإدارية للمالك/الدعم بموافقة.

## 11. اختبار عقد البروتوكول

- `SYNC-001` قران أجهزة Android↔Windows مع PINning والتحقق من QR.
- `SYNC-002` بث 1000 عملية مع إعادة/ترتيب/فقد رسائل؛ نتيجة واحدة لكل `op_id`.
- `SYNC-003` فصل الجهازين وقت حجز نفس الكرسي ثم إعادة الاتصال؛ عقد نهائي واحد، الآخر تعارض.
- `SYNC-004` اختبار الدفع المكرر بين نسختين، وتوقف المنسق فور الاستلام وقبل ACK؛ لا مضاعفة.
- `SYNC-005` إلغاء صلاحية طبيب/سكرتيرة ثم إرسال عملية من جهاز بPolicy قديم؛ تُرفض.
- `SYNC-006` محاولة جهاز مجهول مسح/إرسال/سحب ملفات؛ ترفض كل العملية.
- `SYNC-007` نقل مرفق كبير، فصل وإعادة اتصال، checksum مطابق.
- `SYNC-008` انهيار جهاز مالك واستعادة policy وtrust دون قبول admin forging.
- `SYNC-009` إعادة نسخة قديمة على جهاز ثالث ومحاولة sync؛ anti-rollback/dedup يعمل.
- `SYNC-010` Android background kill لا ينتج فقد صامت، ولا وعد بمزامنة فورية حتى يعود التطبيق.


---

<!-- SOURCE: docs/04_SECURITY_PERMISSIONS_LICENSING.md -->

# 04 — الأمن، الصلاحيات، التراخيص التجارية

## 1. الأصول الحساسة والتهديدات

الأصول: PHI/PII، الصور، المفاتيح، رخصة العيادة، هوية المالك، صلاحيات، سجل الدفعات، سجلات التدقيق، نسخ الاستعادة. خصوم: جهاز مسروق، سكرتير فضولي/خبيث، جهاز Wi-Fi دخيل، نسخة APK معدلة، عميل يحاول مضاعفة عدد الأجهزة، ملف backup مسرب، إدخال USB ضار، Device rollback، تلف تخزين، حساب Google مخترق.

**مرجع ضبط:** OWASP MASVS للموبايل وASVS للواجهة المحلية المدمجة، مع مراجعة امتثال القانون الصحي بحسب البلد قبل بيع النظام. لا تدّعِ امتثالاً تنظيمياً بمجرد تبني المراجع.

## 2. منع الوصول من عميل غير مصرح

- Permission ID بالصيغة `module.resource.action`، مع `scope`: clinic, branch, doctor-owned, assigned-patient, specific record, field allowlist.
- deny-by-default؛ إذا اجتمعت صلاحية سماح ومنع مخصص فـexplicit deny wins؛ أدوار جاهزة مجرد قوالب قابلة للتخصيص.
- **فصل** سياسة المستخدم عن Device capabilities وعن data-sharing scope؛ effective permissions = intersection ثم policy exceptions المسموح بها.
- لا يعد UI hiding ضماناً؛ SQL DAO وخدمة الانضمام والنقل والملفات والطباعة والتصدير تتحقق من التفويض.
- حقوق الطبيب المالك لا تستلزم الاطلاع التلقائي على أسرار حساب Google لموظف آخر، ولا مفتاح أداة إصدار الرخص.

### 2.1 مصفوفة أدوار افتراضية — قابلة للتعديل من المالك

| وظيفة | Owner | Doctor | Reception 1 | Reception 2 | Accountant |
|---|---|---|---|---|---|
| مرضى: بيانات الاتصال | ALL | Assigned/ALL وفق سياسة | RWC | RWC | R حسب حاجة التحصيل |
| تاريخ طبي/أشعة | ALL | Assigned | DENY | DENY | DENY |
| تقويم المواعيد | ALL | Assigned | RWC | RWC | R عند الحاجة |
| تسجيل علاج | ALL | Assigned | DENY | DENY | DENY |
| إنشاء فاتورة | ALL | Assigned/Allowed | RW حسب التفويض | DENY | RW |
| سند قبض | ALL | Allowed | RC حسب التفويض | DENY | RWC |
| أرباح عمولات وتقارير | ALL | حسب الملكية | DENY | DENY | حسب التفويض |
| الصلاحيات والأجهزة | ALL | DENY | DENY | DENY | DENY |
| Google Drive backup/restore | ALL | DENY | DENY | DENY | DENY |
| تراخيص تجارية | عرض/تفعيل ضمن الرخصة | DENY | DENY | DENY | DENY |

`R=read W=write C=create ALL=مخولة كاملة DENY=منع`. البيانات والفروع المقيدة تتطلب policy engine وليس تنفيذ SQL قد يتجاوز النطاق.

## 3. تعديل صلاحيات لحظي

1. الطبيب مالك/مندوب صريح يعيد مصادقة عالية الثقة عند تغيير سياسات حساسة.
2. UI يرسل `PermissionPolicyChange` موقعة مع سبب وrevision أعلى للمنسق الموثوق؛ تحفظ وتبث للأجهزة المسموح بها.
3. الأجهزة المتصلة تبطل الجلسات/كاش البيانات وتحجب الواجهات المتأثرة فور وصول وتطبيق السياسة، وتقر `ack`.
4. غير المتصلة لا يمكن سحب بياناتها القديمة؛ نحدد Offline TTL قصير للبيانات الحساسة، وتشفير at-rest، وتقليل replicated dataset.
5. سجل تدقيق غير قابل للمحو الصامت يظهر من غيّر صلاحية من ومتى وعلى أي جهاز.

## 4. حسابات المستخدمين

- كلمات مرور باستخدام Argon2id أو خوارزمية قوية مُراجعة مع salts فريدة ومعاملات معايرة على الأجهزة الفعلية.
- قفل بعد محاولات فاشلة ومراقبة إساءة الاستخدام، وخيار إعادة مصادقة حساسة وبصمة عند دعم النظام.
- Role assignment وليست مشاركة كلمة مرور الطبيب مع السكرتيرة.
- Session TTL/renewal وقفل عند عدم النشاط؛ تغيير مستخدم على جهاز مشترك يمسح شاشة/كاش مستخدم سابق.
- أرقام الطوارئ/مرضى وبيانات حساسة في logs ممنوعة.

## 5. مفاتيح الأجهزة والعيادة

- per-device asymmetric keys في Android Keystore/Windows CNG TPM عند دعم العتاد؛ فحص capabilities.
- عند غياب Hardware-backed ضمان: تسجيل مستوى الحماية وتقليل قدرات Offline أو إلزام إعادة اعتماد وفق سياسة، لا الادعاء بحماية متكافئة.
- Clinic data keys منفصلة عن signing/identity keys وbackup keys وlicense issuer signing keys.
- **مفتاح إصدار الرخص التجاري الخاص** يبقى فقط بأداة خارج التطبيق في بيئة حماية/توقيع؛ التطبيق يحتوي public verification key.
- الاحتفاظ بـRecovery Kit محمية خارج الأجهزة؛ اختبار نقل هوية Owner دون عمل «backdoor» مطور.

## 6. ترخيص منتج قابل للترقية دون فقد بيانات

### 6.1 Payload الترخيص

```json
{
  "format": 1,
  "license_id": "uuid",
  "clinic_id": "uuid",
  "revision": 4,
  "plan": "dental_clinic",
  "max_active_users": 3,
  "max_registered_devices": 3,
  "max_doctors": 1,
  "enabled_modules": ["core", "dental", "billing"],
  "valid_from": "2026-11-07",
  "valid_until": null,
  "issuer_key_id": "key-id",
  "signed_claims": "signature over canonical bytes"
}
```

- لا تخزّن حداً ثابتاً داخل الكود للأطباء/المحاسبين؛ العدد من certificate + local consumption ledger.
- تعداد المستخدمين **النشطين** يختلف عن الأجهزة **المسجلة** والأطباء **النشطين**؛ يجب تعريف متى يُحرر المقعد عند الإيقاف.
- إضافة محاسب: Request Upgrade → license revision signed → Install → validate issuer and clinic → update entitlements → create restricted account → optional new device pairing. `patients` و`clinical_*` لا تتغير.
- Upgrade ترفض رخصة revision أقل أو license clinic غير مطابقة. عدم القدرة على تواصل Online يعني لا يمكن ضمان منع كل نوع من ترخيص مقلد/ساعة معيبة/تلاعب جهاز؛ نستخدم defense in depth وفحص دورات التفعيل.
- إذا انتهى الترخيص، يتيح Safe Records Access/Export/Restore policy دون إتلاف PHI أو محاسبة منشأة.
- Transfer seat بعملية معتمدة، تُبطل هوية الجهاز القديم عند عودته Online؛ تبقى ثغرة نافذة Offline موثقة.

## 7. تصنيف البيانات والسجلات

- `Public` أسماء وحدات/مكتبات؛ `Internal` تشغيل/مؤشرات؛ `Sensitive` معلومات مالية خاصة؛ `Clinical PHI` بيانات حساسة.
- أي analytics افتراضي محلي، وTelemetry خارجي opt-in وبأحداث مجردة لا تحتوي PHI أو أسماء مرضى.
- Audit events سلسلة تتبع مع منع حذف صامت وحماية ضد التلاعب (hash chaining / signed checkpoints)، وليس log قابل للتعديل من السكرتيرة.
- تصدير أو طباعة PHI يتطلب permission مخصص وسجلاً سبب/وقت/جهة؛ إخفاء حقول حسب الدور.
- Support mode لا يفتح ملف عيادة عن بعد دون تصريح مؤقت مرئي ومسجل؛ لا «admin كلمة مرور سرية».

## 8. أمان التخزين والاتصال

- `sqlite3mc` مع Drift NativeDatabase، مفتاح قبل أي Query، تحقق Runtime أن محرك التشفير متاح، Fail-Closed إذا غير متاح.
- الملفات encrypt-at-rest؛ تخزين thumbnails حساس مثل الأصل.
- قناة شبكة مصادقة للطرفين، تشفير، nonce، freshness، replay detection، rate limits، size limits.
- فحص كل مدخل واستيراد ملفات DICOM/PDF/Excel ضد malicious payload/path traversal/zip bombs.
- منع نسخ/فتح PHI من شاشة غير مصرح على مستوى app service. Android screenshots prevention للحقول شديدة الحساسية حسب سياسة وليس كضمان مطلق.

## 9. اختبارات أساسية

`SEC-001` استقبال يحاول استدعاء قراءة clinical_notes مباشرة فترفض؛ `SEC-002` سرقة SQLite أو attachments لا تظهر plaintext؛ `SEC-003` جهاز Peer مجهول يفشل handshake؛ `SEC-004` replay Policy أقدم لا يوسع الصلاحية؛ `SEC-005` نسخة APK على جهاز جديد لا تحمل الترخيص وحدها؛ `SEC-006` فقد device owner وتفعيل Recovery Kit؛ `SEC-007` رخصة clinic A لا تعمل مع clinic B؛ `SEC-008` نسخ احتياطية لا تُفتح بلا مفتاح؛ `SEC-009` إيقاف مستخدم/جهاز وتحقق TTL أثناء Offline؛ `SEC-010` لا PHI في logs.


---

<!-- SOURCE: docs/05_BACKUP_DRIVE_RECOVERY.md -->

# 05 — النسخ الاحتياطي والتشفير وGoogle Drive والاستعادة

## 1. القواعد الحاكمة

- **كل نسخة** تشمل يدوي/تلقائي/قبل تحديث/قبل Migration تُضغط وتُشفر **قبل مغادرة جهاز النسخ**.
- نسخ قاعدة البيانات النشطة لا يتم عبر Copy-Paste لملف `.db`؛ استخدم SQLite Online Backup API أو snapshot متسق ومثبت عبر اختبار.
- المرفقات والصور يتم تجميد مرجع نسختها باستخدام content-addressed/immutable manifest، بحيث تتوافق مع نقطة Snapshot DB.
- ملفات النسخ غير قابلة للفك ببرنامج ZIP عادي، ومعلومات metadata الظاهرة قليلة وغير سريرية.
- كلمة المرور وحدها لا تستخدم كمفتاح AES مباشرة؛ مفتاح عشوائي للبيانات وWrap بمفتاح مشتق من Recovery Phrase عبر Argon2id أو آلية قوية موثقة.
- Google Drive ليس بديلاً عن نسخة محلية وقرص مستقل؛ يجب اختبار الاستعادة بصورة دورية.

## 2. تنسيق Clinic Backup Archive (CBA v1)

```text
[Magic: CLINICBAK] [FormatVersion] [PublicHeader]
[Encrypted Stream Header (salt, KDF params, keywrap metadata)]
[AEAD Encrypted Chunk 00001]
[AEAD Encrypted Chunk 00002] ...
[Authenticated Final Manifest / Integrity Summary]
```

`PublicHeader` لا يحتوي مرضى أو أسماء ملفات حساسة. `Encrypted Manifest` يحتوي:

```text
clinic_id, snapshot_id, created_at_utc, app/db/schema/protocol versions,
coordinator_epoch + commit_sequence + pending_outbox_count,
DB snapshot file + SHA256, attachments[] + content hashes,
license-independent owner recovery context, format_version,
backup_type(full/incremental), parent_snapshot_id if incremental,
archive_validation_results, encryption parameters
```

**لا** ننفذ AES-GCM بحزمة واحدة عملاقة أو نكرر nonce. نستخدم AEAD record framing أو تنسيق محكم بحقول `chunk_counter`, `unique nonce`, `AAD(header hash + chunk index + snapshot_id)`؛ توقيع ومراجعة التصميم التشفيري قبل بيانات حقيقية. تجنب ابتكار خوارزمية تشفير؛ ابتكارنا في framing/integrity والتحقق فقط اعتماداً على primitives معروفة.

## 3. Pipeline النسخ

1. `Preflight`: كفاية مساحة، مفتاح الاستعادة متاح، User permission، عدم وجود restore/migration، صحة DB.
2. `Quiescent View`: Snapshot من SQLite مع `checkpoint`, policy revision, outbox counts.
3. `Attachment Manifest`: جمع معرفات/نسخ الملفات المرتبطة بSnapshot، ثم قفل مرجعي/retention حتى نهاية العملية.
4. `Consistency`: integrity_check وforeign_key_check وخريطة وجود الملفات.
5. `Stream Compression`: Zstd على chunks أو tar-like container، تجنب تحميل الكل في RAM، واحتفظ بالملف الأصل دون ضغط فقدي.
6. `Stream Encryption`: مفتاح عشوائي + nonces فريدة وAEAD مع authenticated header.
7. `Write temp`: كتابة إلى ملف مؤقت مع flush/fsync ثم rename ذري حيث تدعم المنصة.
8. `Verify`: إعادة فتح header، فحص tag/manifest/hash بتيار مستقل، ويفضل اختبار restore-to-temp دورياً.
9. `Publish`: نسخة محلية في مجلد مملوك للعيادة، ثم إن اختار الطبيب Google Drive يبدأ رفع resumable.
10. `Remote verification`: تأكيد نجاح الرفع ومعلومات الحجم + تنزيل عينات/اختبار فك لاحقاً، وعدم حذف آخر نسخة سليمة.
11. `Retention`: سياسة عدد نسخ/أيام + weekly/monthly snapshots، لا حذف قبل وجود مجموعة مستقلة صالحة.

## 4. RPO / RTO / schedule

| Deployment | Default schedule | RPO target | RTO test target |
|---|---|---|---|
| Solo Android | يومي عند توفر runtime/Power/WiFi، مع تحذير عند فوات نسخة | حتى آخر نسخة متحققة + تغييرات محلية غير مزامنة | يتحدد حسب حجم العيادة؛ اختبار 5GB |
| LAN with Windows preferred | نسخ يومي آلي ومتابعة آخر Backup | تقييد المخاطر بين النسخ بتكرار معلوم | اختبار استعادة عيادة 20k patient و5GB media |
| Cloud optional | حسب جدولة سياسة المالك | RPO/RTO تعاقدي في الخدمة المدفوعة | مراقبة الخدمة والأعطال |

أهداف RTO أرقام قبول محددة فقط بعد قياس الأجهزة وسرعة اتصال العيادة؛ لا تعد المستخدم باستعادة فورية عند 100GB أشعة.

## 5. Google Drive

- مزوّد التخزين مستقل `BackupProvider` interface: `Local`, `GoogleDrive`, future `S3/WebDAV` بعد مراجعة الأمن.
- على Android مصادقة Google رسمية مناسبة للمنصة؛ وعلى Windows OAuth installed app via system browser + PKCE + loopback redirect؛ **لا** embedded webview للحصول على كلمة مرور.
- النطاق الافتراضي `https://www.googleapis.com/auth/drive.file` عند توافق تجربة إنشاء الملفات/إعادة قراءتها، وليس `drive` كامل الصلاحيات.
- حساب Google للعيادة متصل فقط بجهاز النسخ المخول؛ access/refresh tokens في secure store، لا في DB plaintext.
- رفع `resumable` مع checkpoint, chunk retries, exponential backoff مع حدود، عدم مشاركة Drive URL كترخيص أو هوية.
- ملفات Google Drive مخزنة مشفرة بالفعل على جهة العميل؛ لا تعتمد على تشفير Google وحده.
- بيانات الحساب Google لا تُعطى لمطور المنتج، وليس هناك وصول تلقائي للشركة إلى حساب الطبيب.
- UI يظهر آخر نجاح وفشل وسبب، الحجم، المدة، الوجهة، ومفتاح التحذير في حال لم تُنفذ نسخة منذ عدد أيام محدد.

## 6. الاستعادة الآمنة

1. على جهاز جديد: Install → Restore Existing Clinic → select local `.clinicbak` أو Drive account → Recover key.
2. التحقق من `magic`, archive size, format, signatures/tags, `clinic_id`, schema compatibility قبل أي تعديل لقاعدة قائمة.
3. فك التشفير والبناء في sandbox temp بقائمة سماح مسارات وفحص path traversal/zip bombs.
4. SQLite integrity/foreign keys، مقارنة manifest hashes وعدد المرفقات ونسخها.
5. عرض اسم العيادة والوقت ونقطة المزامنة وعدد المسودات وتحذير من استعادة Snapshot أقدم من البيانات التي لدى الأجهزة الأخرى.
6. إذا استعادة داخل عيادة نشطة: إيقاف writes المعتمدة أو تنفيذ Recover/Reseed بروتوكول محدد يمنع divergence؛ **ممنوع overwrite صامت**.
7. تهيئة مفاتيح جهاز جديد ورخصته منفصلة عن ملفات البيانات؛ Owner recovery authorized، Re-pairing للأجهزة.
8. اختبار فتح المرضى/العلاج والفواتير/الأشعة قبل اعتبار الاستعادة ناجحة.
9. سجل restore_run مع outcome، ونقل الملفات المؤقتة بأمان وتنظيفها بعد التحقق.

## 7. حالات الفشل المحكومة

| فشل | النتيجة |
|---|---|
| Drive quota/full | تبقى نسخة محلية، status=cloud_failed، تنبيه واضح |
| انقطاع الإنترنت | resumable upload يعاود من نقطة رفع، لا نسخة ناقصة معتمدة |
| فقد عبارة الاسترداد | لا باب خلفي، مسار Recovery Kit بديل إن أنشئ مسبقاً |
| خطأ فك التشفير | لا تعديل بيانات تشغيلية، رسالة واضحة وAudit |
| corrupt attachment | فشل verification مع إمكانية استعادة DB فقط بعد موافقة وبيان نقص واضح؛ لا يدعي اكتمالاً |
| تنشيط رخصة جديدة | منفصل عن restore؛ لا تنقل الهوية العتادية القديمة |
| نفاد مساحة أثناء الضغط | أوقف المهمة وأزل temp بحذر، وأبقِ الأصل والنسخ الصحيحة |
| جهاز مفقود وعليه بيانات قديمة | فرض re-pair وpolicy checks عند عودة اتصاله |

## 8. اختبارات القبول

- `BKP-001` إنشاء نسخة DB نشطة أثناء كتابة 1000 سجل: تماسك DB واستعادة سليمة.
- `BKP-002` نسختان لنفس العيادة لهما أرقام snapshots مختلفة، ولا تستبدل إحداهما الأخرى.
- `BKP-003` رفع Drive مع انقطاع 3 مرات: يستأنف ويطابق SHA256.
- `BKP-004` سرقة `.clinicbak` دون مفتاح: لا قراءة بيانات المرضى.
- `BKP-005` تغيير بايت واحد بالملف المشفر: كشف تلف AEAD قبل اعتماد الاستعادة.
- `BKP-006` تنزيل ملف Drive ثم استعادة على Windows/Android ضمن خطة توافق الإصدارات.
- `BKP-007` رفض ZIP bomb/path traversal ومحاولات التلاعب بالmetadata.
- `BKP-008` استعادة نسخة قديمة في LAN نشطة: يظهر تحذير وتمنع الكتابة الخطرة قبل reconciliation.
- `BKP-009` فقد جهاز الطبيب واستعادة مع صلاحيات مالك موقعة ونقل رخصة، دون استنساخ هوية جهازه.
- `BKP-010` Android job لا يعمل في وقت الجدولة المحدد: يطلق تنبيه فوات النسخة ولا يعلن نجاحاً زائفاً.


---

<!-- SOURCE: docs/06_DENTAL_AND_SPECIALTIES.md -->

# 06 — المواصفات السريرية لطب الأسنان ومحرك الاختصاصات

## 1. المبدأ السريري

التطبيق يدير السجلات ويعرضها؛ **لا** يقرر التشخيص أو العلاج نيابة عن الطبيب. القاموس السريري والإجراءات الطبية والخطط والنماذج تطلب مراجعة سريرية قبل أي استخدام حقيقي. كل إجراء موثق بفاعل/زمن/زيارة/حالة وتصحيح متسلسل.

## 2. FDI والتسنين

- الأسنان الدائمة: 11–18،21–28،31–38،41–48 (حسب ترتيب الفكين والعرض بالعربية).
- الأسنان اللبنية: 51–55،61–65،71–75،81–85.
- مرحلة مختلطة: قد تظهر الأسنان الدائمة واللبنية في الوقت نفسه؛ لكل سن occurrence/episode عند الحاجة.
- لا نفترض وجود كل الأسنان أو شكلها الطبيعي؛ دعم ناقص التكوين/مفقود/مقلوع/غير بازغ/زرعة وبحث تاريخي.
- المخطط ثنائي الأبعاد تشريحياً قدر الإمكان، قابل للتكبير والضغط على Tooth + surfaces، مع Screenreader/accessibility hit targets.

## 3. الأسطح وحالات الأسنان

- الأسنان الخلفية: M Mesial، D Distal، B Buccal، L Lingual، P Palatal عند الأسنان العلوية، O Occlusal.
- الأسنان الأمامية: M/D وF Labial/Facial وL/P وI Incisal وفق السن.
- Field definitions تربط surface إلى tooth type، تمنع اختيار surface غير موجود في chart template.
- الحالات: caries, restoration composite/amalgam, crown, bridge abutment/pontic, endodontic, extraction, missing, implant, fissure sealant, fracture, unerupted، وغيرها بقاموس قابل للتوسعة.
- **الألوان حالة رسم فقط** لا مصدر الحقيقة؛ الواجهات تظهر Legend ثابتاً ورموزاً مع لون متعدد المعاني.

## 4. شاشة مخطط الأسنان

- Header: اسم/رقم المريض، الطبيب، الحساسية الحرجة، تاريخ الزيارة؛ لا تظهر أسرار غير مصرح بها.
- Center: chart دائم/لبني/مختلط، selection tool، multi select، zoom/pan، legend، filter by date/status.
- Right Panel RTL: ملخص المريض والأدوية/الحساسية حسب الصلاحيات.
- Left/Details pane: تاريخ السن، surfaces، findings، إجراءات، خطة، صورة أشعة، ملاحظات.
- Actions: تشخيص جديد، علاج مخطط، إجراء منفذ، تصحيح، صورة، إلغاء، طباعة ملخص.
- Search tooth by FDI input and key shortcuts؛ كل إجراء يطالب بزيارة/طبيب/إجراء/حالة وتاريخ عند الاعتماد.
- لا توليد Finding بمجرد تلوين السن؛ إنشاء كيان موثق أولاً ثم يعاد رسم chart.

## 5. سيناريوهات واجبة الدعم

1. مريض بالغ: فتح الملف → السن 26 → سطح O → تسوس موثق → خطة حشوة → كشف تكلفة → موافقة → إتمام الإجراء → تحديث السجل والمخطط والفاتورة.
2. طفل: فتح chart لبني واختيار السن 64، مع إمكانية mixed dentition؛ لا اعتبار طفل قيمة لحقل الجنس.
3. معالجة جذور متعددة جلسات: حالة plan item In Progress، توثيق visit 1/2 ثم completed.
4. قلع سن: يبقى التاريخ السابق موجوداً، وتُعرض الحالة الحالية بعد القلع مع حدث مؤرخ، لا حذف سجل السن.
5. جسر يربط عدة أسنان: `procedure ↔ dental_procedure_teeth`, وليس خانة نصية واحدة للسن.
6. تصحيح تشخيص سابق: correction/amendment مع سبب والطبيب المؤهل.
7. اختلاف صورتين في تاريخين: فتح chart as-of date مع نتائج وتوثيق المقارنة.
8. طلب تاج إلى مخبر (Phase 3): shade/material/lab/due/status/cost.

## 6. وحدة قياسات اللثة (Phase 3)

- مواقع لكل سن تحددها مراجعة طبيب الأسنان (مثلاً ستة مواقع)، عمق جيب mm، recession mm، bleeding on probing، plaque، mobility، furcation حسب القاموس السريري.
- تاريخ قياسات ومقارنة قبل/بعد بصورة رسومية واضحة، وعدم توقع قياسات من لون السن.
- طباعة Periodontal Chart مع دلالات واضحة.

## 7. قوالب سريرية

- Dental Intake / Medical History / Emergency alert.
- Dental Exam, Endodontic, Extraction, Crown/Bridge, Root Canal, Implant Planning, Orthodontic Progress, Pediatric Dentistry.
- Consent by procedure مع إصدار/توقيع.
- Prescription templates قابلة للتخصيص، تأكيد الطبيب قبل إصدار الوصفة.
- لا تحمل القوالب افتراضياً عبارة «كل شيء طبيعي» عند غياب فحص؛ خيارات yes/no/unknown.

## 8. Specialty SDK

```text
SpecialtyModule {
  module_id, semantic_version, compatible_core_versions,
  dependency_modules[], declared_permissions[], clinical_resources[],
  form_definitions[], validation_rules[], report_definitions[],
  workflow_actions[], migration_plan[], license_entitlement,
  localized_labels[], signed_manifest
}
```

- `core` لا يعرف الأسنان كأعمدة في `patients`.
- وحدات الاختصاصات **مجمعة في Build موقّع**، وتفعّل بمفتاح ترخيص؛ القوالب والبيانات يمكن تنزيل تحديثاتها بعد التحقق من توقيعها. لا Dart code hot-loading غير موثق.
- الإصدار الأول يضع `specialty_sdk` بواجهات وعينات اختبارية، ويطبق Dental بالكامل.
- رؤية مستقبلية: طب قلب ECG/ضغط/أعراض، عيون حدة البصر/ضغط العين، نسائية سوابق حمل ومتابعة، جلدية صور/خرائط، أطفال نمو، عظمية حركية/صور؛ لا يتم ادعاء اعتماد سريري قبل تحقق المختصين.

## 9. تعريفات إجراءات قابلة للتسعير

- `procedure_catalog(code, localized_name, specialty, expected_duration, billable, requires_consent, tooth_count_rule, surface_rule)`.
- سعر عند المعالجة snapshots، وليس تعديل سعر العلاج السابق بتغيير الكتالوج.
- خصومات حسب صلاحية؛ لا يحق للمساعد حفظ إجراء طبي مكتمل دون صلاحية الطبيب.

## 10. اختبار سريري

`DEN-001` كل الأرقام FDI للسن الدائم/اللبني صحيحة وثابتة بعد تدوير/RTL؛ `DEN-002` لمس/قلم/فأرة يحدد سطحاً بلا لمس الجار؛ `DEN-003` history as-of date يرجع حالة صحيحة؛ `DEN-004` استخراج فاتورة من إجراء منفذ واحد لا من خطة غير منفذة؛ `DEN-005` إجراء متعدد الأسنان يرتبط بالجميع؛ `DEN-006` تعديل سجل موقع ينتج Amendment؛ `DEN-007` صلاحيات استقبال لا تسمح بتحميل الصور الطبية؛ `DEN-008` اختبارات أداء chart مع 1000 events مريض واحد دون تجميد.


---

<!-- SOURCE: docs/07_DESIGN_SYSTEM_AND_SCREENS.md -->

# 07 — هوية Medical Premium، خرائط الشاشات، الإدخال الذكي

## 1. هوية معتمدة — لا تغيير دون Change Request

العميل يستعمل البرنامج ساعات طويلة، ويجب الجمع بين الجمالية وكثافة معلومات عملية. **القائمة اليمنى بترولية غامقة، والمحتوى فاتح، والتركيز تركوازي، RTL كامل والأرقام إنكليزية.** لا تعطيل وظائف لأجل الزخرفة.

| Design token | Light | Dark (مسودة تخضع لاختبار التباين) | Usage |
|---|---|---|---|
| `brand.sidebar` | `#164E63` | `#102F3B` | Sidebar |
| `brand.primary` | `#0F766E` | `#35B1A3` | Primary button/selection |
| `surface.canvas` | `#F5F8FA` | `#101923` | الخلفية |
| `surface.card` | `#FFFFFF` | `#1B2732` | بطاقات/جداول |
| `text.primary` | `#1E293B` | `#EDF4F7` | النص الأساسي |
| `border.default` | `#DCE5E9` | `#35424D` | فواصل |
| `selection.soft` | `#E7F5F3` | `#193B3E` | اختيار/تركيز |
| `status.error` | Semantic token tested | Semantic token tested | تحذير/خطأ لا يتعارض مع Dental legend |
| `status.success` | Semantic token tested | Semantic token tested | حفظ/نجاح |

**الخط:** IBM Plex Sans Arabic أو خط عربي متاح تجارياً مع تدقيق الترخيص. الحجم Body 15–16، Header 22–24، جدول Windows 14–15، مساعد 12–13، مع Text scaling. أرقام عربية هندية غير مقبولة في العرض؛ 0-9 دائماً. أرقام الهواتف وMRN تبقى LTR حتى داخل نص RTL.

## 2. قواعد تخطيط Responsive

- Breakpoints *نقاط بدء اختبار* حسب عرض نافذة التطبيق لا الجهاز: `<600`: single column؛ `600–1023`: tablet split optional؛ `>=1024`: desktop 2–3 panes. تُعدّل بعد اختبار actual screen real estate.
- Windows: Sidebar rechts قابلة للطي، Header/search/actions، جداول كثيفة مدروسة، اختصارات، dialogs غير محجوبة، تعدد tabs/screens.
- Android Tablet: side navigation متكيف، touch targets ≥ 44–48dp، pane قابل للطي، chart كامل الشاشة عند الحاجة، keyboard-aware layout.
- Android phone: حالة supported minimal tasks (مواعيد/ملف/ملاحظات) إن تقرر دعمها؛ لا تحشر 32 سناً في عرض 360px بلا zoom/pan.
- كل UI يعكس permission filtering؛ State `Offline`, `Pending`, `Synced`, `Conflict`, `Read Only`, `License Upgrade Needed` ظاهر ومستقل عن لون فقط.
- مكونات مشتركة: `ClinicScaffold`, `Sidebar`, `TopSearch`, `StatusChip`, `DataGrid`, `SmartTextField`, `SmartSelect`, `FormSection`, `DentalSurfacePicker`, `ConfirmDialog`, `SaveIndicator`, `SyncStatus`, `ErrorBoundary`, `EmptyState`.

## 3. خريطة الواجهات الرئيسية

| Route concept | شاشة | الحد الأدنى | اختلاف الدور |
|---|---|---|---|
| `/onboarding` | First Run Wizard | إنشاء/انضمام/لغة/مالك/نسخ/ترخيص/Recovery | مالك فقط |
| `/login` | الدخول | مستخدم/قفل/تبديل حساب/حالة جهاز | كل مستخدم مرخص |
| `/dashboard` | لوحة الدور | مواعيد اليوم/انتظار/إشعارات/مهام، بطاقات قابلة للترتيب | الطبيب يرى سريرياً، استقبال مواعيد، محاسب أموال |
| `/patients` | دليل المرضى | بحث عربي/هاتف/رقم، قائمة paginated، إضافة/كشف تكرار | إخفاء أعمدة غير مصرحة |
| `/patients/:id` | ملف مريض | ملخص/زيارات/مواعيد/تشخيصات/أشعة/مالية/موافقات | Tabs متاحة حسب role |
| `/schedule` | التقويم | يوم/أسبوع/شهر، طبيب/غرفة/كرسي، drag/drop مدقق | حسب حجز/عرض |
| `/queue` | الانتظار | وصول/دخل/خرج/مناداة/مهام | استقبال/طبيب |
| `/encounters/:id` | زيارة طبية | ملاحظة/تشخيص/إجراء/وصفة/مرفقات/اعتماد | طبيب/مساعد مفوض |
| `/dental/:patientId` | الأسنان | Odontogram/أسطح/خطة/تاريخ/أشعة | أطباء معتمدون |
| `/billing` | الفواتير | فواتير، دفعات، رصيد، تخفيض، طباعة | منع نسب الأرباح عن استقبال |
| `/reports` | التقارير | فلاتر → معاينة → طباعة/Excel/PDF، مراجعة صلاحيات | مقيدة لكل تقرير |
| `/users` | مستخدمون | حسابات، أدوار، صلاحيات فردية، جهاز/حقل/نطاق | مالك/مفوض |
| `/devices` | أجهزة العيادة | اكتشاف/اقتران/إلغاء/آخر اتصال/حالة الترخيص | مالك |
| `/license` | الترخيص | استحقاقات/طلب ترقية/QR وتفعيل/نقل جهاز | مالك |
| `/sync` | حالة المزامنة | peers, outbox, conflicts, checkpoints, retry | مالك/مشرف مخول |
| `/backup` | النسخ | ربط Drive، ضغط/تشفير، الجدولة، آخر نجاح، استعادة آمنة | مالك |
| `/settings` | الإعدادات | علامة تجارية/عملة/فروع/خط/ثيم/طباعة/خصوصية | ما يسمح به الدور |
| `/modules` | الاختصاصات | عرض الوحدات والمفعّل/غير المفعّل والنسخ | مالك/مشرف |
| `/support` | الدعم | تحديثات، نظام التشخيص، تصدير logs منقحة | المالك بعد الموافقة |

## 4. الشاشات الخمس المرجعية التي تُرسم قبل الباقي

**أ. First Run:** ترحيب مختصر → إنشاء/انضمام → بيانات منشأة → حساب مالك → Recovery Kit → License → Backup setup → اختبار شبكة. لا اختفاء للخطأ أو تجاوز قفل مفتاح الاسترداد دون تأكيد مستقل.

**ب. Dashboard:** يختلف لكل دور؛ بطاقات صغيرة مفيدة، ليس رسوم بيانية لمجرد الزينة. الأقسام: حالتي اليوم، مواعيد قادمة، انتظار، تنبيه حساسية، آخر نسخة احتياطية، مزامنة، فواتير غير مكتملة ضمن صلاحية.

**ج. ملف المريض:** Header ثابت يعرض الاسم ورقم الملف والتنبيهات ذات الأولوية، tabs منظمة، بيانات الاتصال منفصلة عن السريري/المالي، Actions عليا حفظ/زيارة/موعد/طباعة وفق role.

**د. مخطط الأسنان:** مركز واسع مخصص 2D chart، على اليمين ملخص المريض، وعلى اليسار اللوحة الجانبية لتفاصيل السن؛ على التابلت لوحات details قابلة للطي.

**هـ. جدول المواعيد:** Filter حسب الطبيب/الكرسي/الغرفة، اختصارات، لون status، تحذيرات التعارض وصراحة pending أو committed.

## 5. تصميم نموذج الصلاحيات لمالك العيادة

- قائمة مستخدمين على اليمين؛ التفاصيل على اليسار/الوسط.
- tabs: `الشاشات`, `الإجراءات`, `الحقول`, `المرضى/الفروع`, `الأجهزة`, `السجل`.
- Matrix لكل شاشة: عرض/إضافة/تعديل/إلغاء/اعتماد/طباعة/تصدير؛ زر `نسخ من دور` + `استثناءات` + `معاينة واجهة هذا المستخدم`.
- أي تعديل حساس يظهر مقارنة Before/After، سبب وموافقة المالك، وحالة نشر `N of M devices acknowledged`.
- توضيح صريح أن الأجهزة المنفصلة لن تُحدّث فوراً وأن Access TTL محدود.

## 6. محرك الإدخال الذكي — Smart Clinical Input

### 6.1 أنواع الحقول

- Single select, Radio, Segmented, Multi-select with search, Autocomplete, Date/time, Numeric, Money, Yes/No/Unknown, ICD/local coded field, Tooth selector, Surface selector, Text/snippet, File/Image, Signature.
- InputMode بحسب نوع الحقل: الهاتف→numeric tel keyboard؛ مبلغ→decimal controlled؛ الزيارات→Clinical specific templates.
- Mandatory/Conditional/Hidden fields وفق Form Rule Engine ومراجعة نسخة القالب القديمة؛ `conditional visible != data deletion`.

### 6.2 تعلم الاقتراحات

```text
suggestion_score = weighted(
  user_pin, specialty_relevance, field_context, frequency_decay,
  recent_use, prefix_match, arabic_normalized_match
)
```

هذه معادلة ترتيب وليست تشخيصاً طبياً. آخر اختيار لا يُملأ آلياً في حقل خطير مثل الحساسية/الأدوية. أفضلية القيم تتغير لكل مستخدم، ويمكن للمالك تحديد القاموس الافتراضي. يحتفظ البرنامج بالتكرارات دون محتوى PHI غير لازم؛ لا يُعرض اقتراح مستمد من صلاحية أعلى لحساب أدنى.

- بحث عربي بعمود normalized منفصل؛ حافظ على الاسم الأصلي حتى مع `أحمد/احمد`, `إبراهيم/ابراهيم`، وأزل التشكيل لأغراض البحث فقط.
- 150–250ms debounce للبحث الكبير، أما lookup المحلي الصغير فلا ينبغي إضافة انتظار مفتعل.
- اختيار الاقتراح Enter، أسهم، click/touch؛ F4 يفتح القائمة حيث يوجد picker، Tab ينتقل حسب Focus traversal.
- زر اختيار منبثق (مثل عدسة/مسطرة) يعمل بطريقة موحدة عبر الشاشات عند وجود قائمة مرتبطة.
- Ctrl+S حفظ، Ctrl+F بحث، Ctrl+N جديد، Esc إغلاق، Shift+Tab عودة؛ مع اختبارات لضمان ألا يقفز Tab بشكل خاطئ.
- مسودة محفوظة محلياً مع `draft_status`, lastSavedAt, actor, ability to recover after crash.

### 6.3 قوالب قابلة لإعادة الاستخدام

- Templates per clinic/specialty/user; snippets text with placeholders and validation.
- مثال: قلع/علاج عصب/تنظيف/تاج؛ لا يضع افتراضات «كل القيم طبيعية» دون إدخال الطبيب.
- تحديث القوالب لا يغير سجلات قديمة؛ `form_revision` ثابت لكل Submission.

## 7. نماذج جداول وتقارير

- DataGrid Windows: virtualization، ترتيب وفلاتر، أعمدة قابلة لضبط العرض، مجموع/عدد عند الحاجة، Page size واضح، لا تحميل كل السجلات.
- PDF: Preview واضح وفيه Header/Date/Patient ID/Footer/Page number، اتجاه RTL وجداول محاذاة مستقيمة وقيم مالية Decimal.
- توافق طابعات Windows/Android ذات إمكانية الطباعة؛ تختبر طابعة A4 وحرارية فقط إذا اشتراها العميل، لا نفترض توافر كل درايفرات الأجهزة.
- Errors: رسالة معنى واضح، كود تتبع بلا PHI، خيار إعادة المحاولة عند العملية idempotent فقط، عدم إعادة دفع من دون فحص الحالة.

## 8. WCAG وقيود التصميم

- تباين النص العادي ≥4.5:1، المحتوى الكبير/الأشكال المهمة ≥3:1 حيث ينطبق.
- الحالة لا توصل بلون وحده؛ نص/أيقونة/shape.
- شريط المهام والحقول قابلة للوصول بالكيبورد وكبير الخط، واختبارات screen reader.
- Focus outline مرئي؛ confirm actions destructive؛ لا رسوم متحركة مفرطة في شاشة طبية.
- Night mode يغيّر السطوح لا الدلالات الطبية القانونية أو تنبيهات الأخطار.

## 9. بيانات تصميم اختبارية

استخدم 100% بيانات وهمية بأسماء عربية عامة ولا تُضمن بيانات مرضى فعلية في repository أو screenshots؛ استخدم Fixtures بأرقام إنكليزية وأسماء اصطناعية.


---

<!-- SOURCE: docs/08_TECH_STACK_AND_COMPLIANCE.md -->

# 08 — مكتبات التنفيذ والقيود التقنية والتراخيص

## 1. الاعتماد التقني الرسمي

**إجباري:** Flutter/Dart للواجهات، Drift+SQLite مدمجة مشفرة للتخزين على الأجهزة، مكون Dart محلي لخدمة LAN والمزامنة، أمان على منصة Windows/Android، لا Node.js ولا API خارجي في التشغيل المحلي.

**نسخ الحزم:** لا تُثبّت أرقام إصدارات قديمة من هذه الوثيقة. أثناء التنفيذ اختر إصدارات مستقرة متوافقة رسمياً مع Flutter/Dart الحاليين، وسجّلها في `pubspec.lock`, `dependency_audit.md`, SBOM، وأكد رخصها قبل اعتماد Build. يجب إعادة التحقق من صيانة المكتبة على pub.dev/GitHub.

## 2. قائمة مكتبات مرشحة/معتمدة وظيفياً

| الوحدة | package / API | سبب الاختيار وحالة الاعتماد |
|---|---|---|
| State | `flutter_riverpod` | إدارة الحالة وتقليل rebuilds؛ معتمدة وظيفياً |
| Router | `go_router` | تنقل مع route guards، مع التحقق الحقيقي داخل use cases |
| DB ORM | `drift`, `drift_flutter`, `drift_dev` | migrations, streams, typed SQL |
| Native DB | `sqlite3` + `sqlite3mc` via build hooks | SQLite مشفرة، runtime cipher verification مطلوب |
| Codegen | `freezed`, `json_serializable`, `build_runner` | بيانات typed/immutable |
| UUID | `uuid` | معرفات stable للـrecords/operations |
| Discovery | `bonsoir` | mDNS/DNS-SD على Windows/Android؛ يجب اختبار إصدار وخيارات OS |
| Transport | `web_socket_channel`, `shelf`, `shelf_web_socket` | قناة WS داخل التطبيق نفسه، وتشفير/توثيق custom services |
| Network | `connectivity_plus`, `dio` | حالات الاتصال ونقل الملفات، connectivity ليس ضمان الإنترنت |
| Local secrets | `flutter_secure_storage` | حماية tokens/keys wrapped مع native key stores |
| Crypto | `cryptography`, `cryptography_flutter` | AES-GCM/Ed25519/KDF حيث مُختبر على المنصات؛ بعض KDF تحتاج native audited lib |
| Platform | Android Keystore/Kotlin; Windows CNG/TPM/DPAPI native bridges | device binding/attestation/security |
| PIN/QR | `qr_flutter` (+scanner package مُراجع) | Pairing/License activation |
| Search | SQLite FTS5, `flutter_typeahead`, `dropdown_search` | learning/autocomplete/multi select |
| Forms | `flutter_form_builder`, `form_builder_validators` | Dynamic forms بعد فحص دعم/اختبارات |
| Dental visuals | Flutter `CustomPainter`, `Canvas`, `Path`, `InteractiveViewer`, `flutter_svg`, `vector_graphics` | تفاعل سريع وتحديد سطح دون مكتبة مغلقة |
| Scheduler UI | `calendar_view` | ابدأ بمفتوح المصدر، اختبار multi-doctor/resource calendar |
| Grid | `pluto_grid` أو `two_dimensional_scrollables` | قرار Spike بعد الاختبار، لا تستخدم الاثنين في نفس الشاشة بلا سبب |
| Desktop | `window_manager` | نافذة Windows |
| Files | `path_provider`, `file_picker`, `image_picker`, `photo_view` | ملفات/كاميرا/صور |
| Archive | `archive`, Zstd plugin/native bindings tested | streaming compression; لا تحميل أرشيف كامل إلى RAM |
| Backup API | SQLite Online Backup API via Drift/native | Snapshot متسق |
| Google | `googleapis`, platform auth adapters (Android Google sign-in / Desktop OAuth2+PKCE) | Drive file upload/download/resumable |
| PDFs | `pdf`, `printing` | طباعة تقارير وفواتير؛ RTL/shaping تحت فحص حقيقي |
| RTL shaping | `pdf_text_shaper` (candidate) | فحص ترخيص ومخرجات قبل اعتماد نهائي |
| Charts | `fl_chart` | Dashboard إن كان ذا قيمة |
| Money | `decimal` (أو money2 اختياري) | لا double للمال |
| Notifications | `flutter_local_notifications` | محلي؛ اختبار Windows-specific |
| Android tasks | `workmanager` | قيود background Android واضحة، ليس بديل سيرفر دائم |
| Permissions | `permission_handler` | طلب الصلاحيات اللازمة فقط |
| Packages | `melos` | Monorepo / packages |
| Tests | `flutter_test`, `integration_test`, `mocktail`, optionally `patrol` | اختبارات وحدات/تكامل وأجهزة |
| Logging | `talker_flutter` أو structured logger | تجريد PHI ووثائق retention |
| Windows installer | `msix` / official packaging, sign builds | Windows signed install |

## 3. معايير اختيار المكاتب

ممنوع اختيار مكتبة لمجرد أنها تعمل في Screenshot. يجب توثيق: آخر إصدار وصيانة، مستوى اختبار Windows/Android الفعلي، الترخيص، تبعيات native، حجم bundle، Memory، أمان، أخطاء مفتوحة، compatibility Flutter، وحالة البديل.

- أي AGPL/GPL/ترخيص مدفوع يحتاج مراجعة قانونية صريحة؛ لا تضم مكتبة ذات التزام غير مقبول في منتج تجاري مغلق دون ترخيص مناسب.
- مكتبات Syncfusion مثلاً تخضع لترخيص مختلف وليست بديلاً تلقائياً مجانياً.
- DICOM Viewer/Parser اختيار مستقل بعد تحديد صيغة أجهزة الأشعة/توافق الرخص؛ **لا تعتمد `dicom_parser` المتوقفة** كأساس المنتج.
- لا تستخدم `sqlcipher_flutter_libs` القديمة أو `sqlite3_flutter_libs` بغير مراجعة المستندات الحديثة؛ المسار الجديد drift/native + sqlite3mc.
- لا تضم مفتاح Google OAuth client secret داخل التطبيق؛ native apps public clients.

## 4. التحقق من دعم المنصات

| Capability | Windows | Android | Policy |
|---|---|---|---|
| Encrypted SQLite | Required | Required | Release blocker إذا plaintext |
| mDNS discover/advertise | Required | Required | QR/manual fallback |
| Local WS accept/listen | Required | Active app foreground | لا 24/7 background claim |
| Hardware key | CNG/TPM preferred | Android Keystore preferred | Capability detection/fallback policy |
| OAuth Drive | Browser PKCE loopback | Official platform Sign-in | Test separate adapters |
| PDF preview/print | Required | Required | Arabic text and fonts tested |
| File import/export | Required | Required | Scoped storage / permissions |
| Scheduled backups | native OS scheduling | workmanager/opportunistic | Last successful backup warning |
| Installer updates | signed MSIX/installer | signed APK/AAB | Schema/protocol compatibility |

## 5. مصادر تقنية رسمية مؤرخة عند إعداد الملف

- Flutter adaptive/UI: https://docs.flutter.dev/ui/adaptive-responsive
- Flutter keyboard/focus: https://docs.flutter.dev/ui/interactivity/focus
- Drift encryption with sqlite3mc: https://drift.simonbinder.eu/platforms/encryption/
- Drift supported platforms: https://drift.simonbinder.eu/platforms/
- SQLite Online Backup API: https://sqlite.org/backup.html
- Android NSD discovery: https://developer.android.com/reference/android/net/nsd/NsdManager
- Google OAuth Desktop PKCE: https://developers.google.com/identity/protocols/oauth2/native-app
- Google Drive limited scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Google Drive resumable upload: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Flutter Windows distribution: https://docs.flutter.dev/platform-integration/windows/building
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP ASVS stable: https://asvs.owasp.org/
- HL7 FHIR Appointment/Encounter distinction: https://hl7.org/fhir/R4/appointment.html

## 6. تخطيط للاختصاصات الطبية الجديدة

استخدم Module SDK لتسجيل FormDefinitions/Validators/Reports/PermissionScopes/Routes ومigrations، مع resolver يفحص license entitlements. التوسع بسكيما منظمة، لا تجعل حزمة أسنان حاضرة في كل مجال core. دعم FHIR/DICOM من خلال adapters لاحقاً وليس فرض API خارجي على تشغيل العيادة المحلي.

## 7. مخرجات فحص المكتبات المطلوبة قبل كتابة الإنتاج

- `docs/DEPENDENCY_AUDIT.md` جدول نسخة/رخصة/صيانة/Windows/Android/status/gaps.
- `pubspec.yaml`, `pubspec.lock`, قرار logger/crypto/QR scanner/calendar/grid.
- Build اختباري مع drift encrypted SQLite + Bonjour + WS على Windows وAndroid.
- تحقق runtime أن SQLite المستخدمة تدعم Cipher وأن query فشلت بدون المفتاح الصحيح.
- اختبار OCR غير مطلوب؛ لا تدخل مكتبة OCR أو AI لمجرد تحسين مظهر المنتج.


---

<!-- SOURCE: docs/09_DELIVERY_PLAN.md -->

# 09 — خطة تنفيذ متسلسلة للوكلاء البرمجيين (Codex / Claude / Antigravity)

## 1. أسلوب العمل

**نفّذ شيئاً قابلاً للتشغيل والاختبار في كل مرحلة. لا تنشئ 200 ملف placeholder ولا تختبئ خلف Mock UI.** وثائق SRS تحدد المنتج النهائي؛ الـPhase Plan يحدد ترتيب الإنجاز. نقل متطلب من المرحلة الحالية إلى backlog لا يعني إسقاطه، ويجب إظهار السبب للمستخدم.

## 2. الخطوات التنفيذية وبوابات القبول

### P0 — Audit & Scaffold

**Deliverables:** Repo structure `apps/ packages/ docs/ tools/ integration_tests/`, Melos setup, Flutter desktop/android build, lint, CI, LICENSE audit template, demo fixtures, `requirements_catalog.json` import, traceability.

**Gate:** Windows وAndroid Build ناجح؛ tests/lints نظيفة؛ لا مفاتيح مخفية؛ Docker/Node.js غير مطلوبين للتشغيل.

### P1 — Security & Local DB proof

**Deliverables:** schema/migrations, encrypted DB executor, runtime cipher verification, secure key store native adapters, clinic wizard/owner identity, permission domain + deny enforcement, signed policies, authenticated local transport spike.

**Gate:** SQLite stolen unreadable؛ access refused without role/device؛ wrong key failure؛ migration/recovery test؛ device pair Windows↔Android.

### P2 — Peer LAN Sync proof (Safety Gate)

**Deliverables:** discovery+fallback, pairing approval, outbox/inbox idempotency, protocol negotiation, single-coordinator embedded service, versions/epochs, conflict queue, audit, simulated faults.

**Gate:** all `SYNC-001..010` mandatory tests pass on physical Windows/Android where relevant. **لا تبنِ فواتير إنتاجية قبل إثبات sync safety.**

### P3 — Clinic Core & Smart Input

**Deliverables:** patients/appointments/encounters/forms/smart input, responsive theme, Arabic RTL numbers, medical history, preflight duplicate search, patient-based scopes, autosave, baseline reports.

**Gate:** registration → appointment → visit → document flows end-to-end، UI fast targets measured، denied patient history not replicated to secretary.

### P4 — Commercial Licensing & Backup

**Deliverables:** Offline license issuer **separate** from application, signed entitlements, seat counting/revision, add accountant/no data change, backup encrypted+compressed, local/Drive OAuth adapters, restore into new device, recovery key kit.

**Gate:** no ability to access clinic on extra copied device, no patient data loss on upgrade, wrong-key backup fails, cloud upload resumes, restore with authorized owner.

### P5 — Dental MVP

**Deliverables:** FDI chart 32 permanent+20 primary, mixed dentition, tooth/surface hit-tests, findings, historical layers, plan, pricing, procedures, images, consents, prescriptions, print.

**Gate:** real workflows `DEN-001..008` with clinical reviewer sign-off; performance stable; all relevant authorizations tested.

### P6 — Release Candidate & Pilot

**Deliverables:** 2+ real tablet device classes + Windows, security review, installer/signing, full migration, backup drill, support tooling, user docs, test suite, training, demo data, pilots with permissioned test data.

**Gate:** Release checklist sign-off; no blocker security/sync/data loss; clinic owner formally approves.

### P7 — Expansion (planned, not omitted)

Periodontal chart, laboratory orders, orthodontics/implant module, advanced inventory/finance, multi-branch, additional specialties, DICOM/FHIR adapters, optional VPS/Hybrid sync. Maintain backward compatibility and migration plan.

## 3. Definition of Done لأي Feature

- Requirement ID & acceptance criterion explicit.
- Domain/DB/ACL/Sync/UI/Backup/Reports impacts checked.
- Unit + Integration + role-negative tests + scenario test green.
- Windows and Android relevant smoke tested.
- No insecure demo fixtures in prod, no runtime keys hardcoded, no PHI in logs.
- Schema migration safe and tested from previous supported version.
- UI Arabic/RTL/English digits + keyboard/touch tested.
- Docs & traceability updated, version/commit details in PR.
- Feature flag default state documented; changes to SRS through recorded CR, not deleted.

## 4. Required coding conventions

- packages with clean boundaries; `domain` no Flutter import, repos/interfaces and use cases decoupled.
- Explicit Dart `sealed` failures/Result pattern, no swallowed exceptions.
- `async/await`/Isolates for CPU-heavy work and background sqlite where appropriate, no UI blocking.
- Request cancellation/debounce, pagination and virtualization.
- No `double` for money, no unscoped PHI caching, no raw credentials in log files.
- No blind retries on irreversible or monetary ops; idempotency and status lookup mandatory.
- All docs primarily Arabic, identifiers English, comments concise and accurate.

## 5. إدارة التغييرات دون حذف القديم

- قبل تعديل قاعدة أو مسار: افحص تاريخ git وأثبت Snapshot / Branch آمن.
- ممنوع أوامر rm -rf واسعة أو إعادة إنشاء Repo فارغ أو استبدال ملفات مشروع قائم دون Audit.
- PRs صغيرة ومراجعة؛ تغييرات DB تقدم migration وليس schema reset.
- عند تعارض متطلبين: سجل قراراً ADR وCR وعرض الأثر على المالك، لا تتخذ قراراً يُبطل SRS بصمت.
- إذا توقف التنفيذ بسبب قيود منصة، قدم PoC واقتراح بديل مع Test evidence، ولا تدّع إنجازاً وهمياً.

## 6. قالب تقرير نهاية كل مرحلة

```text
Phase:
Implemented Requirements: REQ-...
Deferred Requirements: REQ-... (with approved reason)
Code Changes:
Migrations:
Tests Passed/Failed/Skipped:
Windows Build:
Android Build:
Security/PHI review:
Benchmarks:
Open risks/blockers:
What is next:
```


---

<!-- SOURCE: docs/10_TEST_STRATEGY.md -->

# 10 — خطة الاختبارات ومعايير القبول

## 1. منظومة الاختبارات

**لا يكتمل المنتج دون نتائج موثقة.** مستويات الاختبار: Unit/Property/Schema Migration/Contract/Integration/End-to-End/Security/Fault Injection/Performance/Usability/Accessibility/Backup Recovery/Release.

الأدوات: `flutter_test`, `integration_test`, mocks/fakes محكومة، physical devices، test harness لتأخير/حذف/reorder رسائل LAN، فحص SQLite integrity وencrypted storage، CI static analysis وlicense audit.

## 2. بيئات الاختبار

- `DEV-WIN`: Windows 11 x64 متوسّط، إصدار Release mode؛ اختبر Windows 10 إن تبنى ضمن supported matrix.
- `DEV-AND-MID`: Android Tablet RAM 4–6GB وسعة تخزين معقولة، Developer options لا يعطلون battery management.
- `DEV-AND-ALT`: Android Tablet من شركة مختلفة + اختبار إصدار OS آخر.
- Router Wi-Fi محلي مع Internet disabled؛ شبكات مع Client Isolation؛ حجم 20,000 patients و200,000 appointments و100,000 clinical events و5GB media (fixtures وهمية).
- Network impairment: 0–500ms jitter, 0–15% packet loss, disconnects 30s–30min, duplicate/reordered messages, app force-kill.
- Profile execution on release builds not debug/hot reload.

## 3. أهداف أداء قابلة للقياس

| Test | Metric | Target |
|---|---|---|
| PERF-001 | Open cached patient after warm-up P95 | ≤150ms on reference device |
| PERF-002 | Suggestion query P95 | ≤120ms local with index |
| PERF-003 | Tooth selection UI | Interaction displayed next frame nominal / smooth 60fps target |
| PERF-004 | LAN change acknowledged/display P95 | ≤500ms healthy LAN ordinary event |
| PERF-005 | Scroll 10k patient list | No full materialization, bounded memory & smooth scrolling |
| PERF-006 | Add/edit 50 invoice lines | No noticeable input freeze, correct Tab/Enter |
| PERF-007 | Backup 5GB media | Streaming bounded RAM, no app freeze, restore exact hashes |
| PERF-008 | Offline reconnect 1000 ops | all committed/recorded, no duplicates or silent loss |

أهداف الأداء قابلة للمراجعة بعد baseline benchmark بسبب اختلاف الأجهزة. أي تغيير في الهدف يوثّق ولا يترك كـ«سريع جداً» غامض.

## 4. اختبارات القبول الوظيفي حسب المجال

| Test ID | Precondition | Steps / Expected | Requirement mapping |
|---|---|---|---|
| ACC-001 | First install | Owner creates encrypted clinic, enters backup recovery, sees dashboard | SET,PLAT,BKP |
| ACC-002 | Android + Windows on LAN | Secretary joins after Owner approval, sees only approved data | SET,SYN,AUTH |
| ACC-003 | Secretary 1/2 | Owner denies financial profit to both, permits payment to one; cannot call restricted DAO | AUTH,FIN |
| ACC-004 | Offline secretary | Owner revokes access while offline; TTL blocks protected data when stale; reconnect rejects ops | AUTH,SYN |
| ACC-005 | One license 2 seats | Owner adds accountant seat via signed upgrade, no patients/finances altered | LIC,FIN |
| ACC-006 | Copy APK/database | New device not preactivated; no unwrapped keys; fails extra license join | LIC,SEC |
| ACC-007 | New patient | Create name, DOB, sex, age category computed, multiple contacts, no duplicate | PAT,INP |
| ACC-008 | Patient history | Yes/No/Unknown allergies, restricted receptionist cannot view PHI | PAT,AUTH |
| ACC-009 | Doctor 26/FDI | Click tooth 26 surface O, create finding and treatment planned; no procedure billed as complete | DEN,PAT,FIN |
| ACC-010 | Pediatric chart | Select FDI 54 and mixed dentition, no invalid FDI/surface | DEN |
| ACC-011 | Network split | Two appointments same chair/time; only one committed, other conflict | SYN,PAT |
| ACC-012 | Payment retry | ACK lost, resend same idempotency; balance changes exactly once | SYN,FIN |
| ACC-013 | Two clinicians | Same signed note modified in parallel; original preserved and amendment tracked | PAT,SYN |
| ACC-014 | Restore | Delete simulated device, restore backup local/Drive, retain original history and attachments | BKP,SEC |
| ACC-015 | Password/recovery | Recovery with valid key; wrong key fails without altering live clinic | BKP,AUTH |
| ACC-016 | English numbers | Arabic RTL table/pdf/fields show 0-9, keyboard and F4 picker correct | UX,INP,DOC |
| ACC-017 | Outdated device | Protocol mismatch refuses write without corruption | SYN,NFR |
| ACC-018 | Missing coordinator | Draft works, payment/booking finalization blocked/pending and visible | ARCH,SYN,FIN |
| ACC-019 | Google Drive | OAuth Windows and Android, resumable upload, retention, warning on missed run | BKP |
| ACC-020 | License expired | Medical export/restore safely available per policy, no data deletion | LIC |
| ACC-021 | Large file | 5GB mock medical attachments, thumbnails/mem/chunks, reliable checksums | DOC,SYN,BKP |
| ACC-022 | Medical correction | Change approved clinical note via signed amendment, retain original | PAT,DEN |
| ACC-023 | Export | Accountant exports allowed financial data only; receptionist denied medical export | AUTH,DOC |
| ACC-024 | Clinic isolation | Clinic A and B on same network never pair/copy data cross-tenant | PLAT,AUTH,SYN |
| ACC-025 | App kill | Crash after local DB txn before WS ACK; after restart no duplicate/no silent loss | SYN,NFR |
| ACC-026 | Owner device lost | Recover data/license/owner authorization on new device with separate device key | SET,SEC,LIC,BKP |
| ACC-027 | Clinical templates | Old encounter form uses old version after template update | INP,MOD |
| ACC-028 | Localization | Visual test RTL, English digits, dark mode readability | UX |
| ACC-029 | Consent | Consent version, signer, date, permission, approval in print and audit | PAT,DOC |
| ACC-030 | Multi-specialty SDK | Dummy non-dental module metadata + form + scope loaded without modifying patients schema | MOD |

## 5. Gate اختبارات الأمن

- Password hashing KDF tested, replay protection, encrypted DB and media, restricted data not sent, license issuer private key not in artifacts.
- Negative tests for every permission group including direct application use case/service invocation, file retrieval, printing/export, coordinator commands.
- Fuzz input: malformed QR, crafted WS payload, oversized attachment, corrupted archive, unsafe filename/path traversal.
- Source code/dependency scan، secret scan، SBOM، signed release reproducible to extent feasible.
- Backup recovery and cryptographic framing reviewed by security practitioner before production PHI.

## 6. Gate اختبارات الجودة السريرية

- عدد/ترقيم الأسنان أساسي مع external dentist review.
- طباعة الوصفات والتحذيرات والحساسية ونسبتك للقياس عبر طبيب مخول؛ توقيع سجل علاج من غير طبيب يُرفض.
- لا auto-prescription أو AI diagnosis في MVP.
- تجارب receptionist/doctor/accountant ببيانات وهمية عبر ثلاثة أجهزة.

## 7. CI / Release blocker

- Lints/formatter + unit + migration + analyzer green، مع platform builds.
- اختبارات SYNC الحرجة وBKP وSEC لا تسمح بوضع Skipped وتمرير release بلا سبب معتمد.
- P0 blockers: plaintext PHI, wrong authorization, split-brain payments, undecryptable backup, loss of record, undeclared license key in client, destructive migration.
- Regression لكل إصدار؛ أي Bug في نفس مجال REQ يضيف اختباراً يمنع عودته.

## 8. أدلة نتائج الاختبارات

تُحفظ ضمن `artifacts/qa/<build_version>/`: junit/json summary، performance CSV، sanitized logs، screenshots للواجهات، migration reports، backup restore verification hashes، قائمة أجهزة وإصدارات OS، release approval. لا بيانات حقيقية.


---

<!-- SOURCE: docs/11_BACKLOG_AND_DECISIONS.md -->

# 11 — القرارات النهائية، القرارات الافتراضية، Backlog مؤجل دون حذف

## 1. قرارات المنتج المعتمدة نهائياً في هذا الخط الأساسي

| Decision | Status | Meaning |
|---|---|---|
| DEC-001 | ACCEPTED | المنتج تجاري متعدد العملاء، وليس برنامجاً مخصصاً لطبيب واحد |
| DEC-002 | ACCEPTED | الأسنان أولاً، النواة العامة قابلة لعدة اختصاصات |
| DEC-003 | ACCEPTED | Flutter/Dart Windows + Android أساسي |
| DEC-004 | ACCEPTED | لا Node.js، لا خادم مستقل إجباري، لا إنترنت دائم محلياً |
| DEC-005 | ACCEPTED | SQLite مشفرة لكل جهاز، LAN discovery/sync | 
| DEC-006 | ACCEPTED | الطبيب المالك يتحكم بحقوق كل مستخدم وجهاز وحقل وشاشة |
| DEC-007 | ACCEPTED | رخصة تجارية قابلة للترقية بعد بيع أول نسخة، مستقلة عن بيانات المرضى |
| DEC-008 | ACCEPTED | كل النسخ الاحتياطية مضغوطة ومشفرة؛ Google Drive اختياري |
| DEC-009 | ACCEPTED | إدخال سريع/يتعلم من قيم تاريخية دون تشخيص ذاتي أو كشف PHI |
| DEC-010 | ACCEPTED | Medical Premium sidebar البترولي `#164E63` وخلفية فاتحة `#F5F8FA` وتركواز `#0F766E` |
| DEC-011 | ACCEPTED | RTL عربية كاملة وأرقام إنكليزية |
| DEC-012 | ACCEPTED | VPS لاحقاً خيار، لا شرط MVP |

## 2. افتراضات تنفيذية محسوبة — لا تعطل الشروع

| Assumption ID | الافتراض الآمن الحالي | متى يُراجع |
|---|---|---|
| ASM-001 | Coordinator واحد معروف في Phase 0/1 والعمليات الحرجة Pending عند غيابه | عند اكتساب دليل قوي لانتخاب آمن |
| ASM-002 | بيانات الموظفين المفوضين تُستنسخ **بالحد الأدنى** لا قاعدة طبية كاملة | بناء Permission model في DB |
| ASM-003 | backup يومي افتراضياً + نسخ قبل Migrations، وOwner يحفظ recovery kit | قبل إطلاق بيانات حقيقية |
| ASM-004 | Clinic واحد لكل مساحة قاعدة محلية، مع إمكانية فصل أكثر من Clinic على الجهاز | عند احتياج multi-clinic فعلي |
| ASM-005 | ترخيص seats وأطباء ووحدات، وتفعيل offline QR | قبل اختيار سياسة التسعير النهائية |
| ASM-006 | أسعار/ضرائب/عملات قابلة للتهيئة حسب السوق؛ لا فرض تشريع دولة بعينها | قبل البيع لأول بلد |
| ASM-007 | تقويم مفتوح المصدر أولاً مع تجربة 2–10 أطباء و20 كرسي/غرفة | Spike الجدولة |
| ASM-008 | مخطط Dental 2D قبل أي 3D | مراجعة طبيب/اختبار استخدام |
| ASM-009 | لا ذكاء اصطناعي طبي آلي في النسخة الأولى | أي تغيير غرض طبي/قانوني |

## 3. فهرس المتطلبات المؤجلة المخطط لها (P2)

**P2 لا تعني dropped.** كل متطلب يبقى في `requirements_catalog.json`/`requirements_progress.json` مع الحالة Planned، وينفذ في مرحلة Growth أو Future حسب المجال:

- Periodontal full chart، orthodontics، implants، dental labs، inventory، doctor commissions، advanced cash sessions، multi-branch.
- Other specialty modules (cardiology/ophthalmology/gynecology/pediatrics/etc.) built via SDK.
- DICOM PACS, FHIR integration, insurance claims, patient mobile portal, appointment notifications عبر مزود خارجي عند موافقة العميل.
- VPS gateway optional, WAN/hybrid sync, encrypted cross-site replication, remote observability privacy-safe.
- Incremental backup encryption with full snapshot periodically, more storage providers.
- Advanced Analytics/KPIs if role authorized, export interoperability/HL7-specific mappings.

## 4. الفجوات التي تحتاج مراجعة لاحقة دون سؤال يوقف التنفيذ

| Open issue | Default for now | Decision evidence |
|---|---|---|
| العلامة التجارية واسم المنتج | `Clinic Platform` placeholder | موافقة المستخدم على اسم تجاري قبل نشر MVP |
| الحد الأدنى لإصدارات Android/Windows | مصفوفة تعتمد بعد PoC على جهازين فعليين | `hardware_compatibility.md` |
| سوق البيع الأول | تخزين قانوني قابل للتخصيص، لا فرض قانون بلد | `country_compliance_checklist.md` |
| مستويات تجديد الرخص وتفاصيل الأسعار | حقل `valid_until` يدعم دائم/مدة؛ لا سعر hardcoded | نموذج مبيعات تجاري |
| صاحب مفاتيح Recovery Kit البديلة | Owner-managed offline recovery فقط | اختبار Legal & Owner recovery |
| صيغة/أجهزة DICOM المتوافقة | الملفات JPEG/PNG/PDF أساسية، DICOM adapter مؤجل | عينات بيانات غير سريرية ومراجعة الترخيص |
| عدد فروع المركز الكبير | Schema يدعمه، UI متعدد الفروع P2 | اختبار العميل المؤسسي |
| تسوية المالية الدقيقة بحسب البلد | مبالغ/قيود قابلة للتكوين مع السجلات المدققة | مراجعة محاسب حسب التشريع |
| الطابعات الحرارية | PDF/A4 أولاً؛ حرارية حسب plugin hardware test | طابعة اختبارية فعلية |
| مستوى اعتماد التوقيع الإلكتروني | موافقة مؤرخة مع سند، ولا ادعاء توقيع قانوني معتمد عالمياً | القانون المحلي والسوق المستهدف |

## 5. قواعد حل التعارضات

1. إذا تعارض طلب جديد مع قرار معتمد، سجّل `CHANGE_REQUEST.md` مع السبب والأثر والبدائل قبل التغيير.
2. إذا اختيرت مكتبة لا تدعم Windows/Android، استخدم Adapter بديل مع PoC ولا تلغ الميزة.
3. إذا تعارض السرعة مع سلامة PHI/المال، الأمان والاتساق أولوية؛ يجوز UI Optimistic فقط مع حالة Pending غير مضللة.
4. إذا لم تكف المرحلة الحالية للتنفيذ، اكتب `Deferred` في تقدم المتطلبات دون حذفها.
5. نهاية كل مرحلة يجب أن تذكر المتطلبات غير المنفذة صراحة، وليس «كل شيء مكتمل».


---

<!-- SOURCE: docs/12_OPERATIONS_AND_SUPPORT.md -->

# 12 — التشغيل التجاري، الدعم، التثبيت، التحديث والاستيراد

## 1. رحلة تسليم العيادة الجديدة

- بيع باقة: تسجيل Order في License Issuer خارج بيانات المرضى، ضبط حد الأطباء/المستخدمين/الأجهزة/الوحدات، إصدار شهادة توقيع.
- تزويد الطبيب Windows installer/Android APK/AAB رسمي موقع + رمز تفعيل أو QR + تعليمات Recovery Kit.
- الطبيب ينشئ العيادة ويحدد المنطقة الزمنية/العملة والاسم/الشعار وسياسة النسخ.
- إضافة السكرتيرة/المحاسب عبر QR موقّت وموافقة مكتوبة/مسجلة بالبرنامج من المالك؛ صلاحيات افتراضية محدودة.
- اختبار اتصال/فتح مريض وهمي/موعد/فاتورة/نسخة محلية وإرشادات الاستعادة؛ عدم بدء الإنتاج قبل مرور checklist.
- لو تعذر mDNS بسبب Client Isolation/VLAN، إرشاد الفني لاستعمال رمز QR/manual endpoint الموثق مع الشبكة، من دون جعل الجهاز يثق بأي endpoint.

## 2. شاشة الحالة التشغيلية

Owner Dashboard يتضمن بطاقات: إصدار التطبيق، نسخة DB، آخر Backup verified، سعة التخزين، حالة encryption، الأجهزة الموثوقة، آخر sync checkpoint، Queue pending، تعارضات، تاريخ الرخصة، إصدارات الأجهزة المختلفين، آخر نجاح Drive. لا تعرض PHI لمشرف دعم خارجي.

## 3. الدعم الفني والخصوصية

- لا كلمة مرور مخفية/Backdoor على أجهزة العملاء.
- وضع دعم يتم فتحه بإذن Owner زمني، صلاحيات محددة وتدقيق كامل.
- Diagnostic Bundle مشفر/منقح، يتضمن أخطاء/versions/performance وليس بيانات مرضى.
- سجلات أخطاء قصيرة العمر قابلة للضبط، والحد الأدنى لجمع القياسات.
- تحديثات موقعة ومصادر معتمدة مع رفض package tampering، وملفات release notes بالعربية.

## 4. ترقية العميل لإضافة محاسب

**سيناريو قبول تجاري ملزم:**
1. الترخيص الحالي `max_active_users=2`, `max_registered_devices=2`, `max_doctors=1`.
2. صاحب العيادة يطلب إضافة Accountant وثالث جهاز (إن وجد).
3. License Issuer يصدر رخصة revision أعلى مع 3 مستخدمين و3 أجهزة، مع نفس clinic_id.
4. التطبيق يتحقق ويحدّث `license_certificates`/features فقط ضمن ترحيل حالة الرخصة.
5. الطبيب ينشئ الحساب مع صلاحيات المالية وفق ملف role وليس افتراض أنه يرى كل العيادة.
6. الأجهزة القائمة والمرضى والزيارات والفواتير والمرفقات لا تُعدّل؛ تجري Test hashes/record count قبل/بعد.
7. يربط المحاسب جهازه أو يستخدم جهازاً مشتركاً بحسابه إن سمحت seat policy.

## 5. الاستيراد والتصدير

- استيراد CSV/Excel للمرضى والمواعيد السابقة **من ملفات العميل التي يملك حق استخدامها**، عبر Wizard mapping، Preview، validation، duplicate detection، transaction وUndo/compensating actions.
- القواعد: لا استيراد مرضى في Clinic غير مرخص، لا ملفات غير مشفرة في مجلد temp بعد انتهاء import، لا كتابات بيانات سريرية مفترضة دون توثيق.
- استيراد من أنظمة أخرى عبر adapters لاحقاً بعد مقارنة Schema/Consent.
- Export وفق صلاحية المستخدم والحد الأدنى اللازم؛ PDF وCSV وربما XLSX، مع metadata المعالجة وAudit trail.
- إخراج طبي للسجلات وقت انتهاء الترخيص وفق سياسة تصدير لا تُرهن باستمرار الاشتراك.

## 6. التحديثات

- قبل كل Release: Backup signed/versioned، Migration tests، طباعة عربية، LAN protocol compatibility، Android foreground/background اختبار.
- Windows installer Signed، Android APK/AAB Signed؛ إدارة مفاتيح التوقيع خارج المستودع.
- إمكان Rollback للكود فقط إذا DB/version توافق؛ لا downgrade قاعدة بيانات مضرة.
- فعّل staged rollout محدود ثم نشر واسع إذا نفذت Pilot tests.
- إذا الأجهزة على إصدارات مختلفة، التطبيق يوضح ذلك ويمنع الأوامر غير المتوافقة حتى التحديث، بدلاً من silent protocol corruption.

## 7. الامتثال والتعاقد

- سياسة خصوصية وتعيين Controller/Processor ومسؤوليات دعم، قواعد الاحتفاظ والنسخ والموافقة وحقوق استخراج البيانات حسب البلد.
- مراجعة الغرض المقصود للتطبيق: أداة سجلات وإدارة وليست منظومة تشخيص/توصية آلية؛ أي تغيير في الغرض يتطلب مراجعة تصنيف الأجهزة الطبية حيث ينطبق.
- تحديد شرط إصدار/تجديد/نقل/إنهاء تراخيص واضح في العقد؛ لا استيلاء على بيانات المريض بسبب خلاف تجاري.
- عقد دعم يوضح متطلبات اتصال العميل والنسخ وإدارة عبارات الاسترداد، والحدود الواقعية لتشغيل أجهزة Android في الخلفية.

## 8. قائمة تسليم لأول عيادة اختبارية

- [ ] نسخة موقعة على Windows وAndroid وتوافق نظامين فعليين
- [ ] حساب المالك وRecovery Kit ونسخة اختبار ناجحة
- [ ] السكرتيرة لا ترى PHI غير مصرّح وتستطيع استخدام المواعيد
- [ ] أجهزة مزامنة Online/Offline وConflict موثق
- [ ] تجربة حجزين متعارضين ومنع تأكيدهما معاً
- [ ] تجربة دفع مكرر ومنع المضاعفة
- [ ] 20 مريضاً وهمياً وملفات أسنان ومواعيد وعلاجات وأشعة
- [ ] طباعة وصفة وفاتورة تقرير بالعربية وأرقام إنكليزية
- [ ] Google Drive Backup/Restore ورخصة نقل جهاز جديد
- [ ] دليل مستخدم عربي وخط اتصال دعم وخطة خروج/تصدير


---

<!-- SOURCE: docs/13_REQUIREMENTS_MATRIX.md -->

# 13 — مصفوفة تتبع المتطلبات (Generated)

هذه المصفوفة **مشتقة** من `schemas/requirements_catalog.json`؛ اختبارات الربط مؤشرات بدء وليست دليلاً على التنفيذ. يُحفظ دليل التنفيذ في `schemas/requirements_progress.json`.

| Requirement | Priority | Phase | Design/Detail | Acceptance reference |
|---|---|---|---|---|
| `REQ-PLAT-001` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-002` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-003` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-004` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-005` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-006` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-007` | P1 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-008` | P1 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-009` | P2 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-PLAT-010` | P0 | P0-P2 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-024 |
| `REQ-SET-001` | P0 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-002` | P0 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-003` | P0 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-004` | P0 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-005` | P0 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-006` | P1 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-007` | P0 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-SET-008` | P1 | P1-P3 | `docs/01_ARCHITECTURE_AND_TOPOLOGY.md` | ACC-001, ACC-002, ACC-026 |
| `REQ-AUTH-001` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-002` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-003` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-004` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-005` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-006` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-007` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-008` | P1 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-009` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-010` | P0 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-AUTH-011` | P1 | P1-P3 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-003, ACC-004, ACC-023 |
| `REQ-PAT-001` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-002` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-003` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-004` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-005` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-006` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-007` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-008` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-009` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-010` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-011` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-012` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-PAT-013` | P1 | P3 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-007, ACC-008, ACC-013, ACC-022 |
| `REQ-DEN-001` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-002` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-003` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-004` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-005` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-006` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-007` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-008` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-009` | P2 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-010` | P2 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-DEN-011` | P1 | P5 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-009, ACC-010, DEN-001 |
| `REQ-INP-001` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-002` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-003` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-004` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-005` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-006` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-007` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-008` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-009` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-INP-010` | P1 | P3 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-007, ACC-016, ACC-027 |
| `REQ-FIN-001` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-002` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-003` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-004` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-005` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-006` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-007` | P2 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-008` | P2 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-FIN-009` | P1 | P3-P5 | `docs/02_DATA_MODEL_AND_RULES.md` | ACC-005, ACC-012 |
| `REQ-DOC-001` | P1 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-DOC-002` | P1 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-DOC-003` | P1 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-DOC-004` | P1 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-DOC-005` | P1 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-DOC-006` | P1 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-DOC-007` | P2 | P3-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-021, ACC-029 |
| `REQ-SYN-001` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-002` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-003` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-004` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-005` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-006` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-007` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-008` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-009` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-010` | P1 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-011` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-SYN-012` | P0 | P2 | `docs/03_SYNC_PROTOCOL.md` | ACC-011, ACC-012, ACC-017, ACC-025 |
| `REQ-LIC-001` | P0 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-002` | P0 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-003` | P0 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-004` | P1 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-005` | P0 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-006` | P0 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-007` | P1 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-008` | P0 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-LIC-009` | P1 | P4 | `docs/04_SECURITY_PERMISSIONS_LICENSING.md` | ACC-005, ACC-006, ACC-020 |
| `REQ-BKP-001` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-002` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-003` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-004` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-005` | P1 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-006` | P1 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-007` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-008` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-009` | P0 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-BKP-010` | P1 | P4 | `docs/05_BACKUP_DRIVE_RECOVERY.md` | ACC-014, ACC-015, ACC-019 |
| `REQ-UX-001` | P0 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-002` | P0 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-003` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-004` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-005` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-006` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-007` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-008` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-UX-009` | P1 | P0-P5 | `docs/07_DESIGN_SYSTEM_AND_SCREENS.md` | ACC-016, ACC-028 |
| `REQ-MOD-001` | P0 | P0-P7 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-030 |
| `REQ-MOD-002` | P0 | P0-P7 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-030 |
| `REQ-MOD-003` | P1 | P0-P7 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-030 |
| `REQ-MOD-004` | P1 | P0-P7 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-030 |
| `REQ-MOD-005` | P2 | P0-P7 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-030 |
| `REQ-MOD-006` | P0 | P0-P7 | `docs/06_DENTAL_AND_SPECIALTIES.md` | ACC-030 |
| `REQ-NFR-001` | P0 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-002` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-003` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-004` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-005` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-006` | P0 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-007` | P0 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-008` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-009` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-010` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-011` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-012` | P0 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-013` | P0 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-014` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |
| `REQ-NFR-015` | P1 | P0-P6 | `docs/10_TEST_STRATEGY.md` | PERF-001, ACC-025, SEC-001 |

**Count:** 140 requirements. All currently `Planned`, not claimed implemented.


---

<!-- SOURCE: docs/14_CHANGE_REQUEST_TEMPLATE.md -->

# نموذج رسمي لتعديل خط الأساس (Change Request)

لا تستخدم هذا الملف لتجاوز المتطلبات؛ انسخه إلى `docs/changes/CR-YYYY-NNN.md` واملأه مع موافقة مالك المنتج.

| Field | Required content |
|---|---|
| CR ID | CR-YYYY-NNN |
| Date / requested by | تاريخ وطلب |
| Old requirement IDs | قائمة REQ-... الأصلية |
| Proposed new requirement | نص واضح ذو معيار قبول |
| Reason | الضرورة والبديل |
| Compatibility impact | Windows/Android, sync protocol, schema, backups |
| Clinical impact | records, consent, audit, PHI |
| Commercial impact | license, modules, pricing |
| Security impact | access, keys, encryption, threat model |
| Migration plan | upgrade/rollback/recovery |
| Test updates | ACC/SYNC/BKP/SEC IDs |
| Approval | owner approval with date |

**قاعدة:** لا حذف نهائي لأي REQ ID؛ إذا أصبح غير مناسب يوسم `Superseded`, ويربط بـCR والبديل المعتمد.
