import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { 
  Users, 
  Briefcase, 
  ShieldAlert, 
  ChevronRight, 
  Loader2, 
  Clock, 
  ThumbsUp, 
  UserCheck, 
  AlertTriangle,
  History,
  FileCheck2,
  XOctagon
} from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          apiClient('/admin/stats'),
          apiClient('/admin/audit-logs?limit=5')
        ]);
        
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (logsRes.success && logsRes.data?.logs) {
          setAuditLogs(logsRes.data.logs);
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Active Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'blue',
      link: '/users?role=student',
      linkLabel: 'Manage students'
    },
    {
      title: 'Active Recruiters',
      value: stats?.totalRecruiters || 0,
      icon: UserCheck,
      color: 'emerald',
      link: '/users?role=recruiter',
      linkLabel: 'Manage recruiters'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingProjects || 0,
      icon: AlertTriangle,
      color: 'yellow',
      pulse: (stats?.pendingProjects || 0) > 0,
      link: '/projects?status=pending',
      linkLabel: 'Open approval queue'
    },
    {
      title: 'Approved Showcase',
      value: stats?.approvedProjects || 0,
      icon: FileCheck2,
      color: 'indigo',
      link: '/projects?status=approved',
      linkLabel: 'View public gallery'
    },
    {
      title: 'Rejected Submissions',
      value: stats?.rejectedProjects || 0,
      icon: XOctagon,
      color: 'red',
      link: '/projects?status=rejected',
      linkLabel: 'Moderate list'
    },
    {
      title: 'Likes & Follows',
      value: (stats?.totalLikes || 0) + (stats?.totalFollowers || 0),
      icon: ThumbsUp,
      color: 'zinc',
      link: null,
      linkLabel: `${stats?.totalLikes || 0} Likes • ${stats?.totalFollowers || 0} Follows`
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto mt-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
        
          <h1 className="text-3xl font-black text-blue-400 mt-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Real-time analytics, user access control, compliance actions, and content governance logs.
          </p>
        </div>
      </div>

      {/* Action Banner for Pending Reviews */}
      {stats?.pendingProjects > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-950/20 via-slate-900 to-slate-900 border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <div>
              <h3 className="font-bold text-sm text-yellow-500">Pending Submissions Awaiting Approval</h3>
              <p className="text-xs text-slate-400 mt-0.5">There are {stats.pendingProjects} student portfolio projects pending moderator review.</p>
            </div>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-black transition-all active:scale-[0.97] shadow-lg shadow-yellow-500/10"
          >
            <span>Moderate Now</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          const isYellow = card.color === 'yellow';
          const isRed = card.color === 'red';
          const isEmerald = card.color === 'emerald';
          const isIndigo = card.color === 'indigo';
          const isBlue = card.color === 'blue';

          const colorClass = isBlue 
            ? 'bg-blue-500/5 border-blue-500/10 text-blue-400' 
            : isEmerald 
              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
              : isYellow 
                ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-400' 
                : isIndigo 
                  ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400' 
                  : isRed 
                    ? 'bg-red-500/5 border-red-500/10 text-red-400' 
                    : 'bg-slate-800/20 border-slate-800 text-slate-400';

          return (
            <div 
              key={idx} 
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">{card.title}</p>
                  <h3 className="text-3xl font-extrabold mt-1.5 text-white tracking-tight">{card.value}</h3>
                </div>
                <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className={`h-5 w-5 ${card.pulse ? 'animate-bounce' : ''}`} />
                </div>
              </div>
              
              <div className="border-t border-slate-800/60 pt-4 mt-2">
                {card.link ? (
                  <Link to={card.link} className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <span>{card.linkLabel}</span>
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">{card.linkLabel}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Bottom Section: Recent Activity & Guidelines */}
      <div className="mt-4 space-y-8 gap-6">
        
        {/* Recent Activity Audit Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-400" />
              <h2 className="font-bold text-base text-white">Recent Administrative Actions</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Audit Log</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Clock className="h-8 w-8 text-slate-800 mx-auto mb-3" />
              <h3 className="font-medium text-slate-400 text-xs">No admin logs recorded yet</h3>
              <p className="text-[10px] text-slate-600 mt-1">Actions like role edits or project bans will log here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start gap-4 mt-4">
                  <div className="h-8 w-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-slate-200">
                        {log.admin_name}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded ">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{log.reason}</p>
                    <span className="text-[9px] text-slate-600 font-semibold block mt-1.5">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
