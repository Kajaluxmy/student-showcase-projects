import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, getImageUrl } from '../api/apiClient';
import { Plus, Edit3, Trash2, FolderGit, ExternalLink } from 'lucide-react';

export function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchMyProjects() {
      try {
        const res = await apiClient(`/projects?studentId=${user.id}`);
        if (res.success) {
          setProjects(res.data.projects || []);
        } else {
          setError(res.error?.message || 'Failed to retrieve your project list.');
        }
      } catch (err) {
        setError(err.message || 'Error occurred while connecting to the API.');
      } finally {
        setLoading(false);
      }
    }
    fetchMyProjects();
  }, [user.id]);

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await apiClient(`/projects/${id}`, { method: 'DELETE' });
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error?.message || 'Failed to delete the project.');
      }
    } catch (err) {
      alert(err.message || 'Error deleting project.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4 space-y-8">
      {/* Header Banner - Premium glassmorphic look */}
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 mt-1.5">
            My Projects
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Manage, edit, or delete your published capstone computing projects.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] shrink-0 leading-none"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="leading-none">Publish Project</span>
        </Link>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center max-w-md mx-auto shadow-lg">
          <FolderGit className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-zinc-350">No Projects Published</h3>
          <p className="text-xs text-zinc-555 mt-2 leading-relaxed">
            Kickstart your portfolio by publishing your first Capstone project.
          </p>
          <Link
            to="/projects/new"
            className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-5 transition-colors shadow-md leading-none active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="leading-none">Get Started</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-350 flex flex-col justify-between group shadow-lg hover:translate-y-[-2px]"
            >
              {/* Thumbnail */}
              <div className="h-44 w-full overflow-hidden border-b border-zinc-805 relative bg-zinc-950">
                <img 
                  src={getImageUrl(project.thumbnail_url)} 
                  alt={project.title} 
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {/* Status Indicator Badge */}
                <div className="absolute top-3 right-3 select-none">
                  {project.status === 'approved' && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded shadow-sm">
                      Approved
                    </span>
                  )}
                  {(!project.status || project.status === 'pending') && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wide bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 px-2 py-0.5 rounded shadow-sm">
                      Pending
                    </span>
                  )}
                  {project.status === 'rejected' && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wide bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded shadow-sm">
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-zinc-200 text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-zinc-500 text-xs line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech stack */}
                {project.technology_stack && project.technology_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.technology_stack.map((tag) => (
                      <span key={tag} className="tech-stack-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Display rejection reason for student */}
                {project.status === 'rejected' && project.rejection_reason && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-[11px] text-red-400 leading-relaxed">
                    <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wide text-red-500">Moderator Feedback:</span>
                    {project.rejection_reason}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 flex flex-row items-center gap-2 border-t border-zinc-850/50 mt-2 pt-4">
                <Link 
                  to={`/projects/${project.id}/edit`}
                  className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                  title="Edit project"
                >
                  <Edit3 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Edit</span>
                </Link>
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  disabled={deletingId === project.id}
                  className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all disabled:opacity-40 active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                  title="Delete project"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
                <Link 
                  to={`/projects/${project.id}`} 
                  className="flex-1 min-w-0 px-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.98] text-xs font-bold flex flex-row items-center justify-center gap-1.5 leading-none select-none whitespace-nowrap"
                  title="View details"
                >
                  <span className="truncate">Details</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
