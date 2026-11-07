import React from 'react';
import { Search, Printer, Shield, Wifi, WifiOff, Lock, Sparkles, CheckSquare } from 'lucide-react';
import { UserAccount } from '../types/clinic';
import { canViewConfidentialPHI } from '../domain/permissions';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: UserAccount;
  isOnline: boolean;
  onToggleOnline: () => void;
  onPrint?: () => void;
  onOpenFirstRun?: () => void;
  onOpenDiagnostics?: () => void;
  onLockScreen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  currentUser,
  isOnline,
  onToggleOnline,
  onPrint,
  onOpenFirstRun,
  onOpenDiagnostics,
  onLockScreen
}) => {
  const hasPHI = canViewConfidentialPHI(currentUser.role);

  return (
    <header className="h-16 bg-white border-b border-[#DCE5E9] px-6 flex items-center justify-between gap-4 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Title & Context */}
      <div className="min-w-0">
        <h2 className="text-base font-bold text-[#1E293B] truncate tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-500 truncate">{subtitle}</p>
        )}
      </div>

      {/* Global Patient / Record Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="بحث سريع برقم الملف، اسم المريض أو رقم الهاتف (تطبيع عربي)..."
            className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-[#DCE5E9] rounded-lg focus:outline-none focus:border-[#0F766E] focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Security Status & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* PHI Security Indicator */}
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${
          hasPHI 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-[11px]">
            {hasPHI ? 'مصرح بالملف الطبي الكامل' : 'محجوب: بيانات PHI الحساسة'}
          </span>
        </div>

        {/* LAN Offline / Online simulator toggle */}
        <button
          type="button"
          onClick={onToggleOnline}
          title={isOnline ? 'الشبكة متصلة — انقر لاختبار وضع عدم الاتصال (Offline)' : 'وضع العمل المحلي المنفصل — انقر للمزامنة'}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
            isOnline 
              ? 'bg-teal-50 hover:bg-teal-100 text-[#0F766E] border-teal-200' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-teal-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
          <span className="font-medium text-[11px]">{isOnline ? 'LAN متصل' : 'Offline محلي'}</span>
        </button>

        {/* First-Run Setup Wizard Launcher */}
        {onOpenFirstRun && (
          <button
            type="button"
            onClick={onOpenFirstRun}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0F766E] transition-colors font-medium"
            title="فتح معالج التهيئة والتشغيل الأولي (First-Run Setup)"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-[11px] font-bold">معالج التهيئة</span>
          </button>
        )}

        {/* Preflight Diagnostics Inspector */}
        {onOpenDiagnostics && (
          <button
            type="button"
            onClick={onOpenDiagnostics}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            title="فحص الجاهزية والتحقق للإنتاج (Production Pre-flight)"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">فحص الجاهزية</span>
          </button>
        )}

        {/* Lock Station Button */}
        {onLockScreen && (
          <button
            type="button"
            onClick={onLockScreen}
            className="p-1.5 rounded-lg border border-[#DCE5E9] text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 transition-colors"
            title="قفل الشاشة السريرية (Lock Station)"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Print Button */}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="p-1.5 rounded-lg border border-[#DCE5E9] text-slate-600 hover:text-[#0F766E] hover:bg-slate-50 transition-colors"
            title="طباعة تقرير الواجهة الحالية (A4 RTL)"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
