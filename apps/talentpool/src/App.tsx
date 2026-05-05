import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider, ThemeProvider, TooltipProvider, ToastNotifier, Toaster as Sonner } from '@digihire/shared';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import TalentDashboard from './pages/talent/TalentDashboard';
import AcademyPage from './pages/academy/AcademyPage';
import CourseDetailPage from './pages/academy/CourseDetailPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24, staleTime: 1000 * 60 * 5 } },
});
const persister = createSyncStoragePersister({ storage: window.localStorage });

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <ToastNotifier />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-[#fafafa] font-sans text-[#1a1a1a]">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/academy" element={<AcademyPage />} />
                    <Route path="/academy/course/:id" element={<CourseDetailPage />} />
                    <Route path="/talent/*" element={<ProtectedRoute><TalentDashboard /></ProtectedRoute>} />
                    <Route path="*" element={<Login />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
