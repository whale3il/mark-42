import React from 'react';
import {
  LayoutDashboard,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  PieChart,
  Target,
  CalendarCheck,
  FileText,
  ShieldCheck,
  Headphones,
  ExternalLink,
  Layers
} from 'lucide-react';
import { USER_PROFILE } from '../data/mockData';

export type NavTab =
  | 'dashboard'
  | 'accounts'
  | 'transfers'
  | 'cards'
  | 'analytics'
  | 'goals'
  | 'bills'
  | 'statements'
  | 'security'
  | 'support';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDesignMode: boolean;
  setIsDesignMode: (val: boolean) => void;
  onOpenAdvisorModal: () => void;
  supportUnreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDesignMode,
  setIsDesignMode,
  onOpenAdvisorModal,
  supportUnreadCount = 0
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts & Vaults', icon: Landmark },
    { id: 'transfers', label: 'Transfers & Payees', icon: ArrowRightLeft },
    { id: 'cards', label: 'Cards & Controls', icon: CreditCard },
    { id: 'analytics', label: 'Spending Analytics', icon: PieChart },
    { id: 'goals', label: 'Goals & Budgets', icon: Target },
    { id: 'bills', label: 'Scheduled Bills', icon: CalendarCheck },
    { id: 'statements', label: 'Statements & Tax', icon: FileText },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'support', label: 'Support & Concierge', icon: Headphones, badge: supportUnreadCount },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-800/80 bg-neutral-950/60 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            Portfolio Management
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !isDesignMode;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isDesignMode) setIsDesignMode(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-neutral-100 border border-neutral-800 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500 text-neutral-950 font-bold">
                      {item.badge}
                    </span>
                  ) : item.id === 'support' ? (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Design System Spec Link */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            Design & Architecture
          </div>
          <button
            onClick={() => setIsDesignMode(!isDesignMode)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isDesignMode
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>UI Design Specs & Tokens</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
              v2.5
            </span>
          </button>
        </div>
      </div>

      {/* Relationship Manager Contact Card */}
      <div className="pt-4 border-t border-neutral-800/80">
        <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/90 text-xs">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
            <span>Private Wealth Partner</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="font-medium text-neutral-200">{USER_PROFILE.relationshipManager.name}</div>
          <div className="text-[11px] text-neutral-400 truncate">{USER_PROFILE.relationshipManager.title}</div>
          <button
            onClick={onOpenAdvisorModal}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-[11px] font-medium transition-colors border border-neutral-700/60"
          >
            <span>Live Support Desk</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};
