import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateClinicProfile, 
  validateOwnerAccount, 
  validateRecoveryPassphrase, 
  validateLicenseToken,
  generateClinicId,
  runPreflightProductionCheck 
} from './setupValidator';

test('Setup Validator - Clinic Profile validation (REQ-SET-001)', () => {
  // 1. Invalid profile
  const invalidResult = validateClinicProfile({
    clinicName: '',
    medicalLicenseNo: '',
    phone: 'invalid',
    email: '',
    address: '',
    currency: '',
    timezone: '',
    primarySpecialty: 'dental',
    enabledModules: []
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.clinicName);
  assert.ok(invalidResult.errors.medicalLicenseNo);
  assert.ok(invalidResult.errors.phone);
  assert.ok(invalidResult.errors.currency);
  assert.ok(invalidResult.errors.timezone);
  assert.ok(invalidResult.errors.enabledModules);

  // 2. Valid profile
  const validResult = validateClinicProfile({
    clinicName: 'عيادات النخبة لطب الأسنان',
    medicalLicenseNo: 'MOH-RYD-8899',
    phone: '+966112233445',
    email: 'info@elite-clinic.com',
    address: 'الرياض - طريق الملك فهد',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    primarySpecialty: 'dental',
    enabledModules: ['dental_pro']
  });
  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('Setup Validator - Owner account and PIN validation (REQ-AUTH-003)', () => {
  // Invalid owner
  const invalid = validateOwnerAccount({
    fullName: '',
    doctorLicenseNo: '',
    email: 'doc@clinic.com',
    pin: '12' // too short
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.doctorLicenseNo);
  assert.ok(invalid.errors.pin);

  // Valid owner
  const valid = validateOwnerAccount({
    fullName: 'د. طارق الحكيم',
    doctorLicenseNo: 'DOC-55442',
    email: 'tariq@elite-clinic.com',
    pin: '2026'
  });
  assert.equal(valid.isValid, true);
});

test('Setup Validator - Disaster recovery passphrase and token (REQ-SET-007, REQ-LIC-001)', () => {
  // Short passphrase
  const shortPass = validateRecoveryPassphrase('dental clinic recovery');
  assert.equal(shortPass.isValid, false);
  assert.equal(shortPass.wordCount, 3);

  // Valid 6+ words passphrase
  const validPass = validateRecoveryPassphrase('falcon desert oasis silver olive cedar crystal summit');
  assert.equal(validPass.isValid, true);
  assert.equal(validPass.wordCount, 8);

  // Invalid license tokens
  assert.equal(validateLicenseToken('').isValid, false);
  assert.equal(validateLicenseToken('EXPIRED_TOKEN_KEY_12345').isValid, false);

  // Valid license token
  const validLic = validateLicenseToken('DENTAL-PRO-2026-ED25519-SIGNED-ENTERPRISE');
  assert.equal(validLic.isValid, true);
  assert.equal(validLic.planName, 'Dental Pro Enterprise');
  assert.equal(validLic.seats, 5);
});

test('Setup Validator - Clinic ID generator and Preflight diagnostics', () => {
  const cid1 = generateClinicId('CLN');
  const cid2 = generateClinicId('CLN');
  assert.notEqual(cid1, cid2);
  assert.ok(cid1.startsWith('CLN-'));

  const diagnostics = runPreflightProductionCheck({
    isConfigured: true,
    dbEncrypted: true,
    lanActive: true,
    licenseValid: true
  });
  assert.equal(diagnostics.length, 6);
  assert.ok(diagnostics.every(d => d.status === 'passed'));
});
