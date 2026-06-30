import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, getImageUrl } from '../api/apiClient';
import { 
  Heart, 
  Users, 
  Briefcase, 
  ExternalLink,
  PlusCircle,
  Bell,
  Code2,
  ChevronRight,
  TrendingUp,
  FolderKanban,
  Edit2
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  
  if (user.role === 'student') {
    return <StudentDashboard user={user} />;
  } else if (user.role === 'recruiter') {
    return <RecruiterDashboard user={user} />;
  } else if (user.role === 'admin') {
    return <AdminInfo user={user} />;
  }
  return null;
}

// ----------------------------------------------------
// Student Dashboard Subcomponent
// ----------------------------------------------------
function StudentDashboard({ user }) {
  const [stats, setStats] = useState({ likes: 0, projectsCount: 0, followersCount: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [res, followersRes] = await Promise.all([
          apiClient(`/projects?studentId=${user.id}&limit=10`),
          apiClient('/users/followers')
        ]);
        if (res.success) {
          setProjects(res.data.projects || []);
          const totalLikes = (res.data.projects || []).reduce((acc, p) => acc + (p.like_count || 0), 0);
          setStats({
            likes: totalLikes,
            projectsCount: (res.data.projects || []).length,
            followersCount: followersRes.success ? (followersRes.data.followers || []).length : 0
          });
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [user.id]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mt-4 space-y-8">
      {/* Header Banner - Premium glassmorphic look */}
      {/* <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-blue-950/20 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl"> */}
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          {/* <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/15">
            Student Workspace
          </span> */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
            Welcome back,{" "}
            <span className="text-blue-400">{user.name}!</span>
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Monitor your showcase engagement metrics, manage your published Capstone submissions, and track recruiter views.
          </p>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Projects Card */}
        <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Total Projects</p>
            <h3 className="text-3xl font-black mt-1.5 text-zinc-100">{stats.projectsCount}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Capstone listings online</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10 group-hover:scale-105 transition-transform duration-300">
            <Briefcase className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Portfolio Likes Card */}
        <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-red-500/5 blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Project Likes</p>
            <h3 className="text-3xl font-black mt-1.5 text-zinc-100">{stats.likes}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Aggregated candidate likes</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/10 group-hover:scale-105 transition-transform duration-300">
            <Heart className="h-5.5 w-5.5 fill-red-500/10" />
          </div>
        </div>

        {/* Followers Card */}
        <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">My Followers</p>
            <h3 className="text-3xl font-black mt-1.5 text-zinc-100">{stats.followersCount}</h3>
            <Link 
              to="/followers" 
              className="text-[10px] text-blue-450 hover:text-blue-350 transition-colors flex items-center gap-0.5 mt-1 font-semibold"
            >
              <span>View Followers</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-450 border border-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
            <Users className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Quick Publish Action Card */}
        {/* <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Publish Showcase</p>
            <Link 
              to="/projects/new" 
              className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-450 font-bold bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-lg mt-3 hover:bg-emerald-500/25 transition-all active:scale-[0.98] leading-none"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="leading-none">Create New Post</span>
            </Link>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
            <Code2 className="h-5.5 w-5.5" />
          </div>
        </div> */}
      </div>

      {/* Projects Management List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 bg-zinc-950/20">
          <div className="space-y-0.5">
            <h2 className="font-bold text-sm text-zinc-200">My Showcased Projects</h2>
            <p className="text-[10px] text-zinc-500">Edit, preview, and update your codebases.</p>
          </div>
          <Link 
            to="/projects/new" 
            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 active:scale-[0.97] px-4 py-2.5 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 shadow-md leading-none w-full sm:w-auto"
          >
            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-none">Publish Project</span>
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-16 text-center">
            <Briefcase className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="font-bold text-zinc-300 text-sm">No projects published yet</h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Upload and document your academic codebases to catch recruiters' interest.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-850">
            {projects.map((project) => (
              <div key={project.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-zinc-850/15 transition-colors gap-4">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <img 
                    src={getImageUrl(project.thumbnail_url)} 
                    alt={project.title} 
                    className="h-14 w-14 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0" 
                    style={{ width: '56px', height: '56px', minWidth: '56px' }}
                  />
                  <div className="min-w-0 space-y-1">
                    <Link to={`/projects/${project.id}`} className="font-bold text-sm text-zinc-200 hover:text-blue-400 transition-colors truncate block">
                      {project.title}
                    </Link>
                    <p className="text-xs text-zinc-500 truncate max-w-md">{project.description}</p>
                    
                    {/* Tech stack badge list */}
                    {project.technology_stack && project.technology_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {project.technology_stack.map((t, idx) => (
                          <span key={idx} className="tech-stack-badge">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-850 sm:border-0 pt-3 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold border-red-500/10 px-2.5 py-1.5 rounded-xl select-none">
                    <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 shrink-0 slow-pulse" />
                    <span className="leading-none">{project.like_count || 0}</span>
                  </div>
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-200 active:scale-[0.97] leading-none shadow-md shadow-blue-500/10"
                  >
                    <span className="leading-none">Manage</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 leading-none" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Recruiter Dashboard Subcomponent
// ----------------------------------------------------
function RecruiterDashboard({ user }) {
  const [following, setFollowing] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecruiterData() {
      try {
        const [followingRes, trendingRes] = await Promise.all([
          apiClient('/users/following'),
          apiClient('/projects?sort=popular&limit=4')
        ]);
        
        if (followingRes.success) setFollowing(followingRes.data.following || []);
        if (trendingRes.success) setTrending(trendingRes.data.projects || []);
      } catch (err) {
        console.error('Failed to load recruiter data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRecruiterData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 mt-4">
      {/* Recruiter Header Banner - Premium glassmorphic look */}
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
            Welcome back,{" "}
            <span className="text-blue-400">{user.name}!</span>
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Discover student capstone portfolios, track active codebases, and manage your followed candidates pipeline.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Latest Projects */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest">
              Latest Projects
            </h2>
          </div>

          <Link
            to="/projects"
            className="flex items-center gap-0.5 text-xs font-bold text-blue-400 transition-colors hover:text-blue-300"
          >
            <span>Browse All</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {trending.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center shadow-lg">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-xs text-zinc-500">
              No projects published in this environment yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {trending.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg transition-all duration-300 hover:border-zinc-700 hover:-translate-y-1"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden border-b border-zinc-800 bg-zinc-950">
                    <img
                      src={getImageUrl(project.thumbnail_url)}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-1 text-sm font-bold text-zinc-200 transition-colors group-hover:text-blue-400">
                      {project.title}
                    </h3>

                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-zinc-850/60 p-4 pt-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300"
                    >
                      {project.student_name?.charAt(0).toUpperCase()}
                    </div>

                    <span className="text-[11px] font-semibold text-zinc-400 truncate">
                      {project.student_name}
                    </span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-200 active:scale-[0.97] leading-none shadow-md shadow-blue-500/10"
                  >
                    <span className="leading-none">Explore</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 leading-none" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Admin Warning Subcomponent inside User Portal
// ----------------------------------------------------
function AdminInfo({ user }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md text-center shadow-2xl">
        <Users className="h-10 w-10 text-blue-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-zinc-100">Administrator Credentials Detected</h2>
        <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
          You are currently logged in with the Administrator role. To access moderation dashboards, analytics, and user role configuration, please navigate to the Admin Portal (running on localhost port 3001).
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Loading Skeleton Layout
// ----------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-28 bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
        <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
        <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
      </div>
      <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
    </div>
  );
}
