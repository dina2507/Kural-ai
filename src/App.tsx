/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase/client';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  if (session === 'loading') {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-secondary">Loading...</div>;
  }

  if (session === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

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

