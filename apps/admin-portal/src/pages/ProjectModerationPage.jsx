import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../api/apiClient';
import { 
  Loader2, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Github,
  Globe,
  ExternalLink,
  MessageSquare,
  Search
} from 'lucide-react';

export function ProjectModerationPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const [activeTab, setActiveTab] = useState(statusParam || 'pending'); // 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (statusParam === 'pending' || statusParam === 'approved' || statusParam === 'rejected') {
      setActiveTab(statusParam);
    }
  }, [statusParam]);
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectProjectId, setRejectProjectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  async function loadProjects() {
    setLoading(true);
    try {
      // Query projects for administrative view
      const res = await apiClient(`/projects?limit=100&adminView=true&status=${activeTab}`);
      if (res.success && res.data?.projects) {
        setProjects(res.data.projects);
      }
    } catch (error) {
      console.error('Failed to load projects list:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [activeTab]);

  const handleApprove = async (projectId) => {
    setActionId(projectId);
    setMessage(null);
    try {
      const res = await apiClient(`/admin/projects/${projectId}/moderation`, {
        method: 'PUT',
        body: { status: 'approved', reason: null }
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project approved and published successfully.' });
        // Remove from current local state view
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setActionId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason for the student.');
      return;
    }
    setActionId(rejectProjectId);
    setMessage(null);
    setShowRejectModal(false);
    try {
      const res = await apiClient(`/admin/projects/${rejectProjectId}/moderation`, {
        method: 'PUT',
        body: { status: 'rejected', reason: rejectReason.trim() }
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project rejected. Student was notified.' });
        // Remove from current local state view
        setProjects(prev => prev.filter(p => p.id !== rejectProjectId));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setActionId(null);
      setRejectProjectId(null);
      setRejectReason('');
    }
  };

  const handleSoftDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently remove this project? This will archive it and remove it from all user pages.')) return;
    setActionId(projectId);
    setMessage(null);
    try {
      const res = await apiClient(`/admin/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project removed successfully.' });
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (projectId) => {
    setRejectProjectId(projectId);
    setShowRejectModal(true);
  };

  // Search filter
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto mt-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 ">
          <h1 className="text-3xl font-black text-blue-400 mt-1">
            Content Moderation
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Audit capstone project showcase submissions, approve compliant portfolios, or request revisions.
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

      {/* Tabs and search bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 self-stretch md:self-auto overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Approval' },
            { id: 'approved', label: 'Approved Showcase' },
            { id: 'rejected', label: 'Rejected Listings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ status: tab.id })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="🔍︎ Search projects or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
        </div>

      </div>

      {/* Projects Grid Container */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-500">
          <AlertTriangle className="h-10 w-10 text-slate-800 mx-auto mb-4" />
          <h3 className="font-bold text-sm text-slate-350 capitalize">No {activeTab} projects found</h3>
          <p className="text-xs text-slate-600 mt-1">Select another moderation category or search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md relative group hover:border-slate-700 hover:translate-y-[-2px] transition-all duration-300"
            >
              {/* Card Image Cover */}
              <div className="h-44 bg-slate-950 relative overflow-hidden shrink-0 border-b border-slate-850">
                <img 
                  src={getImageUrl(item.thumbnail_url)} 
                  alt="" 
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay author pill */}
                <div className="absolute left-3 bottom-3 flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-xl">
                  {item.student_avatar ? (
                    <img src={item.student_avatar} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-slate-400 text-[10px] font-bold shrink-0">
                      {item.student_name ? item.student_name.charAt(0) : 'S'}
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-200 truncate max-w-[120px]">{item.student_name}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-100 leading-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wider">{item.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mt-1">{item.description}</p>
                </div>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.technology_stack?.map((t, idx) => (
                    <span key={idx} className="tech-stack-badge">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Display rejection reason if active tab is rejected */}
                {activeTab === 'rejected' && item.rejection_reason && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-[11px] text-red-400 leading-relaxed">
                    <span className="font-bold block mb-1">Reason for Rejection:</span>
                    {item.rejection_reason}
                  </div>
                )}
              </div>
              <div className="p-5 pt-0 flex flex-row items-center gap-2 border-t border-slate-850/50 mt-2 pt-4 shrink-0">
                {actionId === item.id ? (
                  <div className="flex-1 flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <>
                    {/* Common View Details button */}
                    <Link
                      to={`/projects/${item.id}`}
                      className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all active:scale-[0.98] text-[11px] font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Details</span>
                    </Link>

                    {/* Moderate Approve / Reject buttons */}
                    {activeTab === 'pending' && (
                      <>
                        <button
                          onClick={() => openRejectModal(item.id)}
                          className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                        >
                          <X className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Approve</span>
                        </button>
                      </>
                    )}

                    {/* Moderate Approved/Showcase buttons */}
                    {activeTab === 'approved' && (
                      <>
                        <button
                          onClick={() => openRejectModal(item.id)}
                          className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                          title="Reject/Unpublish listing"
                        >
                          <X className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Reject</span>
                        </button>
                        <button
                          onClick={() => handleSoftDelete(item.id)}
                          className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                          title="Soft delete listing"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Delete</span>
                        </button>
                      </>
                    )}

                    {/* Moderate Rejected buttons */}
                    {activeTab === 'rejected' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Approve</span>
                        </button>
                        <button
                          onClick={() => handleSoftDelete(item.id)}
                          className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                          title="Permanently delete listing"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Delete Permanently</span>
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

      {/* Rejection reason modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wide">
                  Specify reason for student
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Please supply a valid github repository link..."
                  rows="4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-650 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-md shadow-red-500/10"
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
