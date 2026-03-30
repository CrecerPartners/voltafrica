import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/AppHeader";

const TIERS = [
  { name: "Bronze", min: 0, max: 25000, color: "#cd7f32" },
  { name: "Silver", min: 25000, max: 75000, color: "#a8a9ad" },
  { name: "Gold", min: 75000, max: 150000, color: "#f59e0b" },
  { name: "Platinum", min: 150000, max: Infinity, color: "#e5e4e2" },
];

function getTier(amount: number) {
  return TIERS.slice().reverse().find((t) => amount >= t.min) || TIERS[0];
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [myEarnings, setMyEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: board }, { data: txns }] = await Promise.all([
      supabase.from("leaderboard").select("*").order("total_earnings", { ascending: false }).limit(50),
      supabase.from("transactions").select("amount,type").eq("user_id", user.id),
    ]);
    setEntries(board || []);
    const earned = (txns || []).filter((t: any) => t.type !== "payout").reduce((s: number, t: any) => s + (t.amount || 0), 0);
    setMyEarnings(earned);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const currentTier = getTier(myEarnings);
  const nextTierIdx = TIERS.findIndex((t) => t.name === currentTier.name) + 1;
  const nextTier = TIERS[nextTierIdx] || null;
  const progressPct = nextTier
    ? Math.min(100, ((myEarnings - currentTier.min) / (currentTier.max - currentTier.min)) * 100)
    : 100;

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Ionicons name="crown" size={18} color="#f59e0b" />;
    if (rank === 2) return <Ionicons name="medal-outline" size={18} color="#a8a9ad" />;
    if (rank === 3) return <Ionicons name="trophy-outline" size={18} color="#cd7f32" />;
    return <Text style={{ color: "#71717a", fontSize: 13, fontWeight: "600", width: 18, textAlign: "center" }}>#{rank}</Text>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700" }}>Leaderboard</Text>
          <Text style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>See how you rank among fellow agents</Text>
        </View>

        {/* Tier progress */}
        <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <View>
              <Text style={{ color: "#71717a", fontSize: 11 }}>Current Tier</Text>
              <Text style={{ color: currentTier.color, fontSize: 18, fontWeight: "700" }}>{currentTier.name}</Text>
            </View>
            {nextTier && (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#71717a", fontSize: 11 }}>Next Tier</Text>
                <Text style={{ color: "#fafafa", fontSize: 18, fontWeight: "700" }}>{nextTier.name}</Text>
              </View>
            )}
          </View>
          <View style={{ height: 6, backgroundColor: "#27272a", borderRadius: 3, overflow: "hidden" }}>
            <View style={{ height: 6, width: `${progressPct}%`, backgroundColor: "#3b82f6", borderRadius: 3 }} />
          </View>
          {nextTier && (
            <Text style={{ color: "#71717a", fontSize: 11, marginTop: 8, textAlign: "center" }}>
              ₦{(currentTier.max - myEarnings).toLocaleString()} more to reach {nextTier.name}
            </Text>
          )}
        </View>

        {/* Rankings */}
        <View style={{ marginHorizontal: 16, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
          <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 14, padding: 14, borderBottomWidth: 1, borderBottomColor: "#27272a" }}>Rankings</Text>
          {entries.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: "#71717a", fontSize: 13 }}>No rankings yet</Text>
            </View>
          ) : (
            entries.map((entry, idx) => {
              const isMe = entry.user_id === user?.id;
              return (
                <View
                  key={entry.id || idx}
                  style={{ flexDirection: "row", alignItems: "center", padding: 14, borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: "#27272a", backgroundColor: isMe ? "rgba(59,130,246,0.08)" : "transparent" }}
                >
                  <View style={{ width: 28, alignItems: "center", marginRight: 12 }}>{rankIcon(idx + 1)}</View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ color: isMe ? "#3b82f6" : "#fafafa", fontWeight: "600", fontSize: 14 }}>
                        {entry.name || "Seller"}{isMe ? " (You)" : ""}
                      </Text>
                    </View>
                    <Text style={{ color: "#71717a", fontSize: 11, marginTop: 1 }}>{entry.university || entry.city || ""}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: "#fafafa", fontWeight: "700", fontSize: 14 }}>₦{(entry.total_earnings || 0).toLocaleString()}</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>{entry.total_sales || 0} sales</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
