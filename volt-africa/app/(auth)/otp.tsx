import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function OtpScreen() {
  const { email, mode } = useLocalSearchParams<{ email: string; mode: "login" | "signup" }>();
  const { verifyOtp, resendLoginOtp, resendSignupOtp } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length < 6) { Alert.alert("Error", "Enter the 6-digit code."); return; }
    setLoading(true);
    try {
      const { error } = await verifyOtp(email, token, mode === "signup" ? "signup" : "email");
      if (error) {
        Alert.alert("Verification Failed", error.message);
      } else {
        router.replace("/(tabs)/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    const fn = mode === "signup" ? resendSignupOtp : resendLoginOtp;
    const { error } = await fn(email);
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Sent", "A new code has been sent to your email.");
      setCountdown(60);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingHorizontal: 24, paddingTop: 80, alignItems: "center" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Mail icon */}
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(59,130,246,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" }}>
        <Ionicons name="mail" size={32} color="#3b82f6" />
      </View>

      <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", textAlign: "center" }}>Check your email</Text>
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 }}>
        We sent a 6-digit code to{"\n"}
        <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>{email}</Text>
      </Text>

      {/* OTP Boxes */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 36 }}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => { if (r) inputs.current[i] = r; }}
            style={{
              width: 48,
              height: 58,
              backgroundColor: digit ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)",
              borderWidth: 1.5,
              borderColor: digit ? "#3b82f6" : "rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#fff",
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
            }}
            value={digit}
            onChangeText={(v) => handleChange(v, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        style={{ borderRadius: 14, overflow: "hidden", marginTop: 32, width: "100%" }}
      >
        <LinearGradient
          colors={["#0ea5e9", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 54, alignItems: "center", justifyContent: "center" }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Verify Email</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Resend */}
      <TouchableOpacity onPress={handleResend} disabled={countdown > 0} style={{ marginTop: 20 }}>
        <Text style={{ color: countdown > 0 ? "rgba(255,255,255,0.35)" : "#3b82f6", fontSize: 14, textAlign: "center" }}>
          {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
        </Text>
      </TouchableOpacity>

      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Ionicons name="arrow-back" size={14} color="rgba(255,255,255,0.4)" />
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Use a different email</Text>
      </TouchableOpacity>
    </View>
  );
}
