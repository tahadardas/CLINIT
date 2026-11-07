import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Cloud, 
  CloudCheck, 
  Database, 
  HardDrive, 
  Key, 
  Laptop, 
  Lock, 
  Radio, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Tablet, 
  Upload, 
  Wifi 
} from 'lucide-react';
import { ClinicDevice, SyncState, UserAccount } from '../types/clinic';
import { MOCK_DEVICES, MOCK_SYNC_STATE } from '../data/mockData';

interface SyncBackupViewProps {
  currentUser: UserAccount;
  isOnline: boolean;
  onToggleOnline: () => void;
}

export const SyncBackupView: React.FC<SyncBackupViewProps> = ({
  currentUser,
  isOnline,
  onToggleOnline
}) => {
  const [syncState, setSyncState] = useState<SyncState>(MOCK_SYNC_STATE);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupFile, setLastBackupFile] = useState<string | null>(
    'clinic_backup_20261107_094000.clinicbak'
  );
  const [backupSuccessHash, setBackupSuccessHash] = useState<string | null>(
    'SHA256: 8f4a9b23c9110d984eef1092a3487192837bc901ef'
  );
  const [isDriveConnected, setIsDriveConnected] = useState(true);

  const handleCreateEncryptedBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const filename = `clinic_backup_20261107_${Date.now().toString().slice(-6)}.clinicbak`;
      setLastBackupFile(filename);
      setBackupSuccessHash(`SHA256: ${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">مزامنة الشبكة المحلية (LAN) والنسخ الاحتياطي المشفر</h2>
          <p className="text-xs text-slate-500">
            تشغيل مستقل دون Node.js ودون خادم إجباري — اكتشاف آمن وتبادل مشفر بين الأجهزة
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateEncryptedBackup}
          disabled={isBackingUp}
          className="flex items-center gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0d6861] text-white px-3.5 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {isBackingUp ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          <span>{isBackingUp ? 'جاري ضغط وتشفير القاعدة...' : 'إنشاء نسخة احتياطية مشفرة (.clinicbak)'}</span>
        </button>
      </div>

      {/* LAN Network & Coordinator Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Coordinator State */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>منسق العمليات (Coordinator):</span>
            <Radio className="w-4 h-4 text-teal-600" />
          </div>
          <div className="font-bold text-sm text-slate-900">
            {syncState.coordinator_name}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Epoch #{syncState.epoch} · Sequence #{syncState.sequence}
          </div>
        </div>

        {/* Card 2: Outbox & Inbox State */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>طابور الرسائل (Outbox / Inbox):</span>
            <RefreshCw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-bold text-sm text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>متطابق ومتزامن كلياً</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Outbox Pending: {syncState.outbox_pending_count} · Inbox Dedup: {syncState.inbox_received_count}
          </div>
        </div>

        {/* Card 3: Cloud Mirror (Google Drive) */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE5E9] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Google Drive (مجلد العيادة الآمن):</span>
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>مرتبط بحساب العيادة الرسمي</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Scope: drive.file (مشفر قبل الرفع)
          </div>
        </div>
      </div>

      {/* Connected Devices Table (REQ-SYN-001 & REQ-SYN-002) */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-[#DCE5E9] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900">أجهزة العيادة المقترنة والموثوقة (Device Registry)</h3>
            <p className="text-[11px] text-slate-500">
              تبادل مفاتيح مشفرة ومصادقة طرفية ثنائية (Mutual Auth) عبر شبكة LAN
            </p>
          </div>
          <span className="text-xs font-mono text-teal-800 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">
            {MOCK_DEVICES.length} أجهزة مرخصة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">اسم الجهاز والمنصة</th>
                <th className="py-2.5 px-4">عنوان IP المحلي</th>
                <th className="py-2.5 px-4">بصمة المفتاح العام (Key Fingerprint)</th>
                <th className="py-2.5 px-4">الدور الشبكي</th>
                <th className="py-2.5 px-4">الغرفة المخصصة</th>
                <th className="py-2.5 px-4">آخر ظهور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {MOCK_DEVICES.map(device => {
                const isWindows = device.platform === 'windows';
                return (
                  <tr key={device.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isWindows ? (
                          <Laptop className="w-4 h-4 text-slate-700" />
                        ) : (
                          <Tablet className="w-4 h-4 text-teal-700" />
                        )}
                        <span className="font-bold text-slate-900">{device.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {device.ip_address}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {device.public_key_fingerprint}
                    </td>
                    <td className="py-3 px-4">
                      {device.is_coordinator ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300">
                          منسق رئيسي (Coordinator)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          نظير موثوق (Peer)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {device.assigned_room}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-emerald-600 font-medium">
                      {device.last_seen}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encrypted Backup Pipeline Specifications (REQ-BKP-001) */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#0F766E]" />
            <h3 className="font-bold text-xs text-slate-900">
              معمارية النسخ الاحتياطي المشفر وتنسيق الأرشيف (.clinicbak Format v1)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            AEAD AES-256-GCM + Zstd Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800">قواعد الأمان وعدم تسريب البيانات (Zero Leak):</h4>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed text-[11px]">
              <li>لا يتم نسخ قاعدة البيانات النشطة بمجرد نسخ الملف؛ يتم استخدام SQLite Online Backup API.</li>
              <li>الأرشيف لا يُفتح ببرامج ZIP عادية، ولا يوضع المفتاح الصريح داخل الملف نهائياً.</li>
              <li>كل جزء يُشفر بـ AEAD Nonce فريد لمنع هجمات التكرار، مع توقيع Hash manifest.</li>
              <li>الاستعادة تجري داخل بيئة معزولة Sandbox وفحص سلامة التراكيب قبل الاستبدال.</li>
            </ul>
          </div>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800">آخر نسخة احتياطية تم فحصها واعتمادها:</h4>
            {lastBackupFile && (
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-teal-900 font-bold truncate">الملف: {lastBackupFile}</div>
                <div className="text-slate-500 break-all">{backupSuccessHash}</div>
                <div className="text-emerald-700 text-[10px] font-sans font-medium pt-1">
                  ✓ تم التحقق من تماسك الجداول والمرفقات بنجاح (Verified Consistent)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
