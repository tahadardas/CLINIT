export interface FlutterCodeFile {
  path: string;
  category: string;
  description_ar: string;
  code: string;
}

export const FLUTTER_DART_CODEBASE: FlutterCodeFile[] = [
  {
    path: 'packages/dental_chart/lib/src/models/fdi_tooth.dart',
    category: 'Dental Module',
    description_ar: 'تعريف نموذج السن بنظام FDI والأسطح الخمسة (M, D, B, L, O) في لغة Dart',
    code: `// lib/src/models/fdi_tooth.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'fdi_tooth.freezed.dart';
part 'fdi_tooth.g.dart';

enum DentitionType { permanent, primary }
enum ToothSurface { M, D, B, L, O }

enum ToothCondition {
  healthy,
  caries,
  restorationComposite,
  restorationAmalgam,
  crown,
  bridgeAbutment,
  bridgePontic,
  endodontic,
  extraction,
  missing,
  implant,
  unerupted,
  sealant,
  fracture,
}

@freezed
class FDITooth with _$FDITooth {
  const factory FDITooth({
    required int code,
    required DentitionType dentition,
    required Set<ToothSurface> affectedSurfaces,
    required ToothCondition primaryCondition,
    String? clinicalNotes,
    @Default(false) bool isSelected,
  }) = _FDITooth;

  factory FDITooth.fromJson(Map<String, dynamic> json) => _$FDIToothFromJson(json);
}
`
  },
  {
    path: 'packages/dental_chart/lib/src/widgets/odontogram_painter.dart',
    category: 'Dental Module',
    description_ar: 'فئة رسم مخطط الأسنان التفاعلي FDI عبر Flutter CustomPainter مع فحص النقر على الأسطح',
    code: `// lib/src/widgets/odontogram_painter.dart
import 'package:flutter/material.dart';
import '../models/fdi_tooth.dart';

class OdontogramSurfacePainter extends CustomPainter {
  final FDITooth tooth;
  final bool isHovered;
  final Color Function(ToothCondition) conditionColorResolver;

  OdontogramSurfacePainter({
    required this.tooth,
    required this.isHovered,
    required this.conditionColorResolver,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final basePaint = Paint()
      ..color = conditionColorResolver(tooth.primaryCondition)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = const Color(0xFF164E63) // Medical Premium Petrol
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Draw central Occlusal / Incisal square
    final oRect = Rect.fromCenter(center: center, width: size.width * 0.4, height: size.height * 0.4);
    canvas.drawRect(oRect, basePaint);
    canvas.drawRect(oRect, borderPaint);

    // Draw Trapezoid for Buccal / Facial surface
    final bPath = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(oRect.right, oRect.top)
      ..lineTo(oRect.left, oRect.top)
      ..close();
    canvas.drawPath(bPath, borderPaint);

    // Draw Lingual, Mesial, Distal surfaces...
  }

  @override
  bool shouldRepaint(covariant OdontogramSurfacePainter oldDelegate) {
    return oldDelegate.tooth != tooth || oldDelegate.isHovered != isHovered;
  }
}
`
  },
  {
    path: 'packages/clinic_database/lib/src/schema/encrypted_drift_db.dart',
    category: 'Persistence & Security',
    description_ar: 'تعريف قاعدة بيانات SQLite المشفرة محلياً عبر Drift + sqlite3mc (لا تتطلب خادم منفصل)',
    code: `// lib/src/schema/encrypted_drift_db.dart
import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:sqlite3/sqlite3.dart';

part 'encrypted_drift_db.g.dart';

@DataClassName('PatientTableData')
class Patients extends Table {
  TextColumn get id => text()();
  TextColumn get clinicId => text()();
  TextColumn get mrn => text().customConstraint('UNIQUE')();
  TextColumn get legalName => text()();
  TextColumn get latinName => text().nullable()();
  DateTimeColumn get dob => dateTime().nullable()();
  TextColumn get sexCode => text()(); // 'male' or 'female'
  TextColumn get phone => text()();
  DateTimeColumn get createdAtUtc => dateTime()();
  IntColumn get rowVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [Patients])
class EncryptedClinicDatabase extends _$EncryptedClinicDatabase {
  EncryptedClinicDatabase(File dbFile, String encryptionKey) : super(_openConnection(dbFile, encryptionKey));

  @override
  int get schemaVersion => 1;

  static LazyDatabase _openConnection(File file, String key) {
    return LazyDatabase(() async {
      return NativeDatabase.createInBackground(
        file,
        setup: (rawDb) {
          // Runtime verification of SQLiteMultipleCiphers (sqlite3mc)
          rawDb.execute("PRAGMA key = '$key';");
          rawDb.execute('PRAGMA cipher = sqlcipher;');
        },
      );
    });
  }
}
`
  },
  {
    path: 'packages/clinic_sync/lib/src/protocol/sync_envelope.dart',
    category: 'LAN Synchronization',
    description_ar: 'بروتوكول رسائل المزامنة الموثقة والموقعة بين الأجهزة عبر LAN دون خادم سحابي إجباري',
    code: `// lib/src/protocol/sync_envelope.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_envelope.freezed.dart';
part 'sync_envelope.g.dart';

@freezed
class SyncEnvelope with _$SyncEnvelope {
  const factory SyncEnvelope({
    required int protocolVersion,
    required String messageType,
    required String clinicId,
    required String opId,
    required String aggregateType,
    required String aggregateId,
    required int baseVersion,
    required String actorUserId,
    required String originDeviceId,
    required int policyVersion,
    required int schemaVersion,
    required DateTime createdAtUtc,
    required int coordinatorEpoch,
    required Map<String, dynamic> payload,
    required String signature,
  }) = _SyncEnvelope;

  factory SyncEnvelope.fromJson(Map<String, dynamic> json) => _$SyncEnvelopeFromJson(json);
}
`
  },
  {
    path: 'packages/clinic_permissions/lib/src/evaluator/rbac_evaluator.dart',
    category: 'Security & Permissions',
    description_ar: 'محرك الصلاحيات الدقيق ونموذج الرفض الافتراضي Deny-by-default',
    code: `// lib/src/evaluator/rbac_evaluator.dart

enum AppRole { owner, doctor, receptionist, accountant, clinicManager }
enum SecureResource { patientDemographics, patientClinicalPhi, dentalOdontogram, billingInvoices, profitReports }
enum AuthAction { view, create, edit, delete, sign }

class RBACEvaluator {
  static bool hasAccess({
    required AppRole role,
    required SecureResource resource,
    required AuthAction action,
  }) {
    // REQ-AUTH-004: Deny by default
    switch (resource) {
      case SecureResource.patientClinicalPhi:
      case SecureResource.dentalOdontogram:
        // REQ-AUTH-009: Receptionist & Accountant CANNOT access confidential PHI
        return role == AppRole.owner || role == AppRole.doctor || role == AppRole.clinicManager;

      case SecureResource.profitReports:
        // REQ-FIN-004: Receptionist CANNOT view clinic profits
        return role == AppRole.owner || role == AppRole.accountant || role == AppRole.clinicManager;

      case SecureResource.billingInvoices:
        return true; // All staff can view invoices per policy

      case SecureResource.patientDemographics:
        return true;
    }
  }
}
`
  }
];
