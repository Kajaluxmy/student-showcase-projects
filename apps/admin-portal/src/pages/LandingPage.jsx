import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Lock, User } from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated, loginCredentials, loginMock, loading } = useAuth();
  const navigate = useNavigate();
  
  // Credentials states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      await loginCredentials(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrative credentials.');
    }
  };

  const handleAdminMockLogin = async () => {
    setError('');
    try {
      await loginMock();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Administrative simulated login failed.');
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-950 text-slate-100 items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        
        {/* Glow indicators */}
        <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-red-500/5 blur-3xl"></div>
        <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-blue-500/5 blur-3xl"></div>

        <div className="text-center mb-8 relative">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
            Faculty Administration
          </span>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Moderation Portal
          </h1>
          <p className="text-slate-500 text-xs mt-2">
            Secure panel for platform content governance and audits.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4 relative">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-700"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        </form>

      </div>
    </div>
  );
}
