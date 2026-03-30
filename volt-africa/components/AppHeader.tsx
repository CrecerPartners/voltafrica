import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";

export function AppHeader() {
  const { user } = useAuth();
  const [initials, setInitials] = useState("V");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
      if (data?.name) {
        const parts = data.name.trim().split(" ");
        setInitials(parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2));
      }
    });
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setUnread((data || []).filter((n: any) => !n.read).length);
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const openNotifications = async () => {
    setNotifOpen(true);
    fetchNotifications();
    // Mark all as read
    if (user && unread > 0) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
      setUnread(0);
    }
  };

  const notifIcon = (type: string) => {
    if (type === "sale") return { icon: "cart-outline", color: "#8b5cf6" };
    if (type === "commission") return { icon: "trending-up-outline", color: "#4ade80" };
    if (type === "payout") return { icon: "cash-outline", color: "#3b82f6" };
    if (type === "referral") return { icon: "people-outline", color: "#f59e0b" };
    return { icon: "notifications-outline", color: "#a1a1aa" };
  };

  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: "#09090b", borderBottomWidth: 1, borderBottomColor: "#18181b" }}>
        <Image
          source={require("@/assets/Volt1.png")}
          style={{ width: 64, height: 24 }}
          resizeMode="contain"
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* Notifications */}
          <TouchableOpacity onPress={openNotifications} style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={22} color="#a1a1aa" />
            {unread > 0 && (
              <View style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>{unread > 9 ? "9+" : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Avatar */}
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#1d4ed8", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{initials}</Text>
          </View>
        </View>
      </View>

      {/* Notifications Modal */}
      <Modal visible={notifOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setNotifOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "#09090b" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#27272a" }}>
            <Text style={{ color: "#fafafa", fontSize: 18, fontWeight: "700" }}>Notifications</Text>
            <TouchableOpacity onPress={() => setNotifOpen(false)}>
              <Ionicons name="close" size={24} color="#71717a" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }}>
            {notifications.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
                <Ionicons name="notifications-off-outline" size={48} color="#27272a" />
                <Text style={{ color: "#71717a", fontSize: 14 }}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((n, idx) => {
                const meta = notifIcon(n.type);
                return (
                  <View key={n.id || idx} style={{ flexDirection: "row", padding: 16, borderBottomWidth: 1, borderBottomColor: "#18181b", backgroundColor: n.read ? "transparent" : "rgba(59,130,246,0.04)" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: meta.color + "22", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
                      <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fafafa", fontSize: 13, fontWeight: n.read ? "400" : "600" }}>{n.title || n.message || "New notification"}</Text>
                      {n.body && <Text style={{ color: "#71717a", fontSize: 12, marginTop: 2 }} numberOfLines={2}>{n.body}</Text>}
                      <Text style={{ color: "#52525b", fontSize: 11, marginTop: 4 }}>
                        {new Date(n.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                    {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3b82f6", marginTop: 6, flexShrink: 0 }} />}
                  </View>
                );
              })
            )}
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
