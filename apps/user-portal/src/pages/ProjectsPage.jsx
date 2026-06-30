import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../api/apiClient';
import { 
  Search, 
  Filter, 
  Heart, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  X
} from 'lucide-react';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state values
  const [search, setSearch] = useState('');
  const [tech, setTech] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 9;

  // Active query parameters (triggers fetch)
  const [activeFilters, setActiveFilters] = useState({ search: '', tech: '', sort: 'newest', page: 1 });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { search, tech, sort, page } = activeFilters;
      let query = `/projects?page=${page}&limit=${limit}&sort=${sort}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (tech) query += `&tech=${encodeURIComponent(tech)}`;
      
      const res = await apiClient(query);
      if (res.success && res.data) {
        setProjects(res.data.projects || []);
        setTotalItems(res.data.pagination?.total_items || 0);
      }
    } catch (error) {
      console.error('Failed to query showcase projects:', error.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveFilters({ search, tech, sort, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    setActiveFilters(prev => ({ ...prev, sort: newSort, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setActiveFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setTech('');
    setSort('newest');
    setPage(1);
    setActiveFilters({ search: '', tech: '', sort: 'newest', page: 1 });
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="mt-4 space-y-8">
      {/* Header Banner - Premium glassmorphic look */}
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:translate-y-[-2px] transition-all duration-300 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 mt-1.5">
            Project Directory
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Explore student codebases, filter by technologies, and discover computing talent.
          </p>
        </div>
      </div>

      {/* Query Filter Navigation Panel */}
      <form onSubmit={handleSearchSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-6">
        {/* Glow Element */}
        <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none"></div>

        {/* Inputs Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Column 1: Search keyword */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider text-blue-400">Search Keyword</label>
            <div className="relative">
              {/* <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-zinc-500" /> */}
              <input
                type="text"
                placeholder="e.g. Capstone title, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-zinc-200 placeholder-zinc-650 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>

          {/* Column 2: Tech filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-555 uppercase tracking-wider text-blue-400">Filter by Tech Stack</label>
            <div className="relative">
              {/* <SlidersHorizontal className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-zinc-500" /> */}
              <input
                type="text"
                placeholder="e.g. React, Docker, Python..."
                value={tech}
                onChange={(e) => {
                  setTech(e.target.value);
                  setPage(1);
                  setActiveFilters(prev => ({ ...prev, tech: e.target.value, page: 1 }));
                }}
                className="w-full bg-zinc-955 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-zinc-200 placeholder-zinc-650 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>

          {/* Column 3: Sort by */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-555 uppercase tracking-wider text-blue-400">Sort by</label>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full bg-zinc-955 border border-zinc-800 focus:border-blue-500/80 text-zinc-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-bold cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Buttons Row - Aligned cleanly to the right */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-850/50 relative z-10">
          <div className="text-zinc-500 text-[10px] font-semibold">
            {totalItems > 0 ? `Showing ${totalItems} project${totalItems === 1 ? '' : 's'}` : 'No projects found'}
          </div>
          <div className="flex items-center gap-3">
            {(search || tech) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white border border-zinc-750 hover:border-zinc-700 transition-all active:scale-[0.98] text-xs font-bold leading-none"
              >
                <X className="h-3.5 w-3.5 shrink-0" />
                <span>Reset Filters</span>
              </button>
            )}
            <button
              type="submit"
              className="projects-apply-search-btn inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>Apply Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center shadow-lg max-w-md mx-auto">
          <Filter className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-300 text-sm">No matching projects</h3>
          <p className="text-zinc-500 mt-2 text-xs leading-relaxed">Modify your query keyword or technology filters and try searching again.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-350 flex flex-col justify-between group shadow-lg hover:translate-y-[-1px]"
              >
                {/* Thumbnail */}
                <div className="h-44 w-full bg-zinc-950 overflow-hidden relative border-b border-zinc-805">
                  <img
                    src={getImageUrl(project.thumbnail_url)}
                    alt={project.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] text-zinc-400 font-bold border border-zinc-800/60 uppercase tracking-wider select-none">
                    By {project.student_name}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-zinc-200 group-hover:text-blue-400 transition-colors line-clamp-1 text-sm">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech stack */}
                  {project.technology_stack && project.technology_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technology_stack.map((t, idx) => (
                        <span key={idx} className="tech-stack-badge">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-850/60 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold bg-red-500/5  select-none">
                      <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 shrink-0 animate-pulse" style={{ animationDuration: '3s' }} />
                      <span className="leading-none">{project.like_count || 0}</span>
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-200 active:scale-[0.97] leading-none shadow-md shadow-blue-550/10"
                    >
                      <span className="leading-none">Explore</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 leading-none" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 text-zinc-450 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-450 transition-colors active:scale-[0.95]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="text-xs text-zinc-500 font-semibold select-none">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 text-zinc-455 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-455 transition-colors active:scale-[0.95]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
