import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { ProjectModerationPage } from '../pages/ProjectModerationPage';
import { NotificationCenterPage } from '../pages/NotificationCenterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UserDetailPage } from '../pages/UserDetailPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Admin Entrance */}
      <Route path="/" element={<LandingPage />} />

      {/* Secured Admin Pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/projects" element={<ProjectModerationPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all Routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
