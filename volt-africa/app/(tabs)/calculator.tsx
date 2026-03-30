import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/AppHeader";

type Mode = "quick" | "target";

export default function CalculatorScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("quick");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [items, setItems] = useState<{ product: any; qty: number }[]>([]);
  const [targetAmount, setTargetAmount] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);

  useEffect(() => {
    supabase.from("products").select("id,name,commission_rate,commission_type,commission_value,price").eq("is_active", true).then(({ data }) => setProducts(data || []));
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const calcCommission = (product: any, qty: number) => {
    if (!product) return 0;
    if (product.commission_type === "percentage") return (product.price || 0) * (product.commission_rate / 100) * qty;
    if (product.commission_type === "fixed") return (product.commission_value || 0) * qty;
    return 0;
  };

  const totalEarnings = items.reduce((s, item) => s + calcCommission(item.product, item.qty), 0);
  const totalSales = items.reduce((s, item) => s + item.qty, 0);
  const avgCommission = totalSales > 0 ? totalEarnings / totalSales : 0;
  const target = parseFloat(targetAmount) || 0;
  const progressPct = target > 0 ? Math.min(100, (totalEarnings / target) * 100) : 0;

  const addItem = () => {
    if (!selectedProduct) { Alert.alert("Select a product first"); return; }
    const qty = parseInt(quantity) || 1;
    setItems((prev) => {
      const existing = prev.findIndex((i) => i.product.id === selectedProduct.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], qty: next[existing].qty + qty };
        return next;
      }
      return [...prev, { product: selectedProduct, qty }];
    });
    setSelectedProductId("");
    setQuantity("1");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <AppHeader />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700" }}>Target Calculator</Text>
          <Text style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>Strategic planning to hit your income goals</Text>
        </View>

        {/* Mode tabs */}
        <View style={{ marginHorizontal: 16, flexDirection: "row", backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {(["quick", "target"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: mode === m ? "#27272a" : "transparent", flexDirection: "row", justifyContent: "center", gap: 6 }}
            >
              <Ionicons name={m === "quick" ? "document-text-outline" : "radio-button-on-outline"} size={14} color={mode === m ? "#fafafa" : "#71717a"} />
              <Text style={{ color: mode === m ? "#fafafa" : "#71717a", fontSize: 13, fontWeight: "600" }}>
                {m === "quick" ? "Quick Est." : "Income Target"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Target input (target mode only) */}
          {mode === "target" && (
            <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 13, marginBottom: 8 }}>Income Goal (₦)</Text>
              <TextInput
                style={{ backgroundColor: "#27272a", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: "#fafafa", fontSize: 16 }}
                placeholder="e.g. 50000"
                placeholderTextColor="#71717a"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Product selector */}
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Ionicons name="add-outline" size={16} color="#f59e0b" />
              <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 13 }}>Select Products to Sell</Text>
              <Text style={{ color: "#ef4444" }}>*</Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowProductPicker(!showProductPicker)}
              style={{ backgroundColor: "#27272a", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}
            >
              <Text style={{ color: selectedProduct ? "#fafafa" : "#71717a", fontSize: 13 }}>
                {selectedProduct ? `${selectedProduct.name} (${selectedProduct.commission_rate || selectedProduct.commission_value}${selectedProduct.commission_type === "percentage" ? "%" : "₦"} comm.)` : "Select a product"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#71717a" />
            </TouchableOpacity>

            {showProductPicker && (
              <View style={{ backgroundColor: "#27272a", borderRadius: 10, marginBottom: 10, maxHeight: 200, overflow: "hidden" }}>
                <ScrollView>
                  {products.map((p) => (
                    <TouchableOpacity key={p.id} style={{ paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#18181b" }}
                      onPress={() => { setSelectedProductId(p.id); setShowProductPicker(false); }}>
                      <Text style={{ color: "#fafafa", fontSize: 13 }}>{p.name}</Text>
                      <Text style={{ color: "#71717a", fontSize: 11, marginTop: 2 }}>
                        Commission: {p.commission_type === "percentage" ? `${p.commission_rate}%` : `₦${p.commission_value}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput
              style={{ backgroundColor: "#27272a", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: "#fafafa", fontSize: 14, marginBottom: 10 }}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Quantity"
              placeholderTextColor="#71717a"
            />

            <TouchableOpacity
              onPress={addItem}
              style={{ borderRadius: 10, paddingVertical: 13, alignItems: "center", overflow: "hidden" }}
            >
              <View style={{ position: "absolute", inset: 0, backgroundColor: "#3b82f6" }} />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, zIndex: 1 }}>Add to Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Items list */}
          {items.length > 0 && (
            <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <Text style={{ color: "#fafafa", fontWeight: "600", fontSize: 13, marginBottom: 10 }}>Your Plan</Text>
              {items.map((item, idx) => (
                <View key={item.product.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: "#27272a" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fafafa", fontSize: 13 }}>{item.product.name}</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>
                      {item.qty} × ₦{calcCommission(item.product, 1).toLocaleString()} = ₦{calcCommission(item.product, item.qty).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Results */}
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#3b82f6", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <Text style={{ color: "#71717a", fontSize: 10, fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>EST. EARNINGS</Text>
            <Text style={{ color: "#3b82f6", fontSize: 36, fontWeight: "800", textDecorationLine: totalEarnings === 0 ? "line-through" : "none" }}>
              ₦{totalEarnings.toLocaleString()}
            </Text>
            <Text style={{ color: "#71717a", fontSize: 12, marginTop: 2 }}>from {totalSales} total sales</Text>
            {items.length === 0 && (
              <Text style={{ color: "#71717a", fontSize: 13, marginTop: 16, textAlign: "center" }}>✨ Add products to see your earning potential! 💡</Text>
            )}
            {mode === "target" && target > 0 && (
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ color: "#71717a", fontSize: 12 }}>Goal Progress</Text>
                  <Text style={{ color: "#fafafa", fontSize: 12, fontWeight: "600" }}>{progressPct.toFixed(0)}%</Text>
                </View>
                <View style={{ height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <View style={{ height: 6, width: `${progressPct}%`, backgroundColor: "#3b82f6", borderRadius: 3 }} />
                </View>
              </View>
            )}
          </View>

          {/* How it works */}
          <View style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, padding: 14, marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Ionicons name="information-circle-outline" size={14} color="#71717a" />
              <Text style={{ color: "#71717a", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 }}>HOW IT WORKS</Text>
            </View>
            {[
              "Set an income target to see exactly what products to focus on.",
              "Weekly and Daily targets help you stay on track with consistent sales.",
              "Saved targets will be tracked on your dashboard.",
            ].map((tip, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
                <Ionicons name="chevron-forward" size={12} color="#3b82f6" style={{ marginTop: 2 }} />
                <Text style={{ color: "#71717a", fontSize: 12, flex: 1 }}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
