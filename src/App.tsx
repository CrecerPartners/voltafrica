import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminLayout } from "@/components/AdminLayout";
import LandingPage from "@/pages/LandingPage";
import AboutStudents from "@/pages/AboutStudents";
import AboutBrands from "@/pages/AboutBrands";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import WalletPage from "@/pages/WalletPage";
import Calculator from "@/pages/Calculator";
import Referrals from "@/pages/Referrals";
import Sales from "@/pages/Sales";
import Leaderboard from "@/pages/Leaderboard";
import Training from "@/pages/Training";
import TrainingCourse from "@/pages/TrainingCourse";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminSales from "@/pages/admin/AdminSales";
import AdminPayouts from "@/pages/admin/AdminPayouts";
import AdminTraining from "@/pages/admin/AdminTraining";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminLeaderboard from "@/pages/admin/AdminLeaderboard";
import AdminLogin from "@/pages/admin/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/about/students" element={<AboutStudents />} />
          <Route path="/about/brands" element={<AboutBrands />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/:courseId" element={<TrainingCourse />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/admin/training" element={<AdminTraining />} />
            <Route path="/admin/referrals" element={<AdminReferrals />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
