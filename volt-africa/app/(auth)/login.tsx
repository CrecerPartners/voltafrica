import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, Image
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const { signIn, signOut, sendLoginOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }
      await signOut({ skipRedirect: true });
      const { error: otpError } = await sendLoginOtp(email);
      if (otpError) {
        Alert.alert("Error", otpError.message);
      } else {
        router.push({ pathname: "/(auth)/otp", params: { email, mode: "login" } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <Image
              source={require("@/assets/Volt1.png")}
              style={{ width: 120, height: 40, marginBottom: 24 }}
              resizeMode="contain"
            />
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", textAlign: "center" }}>Welcome Back</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 6, textAlign: "center" }}>Sign in to your dashboard</Text>
          </View>

          {/* Card */}
          <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 24, gap: 16 }}>
            {/* Email */}
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>Email</Text>
              <TextInput
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 15 }}
                placeholder="you@email.com"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>Password</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, paddingRight: 48, color: "#fff", fontSize: 15 }}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={{ position: "absolute", right: 14, top: 14 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{ borderRadius: 14, overflow: "hidden", marginTop: 4 }}
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
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, gap: 4 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Don't have an account?</Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={{ color: "#3b82f6", fontSize: 14, fontWeight: "600" }}>Join Now</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
