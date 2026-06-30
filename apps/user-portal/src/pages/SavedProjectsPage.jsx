import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, getImageUrl } from '../api/apiClient';
import { Heart, ExternalLink, HeartOff, ArrowLeft } from 'lucide-react';

export function SavedProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlinkingId, setUnlinkingId] = useState(null);

  useEffect(() => {
    async function fetchSavedProjects() {
      try {
        const res = await apiClient(`/projects?likedByUserId=${user.id}`);
        if (res.success) {
          setProjects(res.data.projects || []);
        } else {
          setError(res.error?.message || 'Failed to retrieve saved project list.');
        }
      } catch (err) {
        setError(err.message || 'Error connecting to the API.');
      } finally {
        setLoading(false);
      }
    }
    fetchSavedProjects();
  }, [user.id]);

  const handleRemoveSave = async (id) => {
    setUnlinkingId(id);
    try {
      const res = await apiClient(`/projects/${id}/like`, { method: 'DELETE' });
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error?.message || 'Failed to remove from saved list.');
      }
    } catch (err) {
      alert(err.message || 'Error unlinking project.');
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto mt-4">
      {/* Back link */}
      <Link to="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-semibold flex items-center gap-1.5 self-start">
        <ArrowLeft className="h-3 w-3" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header Banner - Premium glassmorphic look */}
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 mt-2">
            Saved Projects
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Review student capstone projects pinned to your recruiter pipeline.
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center max-w-md mx-auto shadow-lg">
          <Heart className="h-10 w-10 text-zinc-700 mx-auto mb-4 animate-pulse" />
          <h3 className="text-sm font-bold text-zinc-300">Saved Pipeline is Empty</h3>
          <p className="text-xs text-zinc-550 mt-2 leading-relaxed">
            Browse student uploads and click the heart icon on any project page to save it here.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-5 transition-colors shadow-md leading-none active:scale-[0.98]"
          >
            Discover Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-350 flex flex-col justify-between shadow-lg group hover:translate-y-[-1px]"
            >
              <div>
                <div className="h-40 w-full overflow-hidden border-b border-zinc-805 relative bg-zinc-950">
                  <img 
                    src={getImageUrl(project.thumbnail_url)} 
                    alt={project.title} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-zinc-200 text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                  <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{project.description}</p>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-5 w-5 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[9px] flex items-center justify-center border border-zinc-700 select-none">
                      {project.student_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-semibold">By {project.student_name}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-850/50 mt-4 pt-4">
                <button 
                  onClick={() => handleRemoveSave(project.id)}
                  disabled={unlinkingId === project.id}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/10 disabled:opacity-40 leading-none active:scale-[0.98]"
                  title="Remove from saved"
                >
                  <HeartOff className="h-3.5 w-3.5 shrink-0" />
                  <span className="leading-none">Unsave</span>
                </button>
                <Link 
                  to={`/projects/${project.id}`} 
                  className="inline-flex items-center justify-center gap-1 text-xs font-bold text-blue-450 hover:text-blue-355 transition-colors leading-none"
                >
                  <span>Details</span>
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
