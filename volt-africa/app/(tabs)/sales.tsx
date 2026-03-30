import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/AppHeader";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  pending: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  cancelled: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
};

export default function SalesScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchSales = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sales")
      .select("*, products(name)")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    setSales(data || []);
  }, [user]);

  useEffect(() => { fetchSales(); }, [fetchSales]);
  const onRefresh = async () => { setRefreshing(true); await fetchSales(); setRefreshing(false); };

  const filtered = sales.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchType = typeFilter === "all" || s.product_type === typeFilter;
    return matchStatus && matchType;
  });

  const totalSales = sales.length;
  const confirmed = sales.filter((s) => s.status === "confirmed").length;
  const topProduct = sales.reduce((acc: Record<string, number>, s) => {
    const name = s.products?.name || s.product_name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topProductName = Object.keys(topProduct).sort((a, b) => topProduct[b] - topProduct[a])[0] || "—";

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700" }}>Sales Tracking</Text>
            <Text style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>Monitor all your attributed sales & leads</Text>
          </View>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#3b82f6", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
            onPress={() => Alert.alert("Log a Sale", "Coming soon")}
          >
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Log a Sale</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, alignItems: "center" }}>
              <Ionicons name="cart-outline" size={20} color="#3b82f6" />
              <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700", marginTop: 6 }}>{totalSales}</Text>
              <Text style={{ color: "#71717a", fontSize: 10, marginTop: 2 }}>TOTAL SALES</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, alignItems: "center" }}>
              <Ionicons name="trending-up-outline" size={20} color="#4ade80" />
              <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700", marginTop: 6 }}>{confirmed}</Text>
              <Text style={{ color: "#71717a", fontSize: 10, marginTop: 2 }}>CONFIRMED</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, alignItems: "center" }}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
              <Text style={{ color: "#fafafa", fontSize: 13, fontWeight: "700", marginTop: 6 }} numberOfLines={1}>{topProductName}</Text>
              <Text style={{ color: "#71717a", fontSize: 10, marginTop: 2 }}>TOP PRODUCT</Text>
            </View>
          </View>

          {/* Filters */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <Text style={{ color: "#71717a", fontSize: 12, fontWeight: "600" }}>FILTERS:</Text>
              {["all", "Physical", "Digital"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTypeFilter(t)}
                  style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: typeFilter === t ? "#3b82f6" : "#27272a" }}
                >
                  <Text style={{ color: typeFilter === t ? "#fff" : "#a1a1aa", fontSize: 12, fontWeight: "600" }}>
                    {t === "all" ? "All Types" : t}
                  </Text>
                </TouchableOpacity>
              ))}
              {["all", "confirmed", "pending", "cancelled"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatusFilter(s)}
                  style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: statusFilter === s ? "#3b82f6" : "#27272a" }}
                >
                  <Text style={{ color: statusFilter === s ? "#fff" : "#a1a1aa", fontSize: 12, fontWeight: "600" }}>
                    {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Table */}
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, overflow: "hidden" }}>
            {/* Header row */}
            <View style={{ flexDirection: "row", backgroundColor: "#27272a", paddingHorizontal: 12, paddingVertical: 10 }}>
              {["Date", "Product", "Type", "Amount", "Commission", "Status"].map((h) => (
                <Text key={h} style={{ color: "#71717a", fontSize: 10, fontWeight: "600", flex: h === "Product" ? 2 : 1 }}>{h}</Text>
              ))}
            </View>
            {filtered.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ color: "#71717a", fontSize: 13 }}>No sales found matching your criteria.</Text>
              </View>
            ) : (
              filtered.map((sale, idx) => {
                const statusStyle = STATUS_COLORS[sale.status] || { bg: "#27272a", text: "#a1a1aa" };
                return (
                  <View
                    key={sale.id}
                    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: "#27272a" }}
                  >
                    <Text style={{ color: "#a1a1aa", fontSize: 10, flex: 1 }}>
                      {new Date(sale.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </Text>
                    <Text style={{ color: "#fafafa", fontSize: 11, flex: 2 }} numberOfLines={1}>
                      {sale.products?.name || sale.product_name || "—"}
                    </Text>
                    <Text style={{ color: "#a1a1aa", fontSize: 10, flex: 1 }}>{sale.product_type || "—"}</Text>
                    <Text style={{ color: "#fafafa", fontSize: 11, flex: 1 }}>₦{(sale.amount || 0).toLocaleString()}</Text>
                    <Text style={{ color: "#4ade80", fontSize: 11, flex: 1 }}>₦{(sale.commission_earned || 0).toLocaleString()}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ backgroundColor: statusStyle.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" }}>
                        <Text style={{ color: statusStyle.text, fontSize: 9, fontWeight: "600" }}>{sale.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
