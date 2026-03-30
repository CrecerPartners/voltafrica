import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Share, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/AppHeader";

export default function ReferralsScreen() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: prof }, { data: refs }] = await Promise.all([
      supabase.from("profiles").select("referral_code").eq("id", user.id).single(),
      supabase.from("referrals").select("*, profiles!referrals_referred_id_fkey(name)").eq("referrer_id", user.id).order("date", { ascending: false }),
    ]);
    setReferralCode(prof?.referral_code || "");
    setReferrals(refs || []);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const referralLink = `https://www.tryvoltapp.com/ref/${referralCode}`;
  const totalReferrals = referrals.length;
  const activeSignups = referrals.filter((r) => r.status === "active" || r.status === "earned").length;
  const bonusEarned = referrals.reduce((s: number, r: any) => s + (r.bonus_amount || 0), 0);

  const copyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert("Copied!", "Referral code copied to clipboard.");
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    Alert.alert("Copied!", "Referral link copied to clipboard.");
  };

  const shareLink = async () => {
    await Share.share({ message: `Join Volt and start earning! Use my referral code: ${referralCode}\n${referralLink}` });
  };

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    signed_up: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
    active: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
    earned: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700" }}>Referral Center</Text>
          <Text style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>Invite friends and earn bonuses</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Referral code card */}
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#71717a", fontSize: 12, marginBottom: 8 }}>Your Referral Code</Text>
            <Text style={{ color: "#3b82f6", fontSize: 26, fontWeight: "800", letterSpacing: 2, marginBottom: 16 }}>
              {referralCode || "—"}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <TouchableOpacity onPress={copyCode} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#27272a", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
                <Ionicons name="code-outline" size={14} color="#a1a1aa" />
                <Text style={{ color: "#a1a1aa", fontSize: 12, fontWeight: "600" }}>Copy Code</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={copyLink} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#3b82f6", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
                <Ionicons name="link-outline" size={14} color="#3b82f6" />
                <Text style={{ color: "#3b82f6", fontSize: 12, fontWeight: "600" }}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={shareLink} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#3b82f6", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
                <Ionicons name="share-social-outline" size={14} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          {[
            { icon: "people-outline", color: "#3b82f6", value: totalReferrals, label: "Total Referrals" },
            { icon: "trending-up-outline", color: "#4ade80", value: activeSignups, label: "Active Signups" },
            { icon: "gift-outline", color: "#f59e0b", value: `₦${bonusEarned.toLocaleString()}`, label: "Bonus Earned", strike: bonusEarned === 0 },
          ].map((stat) => (
            <View key={stat.label} style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 12 }}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={{ color: "#fafafa", fontSize: 28, fontWeight: "700", marginTop: 8, textDecorationLine: (stat as any).strike ? "line-through" : "none" }}>
                {stat.value}
              </Text>
              <Text style={{ color: "#71717a", fontSize: 12, marginTop: 4 }}>{stat.label}</Text>
            </View>
          ))}

          {/* Referred list */}
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
            <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 14, padding: 14, borderBottomWidth: 1, borderBottomColor: "#27272a" }}>Referred Students</Text>
            {referrals.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ color: "#71717a", fontSize: 13 }}>No referrals yet. Share your code to get started!</Text>
              </View>
            ) : (
              referrals.map((ref, idx) => {
                const sc = STATUS_COLORS[ref.status] || { bg: "#27272a", text: "#a1a1aa" };
                return (
                  <View key={ref.id} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: "#27272a" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fafafa", fontSize: 13, fontWeight: "500" }}>{ref.profiles?.name || "New User"}</Text>
                      <Text style={{ color: "#71717a", fontSize: 11 }}>
                        {new Date(ref.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                      </Text>
                    </View>
                    {ref.bonus_amount > 0 && (
                      <Text style={{ color: "#4ade80", fontWeight: "700", fontSize: 13, marginRight: 10 }}>+₦{ref.bonus_amount.toLocaleString()}</Text>
                    )}
                    <View style={{ backgroundColor: sc.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: sc.text, fontSize: 10, fontWeight: "600" }}>{ref.status || "signed_up"}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
