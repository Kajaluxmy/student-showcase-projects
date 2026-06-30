import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Info } from 'lucide-react';

export function RegisterPage() {
  const handleGoogleLogin = () => {
    const apiHost = import.meta.env.VITE_API_HOST || 'http://localhost:5000';
    window.location.href = `${apiHost}/api/auth/google`;
  };

  return (
    <div className="flex min-h-screen w-screen bg-zinc-950 text-zinc-100 items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

        <div className="mb-6">
          <Link to="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="text-center mb-6 relative">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Instant Account Creation
          </h1>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
            No registration forms required. Account setups are handled automatically.
          </p>
        </div>

        <div className="space-y-6 relative text-zinc-355 text-xs leading-relaxed">
          <div className="bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-2xl flex gap-3 shadow-inner">
            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-200 text-xs">How it works:</h4>
              <p className="text-zinc-400">
                When you sign in using your Google Account for the first time, our server automatically initiates <strong>Just-In-Time (JIT) provisioning</strong>.
              </p>
              <p className="text-zinc-400">
                The backend creates a secure profile mapping your verified name, email address, and profile picture directly from Google.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 bg-white text-zinc-900 font-bold px-4 py-3 rounded-xl hover:bg-zinc-100 transition-colors shadow-lg active:scale-[0.98]"
            >
              <span>Continue with Google</span>
            </button>
            
            <p className="text-center text-[10px] text-zinc-650">
              By logging in, you agree to follow the university platform code of conduct.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
