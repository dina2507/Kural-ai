/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppLayout } from '@/shared/components/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { MapPage } from '@/pages/MapPage';
import { ReportPage } from '@/pages/ReportPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AgentPage } from '@/pages/AgentPage';
import { IssuesPage } from '@/pages/IssuesPage';
import { IssueDetailPage } from '@/pages/IssueDetailPage';
import { AuthPage } from '@/pages/AuthPage';
import { Toaster } from 'sonner';

// Simple protected route wrapper for Phase 1
// We can expand this with actual session checking later
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // For Phase 1 we will just pass through or you can mock authentication
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
            <Route path="report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />
            <Route path="issues" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
            <Route path="issue/:id" element={<ProtectedRoute><IssueDetailPage /></ProtectedRoute>} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  );
}

