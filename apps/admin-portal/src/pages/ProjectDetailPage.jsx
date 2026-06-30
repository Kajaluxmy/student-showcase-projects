import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, getImageUrl } from '../api/apiClient';
import { 
  Loader2, ArrowLeft, Check, X, Trash2, Github, Globe, 
  Calendar, Clock, User, Building, FileCode, Eye, ThumbsUp
} from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await apiClient(`/projects/${id}`);
        if (res.success && res.data?.project) {
          setProject(res.data.project);
        } else {
          setError('Failed to load project details.');
        }
      } catch (err) {
        setError(err.message || 'Error loading project.');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await apiClient(`/admin/projects/${id}/moderation`, {
        method: 'PUT',
        body: { status: 'approved', reason: null }
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project approved successfully.' });
        setProject(prev => ({ ...prev, status: 'approved', rejection_reason: null }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    setMessage(null);
    setShowRejectModal(false);
    try {
      const res = await apiClient(`/admin/projects/${id}/moderation`, {
        method: 'PUT',
        body: { status: 'rejected', reason: rejectReason.trim() }
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Project rejected successfully.' });
        setProject(prev => ({ ...prev, status: 'rejected', rejection_reason: rejectReason.trim() }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
      setRejectReason('');
    }
  };

  const handleHardDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone and will completely remove all associated records.')) return;
    setActionLoading(true);
    try {
      const res = await apiClient(`/admin/projects/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        navigate('/projects?status=rejected');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
        <h2 className="text-xl font-bold text-slate-200 mb-2">Project Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'The project you are looking for does not exist or was removed.'}</p>
        <button onClick={() => navigate('/projects')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold">
          Return to Moderation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-4 pb-20">
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold"
      >
        <ArrowLeft className="h-4 w-4" /> 
        <span>Back to Project Moderation</span>
      </button>

      {message && (
        <div className={`p-4 rounded-xl border text-xs font-bold leading-relaxed ${
          message.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Header / Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{project.title}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                project.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                project.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{project.description}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
            {project.status === 'pending' && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <X className="h-4 w-4" /> Reject Project
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Check className="h-4 w-4" /> Approve & Publish
                </button>
              </>
            )}
            
            {project.status === 'approved' && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <X className="h-4 w-4" /> Reject/Unpublish
                </button>
                <button
                  onClick={handleHardDelete}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Trash2 className="h-4 w-4" /> Delete Permanently
                </button>
              </>
            )}

            {project.status === 'rejected' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={handleHardDelete}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Trash2 className="h-4 w-4" /> Delete Permanently
                </button>
              </>
            )}
          </div>
        </div>
        
        {project.rejection_reason && (
          <div className="mt-6 bg-red-500/5 border border-red-500/10 rounded-xl p-4">
            <h4 className="text-red-400 text-[11px] font-black uppercase tracking-wider mb-1">Rejection Reason</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{project.rejection_reason}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Student Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">Author Details</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={project.student_avatar || getImageUrl(null)} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-700" />
              <div>
                <div className="text-sm font-bold text-white">{project.student_name || 'Unknown Student'}</div>
                <div className="text-xs text-slate-400">Student Profile</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300 text-xs">
                <User className="h-4 w-4 text-slate-500" />
                <span>ID: {project.student_id}</span>
              </div>
              {project.department && (
                <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <Building className="h-4 w-4 text-slate-500" />
                  <span>{project.department}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">Project Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-2"><Calendar className="h-4 w-4"/> Submitted</span>
                <span className="text-slate-200 text-xs font-bold">{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-2"><Clock className="h-4 w-4"/> Last Updated</span>
                <span className="text-slate-200 text-xs font-bold">{new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-2"><ThumbsUp className="h-4 w-4"/> Likes</span>
                <span className="text-slate-200 text-xs font-bold">{project.like_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-2"><Eye className="h-4 w-4"/> Visibility</span>
                <span className="text-slate-200 text-xs font-bold capitalize">{project.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md">
             <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">Submission Resources</h3>
             <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 mb-6">
                <img src={getImageUrl(project.thumbnail_url)} alt="Project Cover" className="w-full h-full object-cover" />
             </div>
             
             <div className="flex flex-wrap gap-4 mb-6">
                {project.github_url ? (
                  <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 transition-colors">
                    <Github className="h-4 w-4"/> View Source Code
                  </a>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed">
                    <Github className="h-4 w-4"/> No Source Code Provided
                  </div>
                )}
                {project.live_demo_url ? (
                  <a href={project.live_demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-400 transition-colors">
                    <Globe className="h-4 w-4"/> Live Demonstration
                  </a>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed">
                    <Globe className="h-4 w-4"/> No Live Demo
                  </div>
                )}
             </div>

             <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><FileCode className="h-4 w-4"/> Technology Stack</h3>
             <div className="flex flex-wrap gap-2">
                {project.technology_stack?.map((tech, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                    {tech}
                  </span>
                )) || <span className="text-slate-500 text-xs italic">No technologies listed</span>}
             </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">Provide Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this project was rejected to help the student improve..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500 resize-none h-32"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/10"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
