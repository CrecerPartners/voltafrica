// Mock data for the Volt Student Dashboard

export const currentUser = {
  id: "usr_001",
  name: "Chidera Okafor",
  email: "chidera@unilag.edu.ng",
  avatar: "",
  university: "University of Lagos",
  referralCode: "VOLT-CHID23",
  referralLink: "https://volt.ng/ref/VOLT-CHID23",
  whatsapp: "+2348012345678",
  bankName: "GTBank",
  accountNumber: "0123456789",
  tier: "Silver",
  joinedDate: "2025-09-15",
};

export const dashboardStats = {
  totalEarnings: 47500,
  pendingPayout: 12300,
  totalSales: 34,
  referralCount: 12,
  conversionRate: 18.5,
  weeklyGrowth: 23,
};

export const earningsData = [
  { week: "W1", earnings: 3200 },
  { week: "W2", earnings: 5400 },
  { week: "W3", earnings: 4100 },
  { week: "W4", earnings: 7800 },
  { week: "W5", earnings: 6200 },
  { week: "W6", earnings: 9500 },
  { week: "W7", earnings: 8300 },
  { week: "W8", earnings: 11200 },
];

export const recentActivity = [
  { id: 1, type: "sale", description: "Sold MTN 2GB Data Bundle", amount: 450, date: "2026-02-28", status: "confirmed" },
  { id: 2, type: "referral", description: "Bola joined via your link", amount: 200, date: "2026-02-27", status: "confirmed" },
  { id: 3, type: "bonus", description: "Weekly performance bonus", amount: 1000, date: "2026-02-27", status: "paid" },
  { id: 4, type: "sale", description: "Sold PiggyVest signup", amount: 800, date: "2026-02-26", status: "pending" },
  { id: 5, type: "sale", description: "Sold Campus Connect ticket", amount: 300, date: "2026-02-25", status: "confirmed" },
];

export type ProductCategory = "physical" | "digital" | "fintech" | "events";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  commissionRate: number;
  price: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  { id: "p1", name: "Wireless Earbuds Pro", brand: "TechZone", category: "physical", commissionRate: 15, price: 12000, image: "🎧", description: "Premium wireless earbuds with noise cancellation" },
  { id: "p2", name: "Smart Watch Lite", brand: "TechZone", category: "physical", commissionRate: 12, price: 25000, image: "⌚", description: "Affordable smartwatch with fitness tracking" },
  { id: "p3", name: "Campus Hoodie", brand: "UniWear", category: "physical", commissionRate: 20, price: 8500, image: "👕", description: "Premium quality campus branded hoodie" },
  { id: "p4", name: "LED Desk Lamp", brand: "BrightLife", category: "physical", commissionRate: 18, price: 5500, image: "💡", description: "USB rechargeable study lamp" },
  { id: "p5", name: "MTN 2GB Data Bundle", brand: "MTN", category: "digital", commissionRate: 8, price: 1200, image: "📱", description: "30-day data plan" },
  { id: "p6", name: "Spotify Premium 3mo", brand: "Spotify", category: "digital", commissionRate: 25, price: 4500, image: "🎵", description: "3-month premium subscription" },
  { id: "p7", name: "Coursera Plus Annual", brand: "Coursera", category: "digital", commissionRate: 30, price: 35000, image: "📚", description: "Unlimited access to 7,000+ courses" },
  { id: "p8", name: "Netflix Student Plan", brand: "Netflix", category: "digital", commissionRate: 10, price: 2900, image: "🎬", description: "Monthly student subscription" },
  { id: "p9", name: "PiggyVest Signup", brand: "PiggyVest", category: "fintech", commissionRate: 20, price: 0, image: "🐷", description: "Free signup — earn on each new user" },
  { id: "p10", name: "Kuda Bank Account", brand: "Kuda", category: "fintech", commissionRate: 15, price: 0, image: "🏦", description: "Free digital bank account signup" },
  { id: "p11", name: "Cowrywise Investment", brand: "Cowrywise", category: "fintech", commissionRate: 22, price: 0, image: "📈", description: "Investment platform signup" },
  { id: "p12", name: "Campus Connect 2026", brand: "Volt Events", category: "events", commissionRate: 10, price: 3000, image: "🎉", description: "Biggest campus networking event" },
  { id: "p13", name: "Tech Career Fair", brand: "Volt Events", category: "events", commissionRate: 12, price: 2000, image: "💼", description: "Connect with top tech companies" },
  { id: "p14", name: "Music Festival Pass", brand: "CampusFest", category: "events", commissionRate: 8, price: 5000, image: "🎤", description: "All-access weekend music festival" },
];

export interface Transaction {
  id: string;
  date: string;
  type: "commission" | "referral_bonus" | "signup_bonus" | "performance_bonus" | "payout";
  description: string;
  amount: number;
  status: "pending" | "paid" | "processing";
}

