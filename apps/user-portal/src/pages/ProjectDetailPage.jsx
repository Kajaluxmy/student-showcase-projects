import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, getImageUrl } from '../api/apiClient';
import { 
  Heart, 
  UserPlus, 
  UserCheck, 
  Trash2, 
  Edit3, 
  Github, 
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail
} from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interaction states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [submittingLike, setSubmittingLike] = useState(false);
  const [submittingFollow, setSubmittingFollow] = useState(false);

  useEffect(() => {
    async function loadProjectDetails() {
      try {
        const res = await apiClient(`/projects/${id}`);
        if (res.success && res.data?.project) {
          const proj = res.data.project;
          setProject(proj);
          setLikeCount(proj.like_count || 0);

          // Check if recruiter followed/liked
          if (user.role === 'recruiter') {
            const followingRes = await apiClient('/users/following');
            if (followingRes.success) {
              const isFollowing = (followingRes.data.following || []).some(s => String(s.id) === String(proj.student_id));
              setFollowing(isFollowing);
            }
            
            // Check if liked
            const likedRes = await apiClient(`/projects?likedByUserId=${user.id}`);
            if (likedRes.success) {
              const isLiked = (likedRes.data.projects || []).some(p => String(p.id) === String(proj.id));
              setLiked(isLiked);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve project details.');
      } finally {
        setLoading(false);
      }
    }
    loadProjectDetails();
  }, [id, user.role, user.id]);

  const handleLikeToggle = async () => {
    if (submittingLike) return;
    setSubmittingLike(true);
    try {
      if (liked) {
        await apiClient(`/projects/${id}/like`, { method: 'DELETE' });
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await apiClient(`/projects/${id}/like`, { method: 'POST' });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Like action failed:', err.message);
    } finally {
      setSubmittingLike(false);
    }
  };

  const handleFollowToggle = async () => {
    if (submittingFollow) return;
    setSubmittingFollow(true);
    try {
      const studentId = project.student_id;
      if (following) {
        await apiClient(`/users/${studentId}/follow`, { method: 'DELETE' });
        setFollowing(false);
      } else {
        await apiClient(`/users/${studentId}/follow`, { method: 'POST' });
        setFollowing(true);
      }
    } catch (err) {
      console.error('Follow action failed:', err.message);
    } finally {
      setSubmittingFollow(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await apiClient(`/projects/${id}`, { method: 'DELETE' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md mx-auto text-center text-zinc-400 mt-12 shadow-lg">
        <AlertCircle className="h-10 w-10 text-red-450 mx-auto mb-3 animate-pulse" />
        <h3 className="font-bold text-zinc-200">Error Loading Project</h3>
        <p className="text-xs mt-2">{error || 'Project not found.'}</p>
        <Link to="/projects" className="text-xs text-blue-405 hover:underline mt-4 inline-block">Back to Directory</Link>
      </div>
    );
  }

  const isOwner = String(project.student_id) === String(user.id);
  const canModify = isOwner || user.role === 'admin';

  return (
    <div className="space-y-8 max-w-5xl mx-auto mt-4">
      {/* Back Link */}
      <Link to="/projects" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-semibold flex items-center gap-1.5 self-start">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Directory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Thumbnail */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl aspect-video">
            <img
              src={getImageUrl(project.thumbnail_url)}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content Card */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

            {/* Background Blur */}
            <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 space-y-6">

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white">
                  {project.title}
                </h1>

                <p className="mt-2 text-sm text-zinc-400 text-blue-200">
                  Innovative software project showcasing modern technologies.
                </p>
              </div>

              {/* Tech Stack */}
              {project.technology_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technology_stack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="tech-stack-badge"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-zinc-800 pt-6">

                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400 text-blue-400">
                  Project Overview
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-8 text-zinc-300">
                  {project.description}
                </p>

              </div>

            </div>
          </div>
        </div>
        {/* Sidebar Info & Controls */}
        <div className="space-y-6">
          
          {/* Author Profile Panel */}
          <div className="glass-sidebar-card rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 text-center w-full">
                Author Profile 
              </h3>
            </div>
            
            <div className="flex items-center gap-6 mt-4">
              {project.student_avatar ? (
                <img 
                  src={project.student_avatar} 
                  alt={project.student_name} 
                  className="avatar-large rounded-full object-cover border border-zinc-800 ring-2 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all duration-300 mt-1" 
                />
              ) : (
                <div 
                  className="avatar-large flex items-center justify-center rounded-full bg-zinc-950 text-zinc-300 text-base font-black border border-zinc-800 select-none shrink-0"
                >
                  {project.student_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 space-y-1.5 ">
                <p className="text-sm font-bold text-zinc-150 truncate">{project.student_name}</p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  {/* <Mail className="h-3 w-3 shrink-0" /> */}
                  <span className="truncate">{project.student_email}</span>
                </div>
                
              </div>
            </div>

            {/* Recruiter Follow Action */}
            {user.role === 'recruiter' && (
              <button
                onClick={handleFollowToggle}
                disabled={submittingFollow}
                className={`flex w-full items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border leading-none shadow-md mt-4 ${
                  following 
                    ? 'detail-outline-btn' 
                    : 'detail-gradient-btn-blue'
                }`}
              >
                {following ? (
                  <>
                    <UserCheck className="h-4 w-4 shrink-0" />
                    {/* <span className="leading-none">Following Candidate</span> */}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Follow Student</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Social Interactions & External Links */}
          <div className="glass-sidebar-card rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden group">

            {/* Background glow */}
            <div className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-red-500/5 blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                  Likes & Project Links
                </h3>
              </div>
            </div>

            {/* Likes Card */}
            <div className="flex items-center justify-between rounded-xl bg-red-500/5 border border-red-500/10 px-4 py-3 mt-4">
              <span className="text-xs font-semibold text-zinc-300">
                Showcase Likes
              </span>

              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Heart
                  className="h-4 w-4 fill-red-500 text-red-500 slow-pulse"
                />
                <span className="text-sm">{likeCount}</span>
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-3 mt-4">

              {/* Like Button */}
              {user.role === "recruiter" && (
                <button
                  onClick={handleLikeToggle}
                  disabled={submittingLike}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-[0.97]
                  ${
                    liked
                      ? "detail-gradient-btn-red"
                      : "detail-outline-btn"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
                  {liked ? "Liked Showcase" : "Like Project"}
                </button>
              )}

              {/* GitHub Link */}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 transition-all text-zinc-200 active:scale-[0.97]"
                >
                  <Github className="h-4 w-4" />
                  <span>View Source Code</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}
            </div>
          </div>

          {/* Owner Moderation Controls */}
          {canModify && (
            <div className="glass-sidebar-card rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden group">

              {/* Background Glow */}
              <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-red-500/5 blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>

              {/* Header */}
              <div className="flex items-center gap-2 pb-1 border-b border-zinc-850">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 text-center w-full">
                  Project Management
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-4">

                {isOwner && (
                  <Link
                    to={`/projects/${id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-500 active:scale-[0.98]"
                  >
                    <Edit3 className="h-4 w-4 shrink-0" />
                    <span>Edit Project</span>
                  </Link>
                )}

                <button
                  onClick={handleDelete}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-bold text-red-400 shadow-md transition-all hover:bg-red-500/10 active:scale-[0.98]"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  <span>Delete Project</span>
                </button>

              </div>

              </div>
          )}

        </div>

      </div>
    </div>
  );
}
