import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { AppShell } from '@/layouts/AppShell/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { Button, EmptyState } from '@/shared/ui';
import { SearchIcon } from '@/shared/icons';

function RequireAuth({ children }: { children: ReactNode }) {
  const { authenticated } = useSession();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function NotFoundPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={<SearchIcon width={22} height={22} />}
      title={t('states.notFound')}
      description={t('states.notFoundHint')}
      actions={
        <Button variant="primary" onClick={() => navigate('/')}>
          {t('states.goHome')}
        </Button>
      }
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="u/:username" element={<UserProfilePage />} />
        <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
        <Route path="settings/:tab" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
