import { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    image: require("../assets/onboarding1.png"),
    title: "Welcome to VoltAfrica",
    description: "The ultimate Gen Z distribution network.\nDiscover amazing products and brands to sell.",
    isLast: false,
  },
  {
    image: require("../assets/onboarding2.png"),
    title: "Share & Influence",
    description: "Leverage your community and social networks\nto drive sales without paying for ads.",
    isLast: false,
  },
  {
    image: require("../assets/onboarding3.png"),
    title: "Earn Real Commissions",
    description: "Get paid automatically for every sale you\nmake. Track everything right from your phone.",
    isLast: true,
  },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[step];

  const goNext = () => {
    if (step < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setStep((s) => s + 1), 200);
    }
  };

  const goToSignup = () => {
    onComplete();
    router.push("/(auth)/signup");
  };

  const goToLogin = () => {
    onComplete();
    router.push("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full-screen background image */}
      <Animated.View style={{ position: "absolute", inset: 0, opacity: fadeAnim }}>
        <Image
          source={slide.image}
          style={{ width, height, position: "absolute" }}
          resizeMode="cover"
        />
        {/* Dark overlay */}
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
        {/* Bottom gradient fade */}
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: height * 0.55,
          backgroundColor: "transparent",
        }}>
          {/* Simulated gradient using stacked views */}
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0)" }} />
          <View style={{ height: 80, backgroundColor: "rgba(0,0,0,0.3)" }} />
          <View style={{ height: 80, backgroundColor: "rgba(0,0,0,0.6)" }} />
          <View style={{ height: 80, backgroundColor: "rgba(0,0,0,0.85)" }} />
          <View style={{ flex: 1, backgroundColor: "#000" }} />
        </View>
      </Animated.View>

      {/* Top logo */}
      <View style={{ position: "absolute", top: 52, right: 16, flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Ionicons name="flash" size={14} color="#3b82f6" />
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, letterSpacing: 1 }}>VOL</Text>
      </View>

      {/* Bottom content */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 40 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Title */}
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 12, lineHeight: 34 }}>
            {slide.title}
          </Text>
          {/* Description */}
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 32 }}>
            {slide.description}
          </Text>
        </Animated.View>

        {/* Dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                height: 8,
                width: i === step ? 28 : 8,
                borderRadius: 4,
                backgroundColor: i === step ? "#3b82f6" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </View>

        {/* Buttons */}
        {!slide.isLast ? (
          <TouchableOpacity
            onPress={goNext}
            style={{
              borderRadius: 14,
              overflow: "hidden",
              marginTop: 4
            }}
          >
            <LinearGradient
              colors={["#0ea5e9", "#7c3aed"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 54, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={goToSignup}
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#0ea5e9", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 54, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Create an Account</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToLogin}
              style={{ height: 48, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: "500" }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
