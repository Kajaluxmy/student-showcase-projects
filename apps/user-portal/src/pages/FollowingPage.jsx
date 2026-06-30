import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { Users, UserMinus, Mail, ArrowLeft } from 'lucide-react';

export function FollowingPage() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unfollowingId, setUnfollowingId] = useState(null);

  useEffect(() => {
    async function loadFollowing() {
      try {
        const res = await apiClient('/users/following');
        if (res.success) {
          setFollowing(res.data.following || []);
        } else {
          setError(res.error?.message || 'Failed to retrieve followed students.');
        }
      } catch (err) {
        setError(err.message || 'Error occurred while connecting to the database.');
      } finally {
        setLoading(false);
      }
    }
    loadFollowing();
  }, []);

  const handleUnfollow = async (id) => {
    setUnfollowingId(id);
    try {
      const res = await apiClient(`/users/${id}/follow`, { method: 'DELETE' });
      if (res.success) {
        setFollowing((prev) => prev.filter((student) => student.id !== id));
      } else {
        alert(res.error?.message || 'Failed to unfollow user.');
      }
    } catch (err) {
      alert(err.message || 'Error unfollowing student.');
    } finally {
      setUnfollowingId(null);
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
            Following Students
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            View students you are following and their latest project updates.
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
      ) : following.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center max-w-md mx-auto shadow-lg">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-zinc-300">No Students Followed</h3>
          <p className="text-xs text-zinc-555 mt-2 leading-relaxed">
            Follow student profiles from their project detail pages to track their updates here.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-5 transition-colors shadow-md leading-none active:scale-[0.98]"
          >
            Explore Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {following.map((student) => (
            <div 
              key={student.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:translate-y-[-1px] transition-all flex items-center justify-between shadow-lg group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Circular image */}
                <div 
                  className="rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0"
                  style={{ width: '48px', height: '48px', minWidth: '48px' }}
                >
                  {student.profile_picture_url ? (
                    <img src={student.profile_picture_url} alt={student.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-lg font-bold text-zinc-600">{student.name[0].toUpperCase()}</div>
                  )}
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-bold text-zinc-200 text-sm truncate group-hover:text-blue-400 transition-colors">{student.name}</h3>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] min-w-0">
                    {/* <Mail className="h-3 w-3 shrink-0" /> */}
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.student_id && (
                    <p className="text-[9px] text-blue-450 font-bold uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 inline-block select-none">
                      ID: {student.student_id}
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleUnfollow(student.id)}
                disabled={unfollowingId === student.id}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all disabled:opacity-40 leading-none active:scale-[0.98]"
              >
                <UserMinus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline leading-none">Unfollow</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
