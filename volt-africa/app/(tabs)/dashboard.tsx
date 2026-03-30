import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/AppHeader";

export default function DashboardScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalEarnings: 0, pendingPayout: 0, totalSales: 0, referrals: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<number[]>(Array(8).fill(0));
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [{ data: prof }, { data: txns }, { data: sales }, { data: refs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("sales").select("commission_earned,status").eq("user_id", user.id),
      supabase.from("referrals").select("id").eq("referrer_id", user.id),
    ]);
    setProfile(prof);
    setRecentActivity((txns || []).slice(0, 5));

    const totalEarnings = (txns || []).reduce((s: number, t: any) =>
      ["commission","referral_bonus","signup_bonus","performance_bonus","manual_sale"].includes(t.type) ? s + (t.amount || 0) : s, 0);
    const pendingPayout = (txns || [])
      .filter((t: any) => t.type === "commission" && t.status === "pending")
      .reduce((s: number, t: any) => s + (t.amount || 0), 0);

    setStats({ totalEarnings, pendingPayout, totalSales: (sales || []).length, referrals: (refs || []).length });

    const weeks: number[] = Array(8).fill(0);
    (txns || []).forEach((t: any) => {
      const diff = Math.floor((Date.now() - new Date(t.created_at).getTime()) / (7 * 24 * 3600 * 1000));
      if (diff >= 0 && diff < 8 && t.amount > 0) weeks[7 - diff] += t.amount;
    });
    setEarningsData(weeks);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const firstName = profile?.name?.split(" ")[0] || "there";
  const maxEarning = Math.max(...earningsData, 1);

  const quickActions = [
    { icon: "person-circle-outline", label: "Set Up Your Profile", sub: "Complete your profile", route: "/(tabs)/settings" },
    { icon: "bag-outline", label: "Browse Products", sub: "Find offers to promote", route: "/(tabs)/marketplace" },
    { icon: "wallet-outline", label: "Check Wallet", sub: "View balance & payouts", route: "/(tabs)/wallet" },
    { icon: "copy-outline", label: "Copy Referral Code", sub: "Share & earn bonuses", route: "/(tabs)/referrals" },
    { icon: "arrow-up-circle-outline", label: "Request Payout", sub: "Cash out your earnings", route: "/(tabs)/wallet" },
    { icon: "trophy-outline", label: "View Leaderboard", sub: "See your ranking", route: "/(tabs)/leaderboard" },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Welcome */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700" }}>
            Welcome back, {firstName} 👋
          </Text>
          <Text style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>Here's how you're doing this week</Text>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <StatCard icon="trending-up-outline" iconColor="#3b82f6" value={`₦${stats.totalEarnings.toLocaleString()}`} label="Total Earnings" struck={stats.totalEarnings === 0} />
            <StatCard icon="time-outline" iconColor="#71717a" value={`₦${stats.pendingPayout.toLocaleString()}`} label="Pending Payout" struck={stats.pendingPayout === 0} />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard icon="cart-outline" iconColor="#71717a" value={String(stats.totalSales)} label="Total Sales" />
            <StatCard icon="people-outline" iconColor="#71717a" value={String(stats.referrals)} label="Referrals" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 15, marginBottom: 12 }}>Quick Actions</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={{ width: "47%", backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }}
                onPress={() => router.push(a.route as any)}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(59,130,246,0.1)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={a.icon as any} size={17} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fafafa", fontSize: 11, fontWeight: "600" }} numberOfLines={1}>{a.label}</Text>
                  <Text style={{ color: "#71717a", fontSize: 10 }} numberOfLines={1}>{a.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Earnings Trend */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 13 }}>Earnings Trend</Text>
              <Ionicons name="flash" size={11} color="#f59e0b" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 60 }}>
              {earningsData.map((val, i) => (
                <View key={i} style={{ flex: 1, height: 60, justifyContent: "flex-end" }}>
                  <View style={{ height: Math.max(2, (val / maxEarning) * 56), backgroundColor: "#3b82f6", borderRadius: 3, opacity: val > 0 ? 1 : 0.2 }} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              {earningsData.map((_, i) => (
                <Text key={i} style={{ flex: 1, textAlign: "center", color: "#71717a", fontSize: 9 }}>W{i + 1}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 16 }}>
            <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 13, marginBottom: 12 }}>Recent Activity</Text>
            {recentActivity.length === 0 ? (
              <Text style={{ color: "#71717a", fontSize: 13, textAlign: "center", paddingVertical: 16 }}>No activity yet</Text>
            ) : (
              recentActivity.map((tx, idx) => (
                <View key={tx.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: idx < recentActivity.length - 1 ? 1 : 0, borderBottomColor: "#27272a" }}>
                  <View>
                    <Text style={{ color: "#fafafa", fontSize: 13, fontWeight: "500" }}>{tx.description || tx.type}</Text>
                    <Text style={{ color: "#71717a", fontSize: 11, marginTop: 1 }}>
                      {new Date(tx.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                    </Text>
                  </View>
                  <Text style={{ color: "#4ade80", fontWeight: "700", fontSize: 13 }}>+₦{(tx.amount || 0).toLocaleString()}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Performance Analytics */}
        <View style={{ paddingHorizontal: 16, marginTop: 12, marginBottom: 32 }}>
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="bar-chart-outline" size={15} color="#3b82f6" />
              <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 13 }}>Performance Analytics</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {[
                { label: "Total Sales", value: String(stats.totalSales) },
                { label: "Total Earnings", value: `₦${stats.totalEarnings.toLocaleString()}` },
                { label: "Referrals", value: String(stats.referrals) },
                { label: "Avg Commission Rate", value: "—" },
              ].map((item) => (
                <View key={item.label} style={{ width: "50%", alignItems: "center", paddingVertical: 8 }}>
                  <Text style={{ color: "#fafafa", fontSize: 20, fontWeight: "700" }}>{item.value}</Text>
                  <Text style={{ color: "#71717a", fontSize: 11, marginTop: 2 }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, iconColor, value, label, struck }: { icon: string; iconColor: string; value: string; label: string; struck?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 16 }}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
      <Text style={{ color: "#fafafa", fontSize: 20, fontWeight: "700", marginTop: 8, textDecorationLine: struck ? "line-through" : "none" }}>
        {value}
      </Text>
      <Text style={{ color: "#71717a", fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
