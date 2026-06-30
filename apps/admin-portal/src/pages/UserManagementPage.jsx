import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { 
  Loader2, 
  User, 
  Search, 
  Ban, 
  CheckCircle,
  FileX,
  Mail,
  Calendar,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const navigate = useNavigate();

  useEffect(() => {
    if (roleParam === 'student' || roleParam === 'recruiter' || roleParam === 'admin') {
      setRoleFilter(roleParam);
    } else {
      setRoleFilter('all');
    }
  }, [roleParam]);

  async function loadUsers() {
    try {
      const res = await apiClient('/users?limit=100');
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error('Failed to load user list:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);



  // Filters
  const filteredUsers = users.filter((u) => {
    // Exclude administrators from directory
    if (u.role === 'admin') return false;

    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto mt-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black text-blue-400 mt-1">
            User Management
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed ">
            Configure access boundaries, review recruiter/student profiles, suspend logins, and regulate portfolio creation privileges.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-xs font-bold leading-relaxed ${
          message.type === 'success' 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          {/* <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" /> */}
          <input
            type="text"
            placeholder="🔍︎ Search accounts by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
        </div>

        {/* Role Filters */}
        <div className="flex gap-1.5 self-stretch md:self-auto overflow-x-auto">
          {['all', 'student', 'recruiter'].map((role) => (
            <button
              key={role}
              onClick={() => setSearchParams(role === 'all' ? {} : { role })}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all select-none ${
                roleFilter === role 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table Grid - Full Width */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Platform Accounts ({filteredUsers.length})</h2>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Directory</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <User className="h-12 w-12 text-slate-800 mx-auto mb-4" />
            <h3 className="font-bold text-sm text-slate-350">No matching user accounts</h3>
            <p className="text-xs text-slate-650 mt-1">Try tweaking your search keywords or role filters.</p>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {filteredUsers.map((item) => {
              return (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/users/${item.id}`)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:translate-y-[-1px] transition-all flex items-center justify-between shadow-lg group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Circular Avatar Container */}
                    <div 
                      className="rounded-full overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0"
                      style={{ width: '48px', height: '48px', minWidth: '48px' }}
                    >
                      {item.profile_picture_url ? (
                        <img src={item.profile_picture_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-lg font-bold text-slate-500">{item.name[0].toUpperCase()}</div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-bold text-slate-200 text-sm truncate group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-550 text-[11px] min-w-0">
                        <span className="truncate">{item.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: View Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/users/${item.id}`)}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold transition-all shadow-md leading-none active:scale-[0.98]"
                    >
                      <User className="h-4 w-4 text-slate-700 shrink-0" />
                      <span className="leading-none">View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
