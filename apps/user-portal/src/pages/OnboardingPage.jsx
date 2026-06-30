import React, { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldAlert, BadgeInfo } from 'lucide-react';

export function OnboardingPage() {
  const { isAuthenticated, registerConfirm, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read URL query parameters
  const initGoogleId = searchParams.get('googleId') || '';
  const initEmail = searchParams.get('email') || '';
  const initName = searchParams.get('name') || '';
  const initAvatar = searchParams.get('avatar') || '';
  const initRole = searchParams.get('role') || 'student';

  // Form states
  const [name, setName] = useState(initName);
  const [avatar, setAvatar] = useState(initAvatar);
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check required parameters
  if (!initGoogleId || !initEmail) {
    return <Navigate to="/login" replace />;
  }

  const handleRegisterConfirm = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a display name for your profile.');
      return;
    }

    if (!roleId.trim()) {
      setError(`Please provide your verified ${initRole === 'student' ? 'Student ID' : 'Recruiter ID'}.`);
      return;
    }

    try {
      await registerConfirm({
        googleId: initGoogleId,
        email: initEmail,
        name: name.trim(),
        profilePictureUrl: avatar.trim() || null,
        role: initRole,
        studentId: initRole === 'student' ? roleId.trim() : null,
        recruiterId: initRole === 'recruiter' ? roleId.trim() : null
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Account registration confirmation failed.');
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-zinc-950 text-zinc-100 items-center justify-center p-4">
      <div 
        className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        style={{ maxWidth: '420px' }}
      >
        
        {/* Glow Indicators */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative">
          {/* Circular Avatar Container */}
          <div 
            className="rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center mx-auto mb-4" 
            style={{ width: '72px', height: '72px', minWidth: '72px' }}
          >
            {avatar ? (
              <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="text-2xl font-bold text-zinc-600">{name ? name[0].toUpperCase() : 'U'}</div>
            )}
          </div>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Complete Your Registration
          </h1>
          <p className="text-zinc-500 text-xs mt-2">
            Confirm your profile settings to finalize account onboarding.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-450 text-xs flex gap-2.5 shadow-lg animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegisterConfirm} className="space-y-5 relative">
          
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-white-450  tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black-200 placeholder-zinc-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* Role-Specific ID Field */}
          <div className="space-y-1.5 mt-4">
            <label className="block text-[10px] font-bold text-white-450 tracking-wider">
              {initRole === 'student' ? 'Student ID / Registration Number' : 'Recruiter ID / Company ID'}
            </label>
            <input
              type="text"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              placeholder={initRole === 'student' ? 'e.g. ST-2026-99' : 'e.g. RC-TECH-42'}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black-200 placeholder-zinc-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* Avatar Url */}
          <div className="space-y-1.5 mt-4">
            <label className="block text-[10px] font-bold text-white-450 tracking-wider">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/35 text-black-200 placeholder-zinc-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5 opacity-65 mt-4">
            <label className="block text-[10px] font-bold text-white-450  tracking-wider">
              Verified Email Address
            </label>
            <input
              type="text"
              value={initEmail}
              disabled
              className="w-full bg-white-950/80 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-400 cursor-not-allowed font-semibold"
            />
          </div>

          {/* Selected Role Badge */}
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between shadow-inner mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Target Access Level:</span>
            </div>
            <span className={`text-[10px]  tracking-wider font-extrabold px-3.5 py-1 rounded-full ${initRole === 'recruiter' ? 'bg-blue-500/10 text-blue-400  ' : 'bg-blue-500/10 text-blue-400 '}`}>
              {initRole}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-50 text-xs shadow-lg mt-4 leading-none"
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span className="leading-none">Confirm & create account</span>
          </button>
        </form>

      </div>
    </div>
  );
}
