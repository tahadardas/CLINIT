import { Appointment } from '../types/clinic';

/**
 * Normalizes Arabic text for tolerant search (REQ-INP-006):
 * Replaces variants of alef, teh marbuta, removes diacritics.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alef variants
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Teh Marbuta to Heh
    .replace(/ة/g, 'ه')
    // Normalize Yeh variants
    .replace(/[ىي]/g, 'ي');
}

export function searchMatches(query: string, ...targets: (string | undefined)[]): boolean {
  if (!query.trim()) return true;
  const normalizedQuery = normalizeArabicText(query);
  return targets.some(target => {
    if (!target) return false;
    const normalizedTarget = normalizeArabicText(target);
    return normalizedTarget.includes(normalizedQuery);
  });
}

/**
 * Detects overlapping appointments on the same practitioner or chair (REQ-PAT-009)
 */
export function detectAppointmentConflict(
  existingAppointments: Appointment[],
  newStart: string,
  newEnd: string,
  doctorId: string,
  chairId: string,
  excludeAppointmentId?: string
): { hasConflict: boolean; reason?: string } {
  const start = new Date(newStart).getTime();
  const end = new Date(newEnd).getTime();

  for (const app of existingAppointments) {
    if (excludeAppointmentId && app.id === excludeAppointmentId) continue;
    if (app.status === 'cancelled') continue;

    const appStart = new Date(app.start_time).getTime();
    const appEnd = new Date(app.end_time).getTime();

    // Check time intersection: (StartA < EndB) and (EndA > StartB)
    const isOverlapping = start < appEnd && end > appStart;

    if (isOverlapping) {
      if (app.doctor_id === doctorId) {
        return {
          hasConflict: true,
          reason: `تعارض مع موعد الطبيب (${app.doctor_name}) للمريض ${app.patient_name}`
        };
      }
      if (app.chair_id === chairId) {
        return {
          hasConflict: true,
          reason: `تعارض على نفس الكرسي (${app.chair_name}) محجوز للمريض ${app.patient_name}`
        };
      }
    }
  }

  return { hasConflict: false };
}
