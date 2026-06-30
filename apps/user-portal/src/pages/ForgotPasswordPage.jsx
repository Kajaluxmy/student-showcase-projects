import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, ExternalLink } from 'lucide-react';

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-screen bg-zinc-950 text-zinc-100 items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <div className="mb-6">
          <Link to="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="text-center mb-6 relative">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-5.5 w-5.5" />
          </div>
          <h1 className="text-xl font-black text-white">
            Password Recovery
          </h1>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
            Platform accounts are managed securely via external identity providers.
          </p>
        </div>

        <div className="space-y-6 relative text-zinc-400 text-xs leading-relaxed">
          <p>
            Because the Student Project Showcase Portal delegates authentication to <strong>Google OAuth</strong>, no account passwords are created or stored on our servers.
          </p>
          
          <p>
            If you have forgotten your password or are locked out of your email, you must use Google's official recovery settings page to regain access to your account.
          </p>

          <div className="pt-2">
            <a
              href="https://accounts.google.com/signin/recovery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 hover:text-white text-zinc-200 font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] leading-none"
            >
              <span>Google Account Recovery</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
