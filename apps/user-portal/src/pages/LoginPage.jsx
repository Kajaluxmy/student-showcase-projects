import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldAlert, ArrowLeft, Cpu, UserPlus } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, loginMock, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract role
  const role = searchParams.get('role');
  const errorParam = searchParams.get('error');

  const [error, setError] = useState(
    errorParam === 'account_not_found'
      ? 'No account matches this Google profile. Please use the "Sign Up / Create Account" option to register first.'
      : ''
  );

  // If role is missing, redirect to selection screen
  if (!role || (role !== 'student' && role !== 'recruiter')) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleAuth = (action) => {
    window.location.href = `http://localhost:5000/api/auth/google?action=${action}&role=${role}`;
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-zinc-900/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">Showcase Portal</span>
              <p className="text-[9px] text-zinc-550 leading-none">Faculty of Computing</p>
            </div>
          </Link>
          
          <Link to="/" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 leading-none">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Entrance</span>
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center w-full relative z-10">
        
        {/* Error Alert Box */}
        {error && (
          <div className="w-full max-w-3xl mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2.5 shadow-lg animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
        

        {/* Outer Split Card */}
        <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
          
          {/* LEFT PANEL: Sign In */}
          
          <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 bg-zinc-900 relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/15 text-blue-450 text-[10px] uppercase tracking-wider font-extrabold px-5 py-1 rounded-full select-none">
                <LogIn className="h-3 w-3 shrink-0" />
                <span>Sign In</span>
              </div>
              
              <h2 className="text-xl font-black text-zinc-100">
                Returning {role === 'student' ? 'Student' : 'Recruiter'}
              </h2>
              
              <p className="text-zinc-400 text-xs leading-relaxed">
                Log back in to your active portal dashboard using your verified Google credentials.
              </p>
            </div>

            <div className="pt-6 relative z-10 w-full">
              <button
                onClick={() => handleGoogleAuth('signin')}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-900 border border-zinc-300 font-extrabold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2.5 text-xs shadow-md hover:shadow-lg leading-none"
                style={{ height: '42px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="shrink-0" style={{ width: '18px', height: '18px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Sign Up */}
          <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 bg-zinc-900/40 relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-450 text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-1 rounded-full select-none">
                <UserPlus className="h-3 w-3 shrink-0" />
                <span>Create Account</span>
              </div>
              
              <h2 className="text-xl font-black text-zinc-100">
                New Onboarding
              </h2>
              
              <p className="text-zinc-400 text-xs leading-relaxed">
                First time? Initiate the Google OAuth link to build your new {role === 'student' ? 'showcase student card' : 'recruiter pipeline account'}.
              </p>
            </div>

            <div className="pt-6 relative z-10 w-full">
              <button
                onClick={() => handleGoogleAuth('signup')}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-900 border border-zinc-300 font-extrabold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2.5 text-xs shadow-md hover:shadow-lg leading-none"
                style={{ height: '42px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="shrink-0" style={{ width: '18px', height: '18px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
