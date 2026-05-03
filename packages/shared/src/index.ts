// ── Supabase ──────────────────────────────────────────────────────────────────
export { supabase } from "./integrations/supabase/client";
export type { Database } from "./integrations/supabase/types";

// ── Contexts + Theme ──────────────────────────────────────────────────────────
export { AuthProvider, useAuth } from "./contexts/AuthContext";
export { CartProvider, useCart } from "./contexts/CartContext";
export { ThemeProvider } from "./components/ThemeProvider";

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useProfile, useUpdateProfile, useUploadAvatar } from "./hooks/useProfile";
export { useWallet } from "./hooks/useWallet";
export { useNotifications } from "./hooks/useNotifications";
export { useTransactions } from "./hooks/useTransactions";
export {
  useCampaigns,
  useCampaign,
  useMyCampaignMemberships,
  useCampaignMembership,
  useJoinCampaign,
  useCampaignSubmissions,
  useSubmitEntry,
  useMyCampaignEarnings,
} from "./hooks/useCampaigns";
export type {
  Campaign,
  CampaignMembership,
  CampaignSubmission,
  CampaignEarning,
} from "./hooks/useCampaigns";
export { useReferrals } from "./hooks/useReferrals";
export { useSales, useDeleteSale, useUpdateSale } from "./hooks/useSales";
export type { Sale } from "./hooks/useSales";
export {
  useCourses,
  useCourseLessons,
  useUserProgress,
  useAllProgress,
  useMarkLessonComplete,
} from "./hooks/useTraining";
export { useProducts } from "./hooks/useProducts";
export type { Product, ProductType, CommissionModel } from "./hooks/useProducts";
export { useProduct } from "./hooks/useProduct";
export { useReviews, useSubmitReview, useProductRatingStats } from "./hooks/useReviews";
export { useIsMobile } from "./hooks/use-mobile";
export { useCountUp } from "./hooks/useCountUp";
export { useToast, toast } from "./hooks/use-toast";

// ── Lib ───────────────────────────────────────────────────────────────────────
export { cn, formatNaira } from "./lib/utils";
export * from "./lib/shareUtils";
export * from "./lib/csvExport";
export * from "./lib/productTaxonomy";

// ── UI Components ─────────────────────────────────────────────────────────────
export * from "./components/ui/accordion";
export * from "./components/ui/alert";
export * from "./components/ui/alert-dialog";
export * from "./components/ui/aspect-ratio";
export * from "./components/ui/avatar";
export * from "./components/ui/badge";
export * from "./components/ui/breadcrumb";
export * from "./components/ui/button";
export * from "./components/ui/calendar";
export * from "./components/ui/card";
export * from "./components/ui/carousel";
export * from "./components/ui/chart";
export * from "./components/ui/checkbox";
export * from "./components/ui/collapsible";
export * from "./components/ui/command";
export * from "./components/ui/context-menu";
export * from "./components/ui/dialog";
export * from "./components/ui/drawer";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/form";
export * from "./components/ui/gradient-bars-background";
export * from "./components/ui/hover-card";
export * from "./components/ui/input";
export * from "./components/ui/input-otp";
export * from "./components/ui/label";
export * from "./components/ui/menubar";
export * from "./components/ui/navigation-menu";
export * from "./components/ui/pagination";
export * from "./components/ui/popover";
export * from "./components/ui/progress";
export * from "./components/ui/radio-group";
export * from "./components/ui/resizable";
export * from "./components/ui/scroll-area";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/sidebar";
export * from "./components/ui/skeleton";
export * from "./components/ui/slider";
export * from "./components/ui/sonner";
export * from "./components/ui/switch";
export * from "./components/ui/table";
export * from "./components/ui/tabs";
export * from "./components/ui/textarea";
export * from "./components/ui/toast";
export { Toaster as ToastNotifier } from "./components/ui/toaster";
export * from "./components/ui/toggle";
export * from "./components/ui/toggle-group";
export * from "./components/ui/tooltip";
