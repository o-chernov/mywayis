import { BrowserRouter } from 'react-router';

import { AppRouter } from '@/app/router';
import { OnboardingProvider } from '@/app/providers/OnboardingProvider';
import { SessionProvider } from '@/app/providers/SessionProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

export function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>
          <BrowserRouter>
            <OnboardingProvider>
              <AppRouter />
              <OnboardingFlow />
            </OnboardingProvider>
          </BrowserRouter>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
