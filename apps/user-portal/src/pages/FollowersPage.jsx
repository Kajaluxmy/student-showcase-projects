import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { Users, Mail, ArrowLeft } from 'lucide-react';

export function FollowersPage() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFollowers() {
      try {
        const res = await apiClient('/users/followers');
        if (res.success) {
          setFollowers(res.data.followers || []);
        } else {
          setError(res.error?.message || 'Failed to retrieve your follower recruiters.');
        }
      } catch (err) {
        setError(err.message || 'Error occurred while connecting to the database.');
      } finally {
        setLoading(false);
      }
    }
    loadFollowers();
  }, []);

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
            My Followers
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            View recruiters who are tracking your capstone project submissions and academic portfolio updates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error}
        </div>
      ) : followers.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center max-w-md mx-auto shadow-lg">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-zinc-300">No Followers Yet</h3>
          <p className="text-xs text-zinc-550 mt-2 leading-relaxed">
            Keep sharing your portfolio and publishing Capstone projects. When recruiters follow your work, they will show up here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {followers.map((recruiter) => (
            <div 
              key={recruiter.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:translate-y-[-1px] transition-all flex items-center justify-between shadow-lg group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Circular image */}
                <div 
                  className="rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0"
                  style={{ width: '48px', height: '48px', minWidth: '48px' }}
                >
                  {recruiter.profile_picture_url ? (
                    <img src={recruiter.profile_picture_url} alt={recruiter.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-lg font-bold text-zinc-600">{recruiter.name[0].toUpperCase()}</div>
                  )}
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-bold text-zinc-200 text-sm truncate group-hover:text-blue-400 transition-colors">{recruiter.name}</h3>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] min-w-0">
                    <span className="truncate">{recruiter.email}</span>
                  </div>
                </div>
              </div>

              {/* <a 
                href={`mailto:${recruiter.email}`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-[0.98] leading-none"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Contact</span>
              </a> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
