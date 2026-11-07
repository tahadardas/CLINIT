import React from 'react';
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  Database, 
  FileText, 
  FolderLock, 
  KeyRound, 
  LayoutDashboard, 
  Radio, 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  Code2,
  ChevronDown
} from 'lucide-react';
import { UserAccount, UserRole } from '../types/clinic';
import { MOCK_USERS } from '../data/mockData';

export type NavItem = 
  | 'dashboard'
  | 'dental_chart'
  | 'patients'
  | 'schedule'
  | 'encounters'
  | 'billing'
  | 'permissions'
  | 'sync_backup'
  | 'licensing'
  | 'flutter_code';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  isOnline: boolean;
  clinicName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  isOnline,
  clinicName
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const navItems: { id: NavItem; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم والمتابعة', icon: LayoutDashboard },
    { id: 'dental_chart', label: 'مخطط الأسنان (FDI)', icon: Activity, badge: '32 سن' },
    { id: 'patients', label: 'دليل المرضى والملفات', icon: Users },
    { id: 'schedule', label: 'المواعيد وإدارة الكراسي', icon: Calendar, badge: '5 اليوم' },
    { id: 'encounters', label: 'الزيارات السريرية والوصفات', icon: Stethoscope },
    { id: 'billing', label: 'الفواتير والمقبوضات', icon: CreditCard },
    { id: 'permissions', label: 'الصلاحيات الدقيقة (RBAC)', icon: FolderLock },
    { id: 'sync_backup', label: 'مزامنة LAN والنسخ المشفر', icon: Radio },
    { id: 'licensing', label: 'التراخيص والمقاعد (Offline)', icon: KeyRound },
    { id: 'flutter_code', label: 'أكواد Flutter & Dart', icon: Code2, badge: 'SDK' }
  ];

  return (
    <aside className="w-72 bg-[#164E63] text-white flex flex-col h-screen shrink-0 border-l border-[#103D4D] select-none">
      {/* Brand & Clinic Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            CP
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm tracking-tight text-white truncate">
              {clinicName || 'عيادات النخبة لطب الأسنان'}
            </h1>
            <p className="text-xs text-teal-200/80 truncate">
              Clinic Platform — النواة الطبية
            </p>
          </div>
        </div>

        {/* User Switcher for RBAC demonstration */}
        <div className="mt-3 relative">
          <div className="text-[11px] text-teal-200/70 mb-1 flex items-center justify-between">
            <span>المستخدم الفعّال (محاكاة الصلاحيات):</span>
            <span className="text-teal-300 font-mono text-[10px] uppercase">{currentUser.role}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-full bg-[#103D4D] hover:bg-[#0c2f3c] text-white text-xs px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors border border-teal-500/20"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-[#0F766E] flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="text-right truncate">
                <div className="font-medium truncate">{currentUser.name}</div>
                <div className="text-[10px] text-teal-200/70 truncate">{currentUser.title}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-teal-300 shrink-0 mr-1" />
          </button>

          {showUserDropdown && (
            <div className="absolute top-full mt-1.5 right-0 left-0 bg-[#0c2f3c] border border-teal-500/30 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              <div className="px-2.5 py-1 text-[10px] text-teal-200/60 uppercase font-bold tracking-wider border-b border-white/5">
                اختر دوراً لاختبار الصلاحيات:
              </div>
              {MOCK_USERS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onSwitchUser(u);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    currentUser.id === u.id ? 'bg-[#0F766E] text-white' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-[10px] text-teal-200/70 block truncate">{u.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-teal-200 shrink-0 mr-1">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-teal-300'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-teal-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Local State */}
      <div className="p-3 border-t border-white/10 text-xs bg-[#103D4D]/60 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-teal-200/80 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            شبكة العيادة (LAN):
          </span>
          <span className="font-medium text-white">{isOnline ? 'متصل (Coordinator)' : 'محلي (Offline)'}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-teal-200/70">
          <span>قاعدة البيانات:</span>
          <span className="text-white font-mono text-[10px]">SQLiteMC (Encrypted)</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-teal-200/70">
          <span>رخصة العيادة:</span>
          <span className="text-white font-mono text-[10px]">Dental Pro · Rev 3</span>
        </div>
      </div>
    </aside>
  );
};
