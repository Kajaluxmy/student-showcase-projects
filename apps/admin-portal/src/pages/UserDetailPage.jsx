import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../api/apiClient';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  Check, 
  X, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Ban, 
  UserCheck, 
  CheckCircle, 
  FileX, 
  ThumbsUp, 
  Users, 
  FolderGit,
  AlertTriangle,
  Github,
  Globe,
  User,
  Fingerprint,
  Building2,
  Activity
} from 'lucide-react';

const getDisplayUserAvatar = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return getImageUrl(url);
};

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState(null);

  // Rejection modal state for projects moderated from user profile
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectProjectId, setRejectProjectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  async function loadUserDetails() {
    setLoading(true);
    try {
      const res = await apiClient(`/admin/users/${id}`);
      if (res.success && res.data) {
        setProfile(res.data.user);
        setProjects(res.data.projects || []);
        setStats(res.data.stats);
        setFollowers(res.data.followers || []);
        setFollowing(res.data.following || []);
      } else {
        setMessage({ type: 'error', text: res.error?.message || 'Failed to load user details.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error occurred connecting to the backend.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserDetails();
  }, [id]);

  const handleRoleChange = async (newRole) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiClient(`/users/${id}/role`, {
        method: 'PUT',
        body: { role: newRole }
      });
      if (res.success) {
        setMessage({ type: 'success', text: `Successfully changed user role to ${newRole}.` });
        setProfile(prev => ({ ...prev, role: newRole }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiClient(`/admin/users/${id}/status`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      if (res.success) {
        setMessage({ type: 'success', text: `Account status updated to ${newStatus}.` });
        setProfile(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrivilegeChange = async (disabled) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiClient(`/admin/users/${id}/privilege`, {
        method: 'PUT',
        body: { disabled }
      });
      if (res.success) {
        setMessage({ 
          type: 'success', 
          text: disabled ? 'Submission privileges suspended.' : 'Submission privileges restored.' 
        });
        setProfile(prev => ({ ...prev, submission_disabled: disabled }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Moderate projects directly from detail page
  const handleApproveProject = async (projectId) => {
    setActionId(projectId);
    try {
      const res = await apiClient(`/admin/projects/${projectId}/moderation`, {
        method: 'PUT',
        body: { status: 'approved', reason: null }
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project approved successfully.' });
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'approved', rejection_reason: null } : p));
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionId(null);
    }
  };

  const openRejectProjectModal = (projectId) => {
    setRejectProjectId(projectId);
    setShowRejectModal(true);
  };

  const handleRejectProjectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    setActionId(rejectProjectId);
    setShowRejectModal(false);
    try {
      const res = await apiClient(`/admin/projects/${rejectProjectId}/moderation`, {
        method: 'PUT',
        body: { status: 'rejected', reason: rejectReason.trim() }
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project rejected.' });
        setProjects(prev => prev.map(p => p.id === rejectProjectId ? { ...p, status: 'rejected', rejection_reason: rejectReason.trim() } : p));
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionId(null);
      setRejectProjectId(null);
      setRejectReason('');
    }
  };

  const handleSoftDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    setActionId(projectId);
    try {
      const res = await apiClient(`/admin/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project removed successfully.' });
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4 max-w-md mx-auto text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Account Not Found</h2>
        <p className="text-xs text-slate-400">The requested platform account details are unavailable.</p>
        <Link 
          to="/users" 
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto mt-4">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1.5">
            Inspect {profile.role === 'student' ? 'Student Portfolio' : 'Recruiter Profile'}
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Review user account details, monitor audit analytics, and moderate portfolio project showcase listings.
          </p>
        </div>
      </div>

      {/* Back button */}
      <div>
        <Link 
          to={`/users?role=${profile.role}`} 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Accounts Directory</span>
        </Link>
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

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 gap-8 items-start">
        
        {/* Left Column: Profile Card & Stats */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px] pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/40 to-emerald-500/40 blur-xl"></div>
                {profile.profile_picture_url ? (
                  <img 
                    src={getDisplayUserAvatar(profile.profile_picture_url)} 
                    alt="" 
                    className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-slate-900 ring-1 ring-slate-800 bg-slate-950 shadow-xl z-10 transition-transform hover:scale-105 duration-500" 
                  />
                ) : (
                  <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-slate-950 border-2 border-slate-900 ring-1 ring-slate-800 text-slate-300 text-2xl sm:text-3xl font-black shadow-xl z-10">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.name}</h2>
                {/* <div className="flex justify-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-inner ${
                    profile.role === 'student' 
                      ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                      : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  }`}>
                    {profile.role}
                  </span>
                </div> */}
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 mt-8 space-y-6 shadow-inner relative z-10 text-left">
              <div className="flex flex-col group space-y-1.5">
                <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                  {/* <Mail className="h-4 w-4" /> */}
                  <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                </span>
                <span className="font-bold text-sm text-slate-200 pl-6 break-all" title={profile.email}>
                  {profile.email}
                </span>
              </div>

              <div className="flex flex-col group space-y-1.5">
                <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                  {/* <Calendar className="h-4 w-4" /> */}
                  <span className="text-[10px] font-bold uppercase tracking-wider">Joined</span>
                </span>
                <span className="font-bold text-sm text-slate-200 pl-6">
                  {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* <div className="flex flex-col group space-y-1.5">
                <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Username</span>
                </span>
                <span className="font-bold text-sm text-slate-200 pl-6">{profile.username || profile.name}</span>
              </div> */}

              {profile.role === 'student' && (
                <div className="flex flex-col group space-y-1.5">
                  <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                    {/* <Fingerprint className="h-4 w-4" /> */}
                    <span className="text-[10px] font-bold uppercase tracking-wider">Student ID</span>
                  </span>
                  <span className="font-bold text-sm text-slate-200 pl-6">{profile.student_id || 'N/A'}</span>
                </div>
              )}

              {profile.role === 'recruiter' && (
                <div className="flex flex-col group space-y-1.5">
                  <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                    {/* <Building2 className="h-4 w-4" /> */}
                    <span className="text-[10px] font-bold uppercase tracking-wider">Organization ID</span>
                  </span>
                  <span className="font-bold text-sm text-slate-200 pl-6">{profile.recruiter_id || 'N/A'}</span>
                </div>
              )}

              <div className="flex flex-col group space-y-2">
                <span className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                  {/* <Activity className="h-4 w-4" /> */}
                  <span className="text-[10px] font-bold uppercase tracking-wider">Account Status</span>
                </span>
                <div className="pl-6">
                  <span className={`inline-flex items-center justify-center text-[10px] font-black uppercase px-3 py-1 rounded-md border tracking-widest ${
                    profile.status === 'suspended'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  }`}>
                    {profile.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-slate-805 pb-3">Engagement & Impact</h3>

            {profile.role === 'student' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/50 hover:border-slate-700 transition-all rounded-2xl p-4 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <FolderGit className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Projects</span>
                  </div>
                  <span className="text-2xl font-black text-white">{projects.length}</span>
                </div>
                
                <div className="flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/50 hover:border-slate-700 transition-all rounded-2xl p-4 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                      <Users className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Followers</span>
                  </div>
                  <span className="text-2xl font-black text-white">{stats?.followersCount || 0}</span>
                </div>
                
                <div className="flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/50 hover:border-slate-700 transition-all rounded-2xl p-4 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 group-hover:bg-red-500/20 transition-all">
                      <ThumbsUp className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Likes Received</span>
                  </div>
                  <span className="text-2xl font-black text-white">{stats?.likesCount || 0}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/50 hover:border-slate-700 transition-all rounded-2xl p-4 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <ThumbsUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Likes Given</span>
                  </div>
                  <span className="text-2xl font-black text-white">{stats?.likesCount || 0}</span>
                </div>
                
                <div className="flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/50 hover:border-slate-700 transition-all rounded-2xl p-4 group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                      <Users className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Following</span>
                  </div>
                  <span className="text-2xl font-black text-white">{stats?.followingCount || 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* Admin Operations Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-805 pb-3">Security & Operations</h3>

            {submitting ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {/* Suspension Operation */}
                {profile.status === 'suspended' ? (
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all active:scale-[0.98] leading-none shadow-md"
                  >
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Reactivate Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('suspended')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all active:scale-[0.98] leading-none shadow-md"
                  >
                    <Ban className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Suspend Account</span>
                  </button>
                )}

                {/* Submission Privilege Toggle (Student only) */}
                {profile.role === 'student' && (
                  <>
                    {profile.submission_disabled ? (
                      <button
                        onClick={() => handlePrivilegeChange(false)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-bold transition-all active:scale-[0.98] leading-none shadow-md"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span className="leading-none">Restore Submissions</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePrivilegeChange(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-[0.98] leading-none shadow-md"
                      >
                        <FileX className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span className="leading-none">Suspend Submissions</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Followers list (only for students) */}
          {profile.role === 'student' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-slate-805 pb-3 flex items-center justify-between">
                <span>Followers</span>
                <span className="text-blue-400 text-xs font-black">{followers.length}</span>
              </h3>
              {followers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 italic">No followers yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {followers.map(f => (
                    <div key={f.id} className="flex items-center gap-3 bg-slate-950/80 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-sm group">
                      <img 
                        src={getDisplayUserAvatar(f.profile_picture_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                        alt="" 
                        className="h-10 w-10 rounded-full object-cover bg-slate-950 border border-slate-700 shrink-0 group-hover:scale-105 transition-transform" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <Link to={`/users/${f.id}`} className="text-xs font-bold text-slate-200 hover:text-blue-400 truncate block">
                            {f.name}
                          </Link>
                          {/* <span className="text-[8px] font-black uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full shrink-0 shadow-inner">
                            {f.recruiter_id ? 'Recruiter' : 'User'}
                          </span> */}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-1">{f.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: User's Projects (if Student) or Detail View Info */}
        <div className="space-y-6">
          {profile.role === 'student' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit className="h-5 w-5 text-blue-400" />
                  <span>Student projects ({projects.length})</span>
                </h3>
              </div>

              {projects.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-500">
                  <FolderGit className="h-10 w-10 text-slate-800 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-350">No Projects Submitted</h4>
                  <p className="text-xs text-slate-600 mt-1">This student hasn't published any capstone projects yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div 
                      key={project.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-350 flex flex-col justify-between group shadow-lg hover:translate-y-[-2px]"
                    >
                      {/* Image Thumbnail */}
                      <div className="h-44 bg-slate-950 relative overflow-hidden shrink-0 border-b border-slate-850">
                        <img 
                          src={getImageUrl(project.thumbnail_url)} 
                          alt="" 
                          className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                        />
                        {/* Status badge absolute overlays */}
                        <div className="absolute top-3 right-3 select-none">
                          {project.status === 'approved' && (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded shadow-sm">
                              Approved
                            </span>
                          )}
                          {(!project.status || project.status === 'pending') && (
                            <span className="text-[9px] font-extrabold uppercase bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 px-2 py-0.5 rounded shadow-sm">
                              Pending
                            </span>
                          )}
                          {project.status === 'rejected' && (
                            <span className="text-[9px] font-extrabold uppercase bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded shadow-sm">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-sm text-slate-100 leading-tight group-hover:text-blue-400 transition-colors">
                            {project.title}
                          </h4>
                          <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>

                          {/* Rejection Feedback block */}
                          {project.status === 'rejected' && project.rejection_reason && (
                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-2.5 text-[10px] text-red-400 leading-relaxed mt-2">
                              <span className="font-bold block mb-0.5 text-[9px] uppercase tracking-wide text-red-500">Moderator Feedback:</span>
                              {project.rejection_reason}
                            </div>
                          )}
                        </div>

                        {/* Tech Stack */}
                        {project.technology_stack && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.technology_stack.map((t, idx) => (
                              <span key={idx} className="tech-stack-badge">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Moderation Operations */}
                      <div className="p-5 pt-0 flex flex-row items-center gap-2 border-t border-slate-850/50 mt-2 pt-4 shrink-0">
                        {actionId === project.id ? (
                          <div className="flex-1 flex justify-center py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          </div>
                        ) : (
                          <>
                            {/* Moderate Approve / Reject buttons */}
                            {(!project.status || project.status === 'pending') && (
                              <>
                                <button
                                  onClick={() => openRejectProjectModal(project.id)}
                                  className="flex-1 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                >
                                  <X className="h-3.5 w-3.5 shrink-0" /> Reject
                                </button>
                                <button
                                  onClick={() => handleApproveProject(project.id)}
                                  className="flex-1 px-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                >
                                  <Check className="h-3.5 w-3.5 shrink-0" /> Approve
                                </button>
                              </>
                            )}

                            {/* Moderate Approved buttons */}
                            {project.status === 'approved' && (
                              <>
                                <button
                                  onClick={() => openRejectProjectModal(project.id)}
                                  className="flex-1 px-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                  title="Reject/Unpublish listing"
                                >
                                  <X className="h-3.5 w-3.5 shrink-0" /> Reject
                                </button>
                                <button
                                  onClick={() => handleSoftDeleteProject(project.id)}
                                  className="flex-1 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                  title="Permanently delete listing"
                                >
                                  <Trash2 className="h-3.5 w-3.5 shrink-0" /> Delete
                                </button>
                              </>
                            )}

                            {/* Moderate Rejected buttons */}
                            {project.status === 'rejected' && (
                              <>
                                <button
                                  onClick={() => handleApproveProject(project.id)}
                                  className="flex-1 px-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                >
                                  <Check className="h-3.5 w-3.5 shrink-0" /> Approve
                                </button>
                                <button
                                  onClick={() => handleSoftDeleteProject(project.id)}
                                  className="flex-1 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                                  title="Permanently delete listing"
                                >
                                  <Trash2 className="h-3.5 w-3.5 shrink-0" /> Delete Permanently
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Recruiter details inspection panel with following students
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="relative overflow-hidden bg-slate-955 p-6 rounded-2xl border border-slate-850 shadow-inner">
                <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <span>Recruiter Account Inspection</span>
                </h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Recruiters access the platform to browse approved student portfolios, follow promising capstone students, and save outstanding student showcase items by liking them.
                </p>
              </div>

              {/* Following Students Listing */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-blue-400" />
                  <span>Following Students ({following.length})</span>
                </h3>
                
                {following.length === 0 ? (
                  <div className="bg-slate-955 border border-slate-850 p-6 rounded-2xl text-center text-slate-500 text-xs italic">
                    This recruiter is not following any student profiles yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {following.map(s => (
                      <div key={s.id} className="flex items-center gap-3 bg-slate-955 p-4.5 rounded-2xl border border-slate-850 hover:border-slate-700/80 transition-all duration-300">
                        <img 
                          src={getDisplayUserAvatar(s.profile_picture_url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                          alt="" 
                          className="h-10 w-10 rounded-full object-cover bg-slate-950 border border-slate-800 shrink-0" 
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <Link to={`/users/${s.id}`} className="text-xs font-bold text-slate-200 hover:text-blue-400 truncate block">
                              {s.name}
                            </Link>
                            <span className="text-[9px] font-extrabold uppercase tracking-wide bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                              {s.student_id || 'STUDENT'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{s.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Rejection Modal overlay */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Rejection Governance</h3>
              </div>
              <button 
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectProjectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wide">
                  Specify reason for student
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="The project lacks a proper README layout, github url is broken, etc."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500 placeholder-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