export const transactions: Transaction[] = [
  { id: "t1", date: "2026-02-28", type: "commission", description: "MTN Data Bundle sale", amount: 96, status: "pending" },
  { id: "t2", date: "2026-02-27", type: "referral_bonus", description: "Bola Adeyemi joined", amount: 200, status: "paid" },
  { id: "t3", date: "2026-02-27", type: "performance_bonus", description: "Weekly top seller bonus", amount: 1000, status: "paid" },
  { id: "t4", date: "2026-02-26", type: "commission", description: "PiggyVest signup", amount: 800, status: "pending" },
  { id: "t5", date: "2026-02-25", type: "commission", description: "Campus Connect ticket", amount: 300, status: "paid" },
  { id: "t6", date: "2026-02-24", type: "payout", description: "Weekly payout — Friday", amount: -15000, status: "paid" },
  { id: "t7", date: "2026-02-22", type: "commission", description: "Wireless Earbuds Pro", amount: 1800, status: "paid" },
  { id: "t8", date: "2026-02-21", type: "signup_bonus", description: "Welcome bonus", amount: 500, status: "paid" },
  { id: "t9", date: "2026-02-20", type: "referral_bonus", description: "Tunde Balogun joined", amount: 200, status: "paid" },
  { id: "t10", date: "2026-02-19", type: "commission", description: "Smart Watch Lite", amount: 3000, status: "paid" },
];

export const walletSummary = {
  availableBalance: 35200,
  pendingEarnings: 12300,
  totalEarned: 47500,
  totalPaidOut: 15000,
};

export interface Referral {
  id: string;
  name: string;
  date: string;
  status: "signed_up" | "active" | "earned";
  earnings: number;
}

export const referrals: Referral[] = [
  { id: "r1", name: "Bola Adeyemi", date: "2026-02-27", status: "active", earnings: 200 },
  { id: "r2", name: "Tunde Balogun", date: "2026-02-20", status: "earned", earnings: 450 },
  { id: "r3", name: "Fatima Yusuf", date: "2026-02-15", status: "earned", earnings: 380 },
  { id: "r4", name: "Emeka Nwankwo", date: "2026-02-10", status: "active", earnings: 200 },
  { id: "r5", name: "Aisha Mohammed", date: "2026-02-05", status: "signed_up", earnings: 0 },
  { id: "r6", name: "David Okonkwo", date: "2026-01-28", status: "earned", earnings: 520 },
  { id: "r7", name: "Grace Eze", date: "2026-01-20", status: "active", earnings: 150 },
];

export interface Sale {
  id: string;
  date: string;
  product: string;
  customer: string;
  amount: number;
  commission: number;
  status: "confirmed" | "pending" | "cancelled";
  category: ProductCategory;
}

export const sales: Sale[] = [
  { id: "s1", date: "2026-02-28", product: "MTN 2GB Data Bundle", customer: "Cust***01", amount: 1200, commission: 96, status: "pending", category: "digital" },
  { id: "s2", date: "2026-02-27", product: "PiggyVest Signup", customer: "Cust***02", amount: 0, commission: 800, status: "pending", category: "fintech" },
  { id: "s3", date: "2026-02-25", product: "Campus Connect 2026", customer: "Cust***03", amount: 3000, commission: 300, status: "confirmed", category: "events" },
  { id: "s4", date: "2026-02-22", product: "Wireless Earbuds Pro", customer: "Cust***04", amount: 12000, commission: 1800, status: "confirmed", category: "physical" },
  { id: "s5", date: "2026-02-20", product: "Smart Watch Lite", customer: "Cust***05", amount: 25000, commission: 3000, status: "confirmed", category: "physical" },
  { id: "s6", date: "2026-02-18", product: "Spotify Premium 3mo", customer: "Cust***06", amount: 4500, commission: 1125, status: "confirmed", category: "digital" },
  { id: "s7", date: "2026-02-15", product: "Kuda Bank Account", customer: "Cust***07", amount: 0, commission: 500, status: "confirmed", category: "fintech" },
  { id: "s8", date: "2026-02-12", product: "Campus Hoodie", customer: "Cust***08", amount: 8500, commission: 1700, status: "cancelled", category: "physical" },
];

export interface LeaderboardEntry {
  rank: number;
  name: string;
  university: string;
  earnings: number;
  sales: number;
  isCurrentUser?: boolean;
}

export const leaderboardCampus: LeaderboardEntry[] = [
  { rank: 1, name: "Adaeze Obi", university: "University of Lagos", earnings: 82000, sales: 56 },
  { rank: 2, name: "Chidera Okafor", university: "University of Lagos", earnings: 47500, sales: 34, isCurrentUser: true },
  { rank: 3, name: "Olumide Akin", university: "University of Lagos", earnings: 41200, sales: 29 },
  { rank: 4, name: "Kemi Fashola", university: "University of Lagos", earnings: 35800, sales: 24 },
  { rank: 5, name: "Samuel Ibe", university: "University of Lagos", earnings: 28900, sales: 20 },
];

export const leaderboardNational: LeaderboardEntry[] = [
  { rank: 1, name: "Ngozi Okafor", university: "University of Ibadan", earnings: 152000, sales: 98 },
  { rank: 2, name: "Ahmed Musa", university: "ABU Zaria", earnings: 134500, sales: 87 },
  { rank: 3, name: "Blessing Eze", university: "UNIBEN", earnings: 121000, sales: 76 },
  { rank: 7, name: "Chidera Okafor", university: "University of Lagos", earnings: 47500, sales: 34, isCurrentUser: true },
];

export const tiers = [
  { name: "Bronze", minEarnings: 0, color: "hsl(30 60% 50%)" },
  { name: "Silver", minEarnings: 25000, color: "hsl(0 0% 65%)" },
  { name: "Gold", minEarnings: 75000, color: "hsl(45 90% 50%)" },
  { name: "Platinum", minEarnings: 150000, color: "hsl(207 90% 54%)" },
];

export const formatNaira = (amount: number) => {
  return `₦${Math.abs(amount).toLocaleString()}`;
};
