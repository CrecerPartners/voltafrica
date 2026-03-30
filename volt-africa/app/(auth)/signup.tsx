import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, Image
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const sellerTypes = ["Student", "NYSC member", "Fresh grad", "Micro-influencer", "Content creator", "Young urban youth seller"];
const cities = ["Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan", "Enugu", "Benin City", "Kaduna"];

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sellerType, setSellerType] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showCitySelect, setShowCitySelect] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !sellerType || !city) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const university = `${sellerType} — ${city}`;
      const { error } = await signUp(email, password, fullName, university, sellerType);
      if (error) {
        Alert.alert("Signup Failed", error.message);
      } else {
        router.push({ pathname: "/(auth)/otp", params: { email, mode: "signup" } });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  };

  const labelStyle = { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" as const, marginBottom: 8 };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <Image
              source={require("@/assets/Volt1.png")}
              style={{ width: 120, height: 40, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", textAlign: "center" }}>Join the VoltSquad</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 6, textAlign: "center" }}>Start earning as a Volt seller</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, backgroundColor: "rgba(59,130,246,0.1)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Ionicons name="gift" size={15} color="#f59e0b" />
              <Text style={{ color: "#3b82f6", fontSize: 13, fontWeight: "600" }}>Get ₦500 signup bonus!</Text>
            </View>
          </View>

          {/* Card */}
          <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 24, gap: 16 }}>
            {/* Name Row */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>First Name</Text>
                <TextInput style={inputStyle} placeholder="Chidera" placeholderTextColor="rgba(255,255,255,0.25)" value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Last Name</Text>
                <TextInput style={inputStyle} placeholder="Okafor" placeholderTextColor="rgba(255,255,255,0.25)" value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text style={labelStyle}>Email</Text>
              <TextInput style={inputStyle} placeholder="you@email.com" placeholderTextColor="rgba(255,255,255,0.25)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            {/* Password */}
            <View>
              <Text style={labelStyle}>Password</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={[inputStyle, { paddingRight: 48 }]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={{ position: "absolute", right: 14, top: 14 }} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Seller Type */}
            <View>
              <Text style={labelStyle}>What best describes you?</Text>
              <TouchableOpacity
                style={[inputStyle, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
                onPress={() => { setShowTypeSelect(!showTypeSelect); setShowCitySelect(false); }}
              >
                <Text style={{ color: sellerType ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 15 }}>{sellerType || "Select your category"}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              {showTypeSelect && (
                <View style={{ marginTop: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", backgroundColor: "#111" }}>
                  {sellerTypes.map((t) => (
                    <TouchableOpacity key={t} style={{ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }} onPress={() => { setSellerType(t); setShowTypeSelect(false); }}>
                      <Text style={{ color: "#fff", fontSize: 14 }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* City */}
            <View>
              <Text style={labelStyle}>City</Text>
              <TouchableOpacity
                style={[inputStyle, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
                onPress={() => { setShowCitySelect(!showCitySelect); setShowTypeSelect(false); }}
              >
                <Text style={{ color: city ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 15 }}>{city || "Select your city"}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              {showCitySelect && (
                <View style={{ marginTop: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", backgroundColor: "#111" }}>
                  {cities.map((c) => (
                    <TouchableOpacity key={c} style={{ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }} onPress={() => { setCity(c); setShowCitySelect(false); }}>
                      <Text style={{ color: "#fff", fontSize: 14 }}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handleSignup}
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
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, gap: 4 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ color: "#3b82f6", fontSize: 14, fontWeight: "600" }}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
