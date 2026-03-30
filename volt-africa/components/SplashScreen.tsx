import { useEffect, useRef } from "react";
import { View, Image, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start(() => {
      // Hold for 1.8s then fade out
      setTimeout(() => {
        Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }).start(onComplete);
      }, 1800);
    });
  }, []);

  return (
    <Animated.View style={{ flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      {/* Subtle glow blob */}
      <View style={{ position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(59,130,246,0.06)", top: height / 2 - 150, left: width / 2 - 150 }} />

      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: "center" }}>
        <Image
          source={require("../assets/Volt1.png")}
          style={{ width: 180, height: 72 }}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}
