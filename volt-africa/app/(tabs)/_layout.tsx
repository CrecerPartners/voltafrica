import { Tabs, router } from "expo-router";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MoreDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { signOut } = useAuth();

  const items = [
    { icon: "calculator-outline", label: "Calculator", route: "/(tabs)/calculator" },
    { icon: "people-outline", label: "Referrals", route: "/(tabs)/referrals" },
    { icon: "trophy-outline", label: "Leaderboard", route: "/(tabs)/leaderboard" },
    { icon: "school-outline", label: "Training", route: "/(tabs)/training" },
    { icon: "settings-outline", label: "Settings", route: "/(tabs)/settings" },
  ] as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <View className="bg-card border-t border-border rounded-t-2xl px-4 pt-3 pb-8">
        <View className="w-10 h-1 bg-border rounded-full self-center mb-4" />
        <View className="flex-row items-center gap-2 mb-4 px-1">
          <Ionicons name="flash" size={14} color="#f59e0b" />
          <Text className="text-foreground font-bold text-base">More</Text>
        </View>
        <View className="flex-row flex-wrap gap-3 mb-4">
          {items.map((item) => (
             <TouchableOpacity
              key={item.label}
              className="w-[22%] bg-muted border border-border rounded-xl p-3 items-center gap-2"
              onPress={() => { onClose(); router.push(item.route as any); }}
            >
              <Ionicons name={item.icon as any} size={22} color="#a1a1aa" />
              <Text className="text-foreground text-xs font-medium text-center">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          className="bg-destructive/10 border border-destructive/30 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
          onPress={() => { onClose(); signOut(); }}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text className="text-destructive font-semibold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, loading]);

  if (loading || !user) return null; // Prevent showing tabs content before redirect

  return (
    <>
      <MoreDrawer visible={moreOpen} onClose={() => setMoreOpen(false)} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#18181b",
            borderTopColor: "#27272a",
            height: 62 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 6,
          },
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "#71717a",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Market",
            tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="sales"
          options={{
            title: "Sales",
            tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more-placeholder"
          options={{
            title: "More",
            tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />,
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as any)}
                onPress={() => setMoreOpen(true)}
                style={[props.style as any]}
              >
                {props.children}
              </TouchableOpacity>
            ),
          }}
        />
        {/* Hidden screens accessible from More drawer */}
        <Tabs.Screen name="calculator" options={{ href: null }} />
        <Tabs.Screen name="referrals" options={{ href: null }} />
        <Tabs.Screen name="leaderboard" options={{ href: null }} />
        <Tabs.Screen name="training" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        {/* Legacy names - redirect */}
        <Tabs.Screen name="products" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </>
  );
}
