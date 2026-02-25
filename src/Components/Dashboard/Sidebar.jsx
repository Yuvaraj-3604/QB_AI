import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, CalendarDays, Users, Settings, BarChart3,
  Mail, HelpCircle, Plus, ChevronLeft, Trophy, Brain,
  Activity, ClipboardList, Ticket, Video
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/api/base44Client';

const HOST_MENU = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
  { icon: CalendarDays, label: 'Events', page: 'Events' },
  { icon: ClipboardList, label: 'Requests', page: 'HostRequests' },
  { icon: Users, label: 'Attendees', page: 'Attendees' },
  { icon: BarChart3, label: 'Analytics', page: 'Analytics' },
  { icon: Mail, label: 'Marketing', page: 'Marketing' },
  { icon: Trophy, label: 'Leaderboard', page: 'Leaderboard' },
  { icon: Settings, label: 'Settings', page: 'Settings' },
];

const ATTENDEE_MENU = [
  { icon: CalendarDays, label: 'Browse Events', page: 'Events' },
  { icon: Ticket, label: 'My Events', page: 'MyRequests' },
  { icon: Settings, label: 'Settings', page: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const user = api.auth.me();
  const isHost = user?.role === 'host';
  const menuItems = isHost ? HOST_MENU : ATTENDEE_MENU;

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          {!collapsed && <span className="font-bold text-xl">QuestBridge</span>}
        </Link>
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
          <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Role Badge + Quick Action */}
      {isHost && (
        <div className="px-4 pt-4">
          <Link to="/CreateEvent">
            <Button className={cn('w-full bg-cyan-500 hover:bg-cyan-600 transition-all', collapsed ? 'px-3' : 'px-4')}>
              <Plus className="w-5 h-5" />
              {!collapsed && <span className="ml-2">Create Event</span>}
            </Button>
          </Link>
        </div>
      )}
      {!isHost && !collapsed && (
        <div className="px-4 pt-4">
          <div className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full text-center">
            Attendee Account
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPath.includes(item.page);
          return (
            <Link key={item.page} to={createPageUrl(item.page)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              )}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role + Help footer */}
      <div className="p-4 border-t border-slate-800">
        {!collapsed && (
          <div className="mb-2 px-4 py-2">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-xs text-slate-300 font-medium truncate">{user?.email || ''}</p>
            <span className={`text-xs font-semibold ${isHost ? 'text-cyan-400' : 'text-purple-400'}`}>
              {isHost ? '⭐ Host' : '🎟 Attendee'}
            </span>
          </div>
        )}
        <Link
          to="/HelpSupport"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-slate-800 hover:text-white transition-all w-full"
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Help & Support</span>}
        </Link>
      </div>
    </aside>
  );
}
