import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen as VoltSplash } from "@/components/SplashScreen";
import { Onboarding } from "@/components/Onboarding";

type Phase = "splash" | "onboarding" | "ready";

export default function Index() {
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState<Phase>("splash");

  const handleSplashDone = async () => {
    try {
      const seen = await AsyncStorage.getItem("onboarding_done");
      setPhase(seen ? "ready" : "onboarding");
    } catch {
      // If AsyncStorage fails for any reason, skip onboarding
      setPhase("ready");
    }
  };

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem("onboarding_done", "true");
    } catch {}
    setPhase("ready");
  };

  if (phase === "splash") {
    return <VoltSplash onComplete={handleSplashDone} />;
  }

  if (phase === "onboarding") {
    return <Onboarding onComplete={handleOnboardingDone} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)/dashboard" : "/(auth)/login"} />;
}
