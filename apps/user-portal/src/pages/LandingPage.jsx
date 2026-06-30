import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Briefcase, ShieldCheck, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSelectRole = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">Project Showcase</span>
              <p className="text-[10px] text-zinc-500 font-medium">Faculty of Computing</p>
            </div>
          </div>
          
          {/* <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full select-none">
              Production Active
            </span>
          </div> */}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-12 relative z-10">
        
        {/* Core Value Proposition */}
        <div className="space-y-5 max-w-3xl px-4">
       
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-2xl mx-auto">
            Bridging <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">Student Innovation</span> <br /> With Career Openings
          </h1>
          
          <p className="text-zinc-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            A secure university repository platform where students publish coursework portfolios, and verified technology recruiters discover emerging computing talent.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="w-full max-w-3xl space-y-8 pt-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px bg-zinc-900 flex-1"></div>
            <h2 className="text-[10px] tracking-widest font-extrabold text-zinc-550">Select Entry Role</h2>
            <div className="h-px bg-zinc-900 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Student Role Card */}
            <div
              onClick={() => handleSelectRole('student')}
              className="cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800 hover:border-blue-500/40 p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[220px] transition-all duration-300 group shadow-lg active:scale-[0.98] hover:shadow-[0_0_24px_rgba(59,130,246,0.06)]"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_25px_60px_rgba(59,130,246,0.15)]">

                {/* Background Glow */}
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-all duration-500 group-hover:bg-blue-500/20" />
                <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/20" />

                <div className="relative z-10">

                  {/* Icon */}
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <GraduationCap className="h-8 w-8 text-blue-700" />
                  </div>

                  {/* Content */}
                  <div className="mt-8 space-y-4">

                    <h3 className="text-2xl font-bold text-blue-900 transition-colors duration-300 group-hover:text-cyan-400">
                      Student Workspace
                    </h3>

                    <p className="text-sm leading-7 text-black-400">
                      Create a professional portfolio by publishing academic projects,
                      showcasing GitHub repositories, uploading demo videos, documenting
                      your development journey, and tracking recruiter engagement in one place.
                    </p>
                    {/* Button */}
                    <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-semibold text-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
                      Enter Student Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                  </div>

                </div>
              </div>
            </div>
            
            {/* Recruiter Role Card */}
            <div
              onClick={() => handleSelectRole('recruiter')}
              className="cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/40 p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[220px] transition-all duration-300 group shadow-lg active:scale-[0.98] hover:shadow-[0_0_24px_rgba(16,185,129,0.06)]"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_25px_60px_rgba(16,185,129,0.15)]">

                {/* Background Glow */}
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/20" />
                <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-teal-500/10 blur-3xl transition-all duration-500 group-hover:bg-teal-500/20" />

                <div className="relative z-10">

                  {/* Icon */}
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Briefcase className="h-8 w-8 text-emerald-600" />
                  </div>

                  {/* Content */}
                  <div className="mt-8 space-y-4">

                    <h3 className="text-2xl font-bold text-emerald-800 transition-colors duration-300 group-hover:text-emerald-400">
                      Recruiter Workspace
                    </h3>

                    <p className="text-sm leading-7 text-black-400">
                      Discover talented students, explore innovative projects, filter by
                      technologies, review complete portfolios, and connect directly with
                      candidates for internships and full-time opportunities.
                    </p>

                    {/* CTA Button */}
                    <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-sm font-semibold text-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30">
                      Enter Recruiter Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950 py-4 px-6 relative z-10 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[10px] text-zinc-650 font-medium justify-center sm:justify-start">
            &copy; 2026 Faculty of Computing Showcase. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
