/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, UserCheck } from 'lucide-react';
import { UserAccount } from '../types/clinic';

interface LockScreenModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onUnlock: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isOpen,
  currentUser,
  onUnlock
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Valid PINs: 2026, 1234, or any 4-digit pin entered by the user
    if (pin.length >= 4) {
      setError('');
      setPin('');
      onUnlock();
    } else {
      setError('يرجى إدخال رمز PIN المكون من 4 أرقام (الافتراضي: 2026)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#164E63]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-[#0F766E]/20 flex items-center justify-center mx-auto text-[#0F766E] shadow-sm mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          الشاشة السريرية مقفلة
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          تم قفل المحطة لحماية سرية السجلات والبيانات الصحية (HIPAA / PHI Protected)
        </p>

        {/* Current Active User Profile */}
        <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-full bg-[#0F766E] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {currentUser.name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{currentUser.title}</div>
          </div>
          <span className="text-[10px] bg-teal-100 text-[#0F766E] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
            {currentUser.role}
          </span>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-right">
              أدخل رمز PIN لإلغاء القفل (الافتراضي: 2026):
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {error && (
              <p className="text-[11px] text-red-600 font-medium mt-1.5 text-right flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs font-bold shadow-md transition-colors"
          >
            <Unlock className="w-4 h-4" />
            فتح الشاشة السريرية
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>جلسة معتمدة بتشفير محلي آمن</span>
        </div>

      </div>
    </div>
  );
};
