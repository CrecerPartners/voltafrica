import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider, ThemeProvider, TooltipProvider, Toaster } from '@digihire/shared';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import BrandDashboard from './pages/brand/BrandDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24, staleTime: 1000 * 60 * 5 } },
});
const persister = createSyncStoragePersister({ storage: window.localStorage });

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/brand/*" element={<ProtectedRoute><BrandDashboard /></ProtectedRoute>} />
                <Route path="*" element={<Login />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
