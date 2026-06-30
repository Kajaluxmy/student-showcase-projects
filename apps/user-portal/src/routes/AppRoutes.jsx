import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { ProjectFormPage } from '../pages/ProjectFormPage';
import { NotificationCenterPage } from '../pages/NotificationCenterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { MyProjectsPage } from '../pages/MyProjectsPage';
import { SavedProjectsPage } from '../pages/SavedProjectsPage';
import { FollowingPage } from '../pages/FollowingPage';
import { FollowersPage } from '../pages/FollowersPage';
import { ShieldAlert, FileQuestion } from 'lucide-react';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Login Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Secured Portals Layout */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'recruiter', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Student Portfolio Publication Controls */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/projects/new" element={<ProjectFormPage />} />
            <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
            <Route path="/my-projects" element={<MyProjectsPage />} />
            <Route path="/followers" element={<FollowersPage />} />
          </Route>

          {/* Recruiter Control Views */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
            <Route path="/saved-projects" element={<SavedProjectsPage />} />
            <Route path="/following" element={<FollowingPage />} />
          </Route>

        </Route>
      </Route>

      {/* Access Fallback Routing */}
      <Route path="/unauthorized" element={<UnauthorizedView />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

// ----------------------------------------------------
// Fallback Views
// ----------------------------------------------------
function UnauthorizedView() {
  return (
    <div className="flex min-h-screen w-screen bg-slate-950 text-slate-100 items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-sm text-center shadow-lg space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          Your active user account role does not have authorization permissions to access this view path.
        </p>
        <Link to="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="flex min-h-screen w-screen bg-slate-950 text-slate-100 items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-sm text-center shadow-lg space-y-4">
        <FileQuestion className="h-12 w-12 text-blue-400 mx-auto" />
        <h2 className="text-xl font-bold">Page Not Found</h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          The requested URL path does not exist on this showcase portal server.
        </p>
        <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}
