import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Image, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/AppHeader";
import { LinearGradient } from "expo-linear-gradient";

const CATEGORY_COLORS: Record<string, string> = {
  "Fashion & Lifestyle": "#ec4899",
  "Electronics & Gadgets": "#3b82f6",
  Fintech: "#10b981",
  "Tech Products": "#8b5cf6",
  "Software & Tools": "#f59e0b",
  Subscriptions: "#6366f1",
};

export default function MarketplaceScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [shopItems, setShopItems] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  
  const [activeType, setActiveType] = useState("All Products");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [activeSubcategory, setActiveSubcategory] = useState("All Subcategories");
  const [activeBrand, setActiveBrand] = useState("All Brands");
  
  const [refreshing, setRefreshing] = useState(false);
  const [firstName, setFirstName] = useState("Seller");

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [{ data: prods }, { data: prof }, { data: shop }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("name, referral_code").eq("id", user.id).single(),
      supabase.from("seller_shop_items").select("product_id").eq("user_id", user.id),
    ]);
    setProducts(prods || []);
    setProfile(prof);
    setShopItems((shop || []).map((s: any) => s.product_id));
    if (prof?.name) setFirstName(prof.name.split(" ")[0]);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const typesMap = Array.from(new Set(products.map(p => p.product_type).filter(Boolean))) as string[];
  const types = ["All Products", ...typesMap.map(t => t.endsWith(" Products") ? t : t + " Products")];
  
  const categoriesMap = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const categories = ["All Categories", ...categoriesMap];
  
  const subcatsMap = Array.from(new Set(products.map(p => p.subcategory).filter(Boolean))) as string[];
  const subcategories = ["All Subcategories", ...subcatsMap];
  
  const brandsMap = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
  const brands = ["All Brands", ...brandsMap];

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "All Products" || p.product_type === activeType.replace(" Products", "");
    const matchCat = activeCategory === "All Categories" || p.category === activeCategory;
    const matchSubCat = activeSubcategory === "All Subcategories" || p.subcategory === activeSubcategory;
    const matchBrand = activeBrand === "All Brands" || p.brand === activeBrand;
    return matchSearch && matchType && matchCat && matchSubCat && matchBrand;
  });

  const toggleShop = async (productId: string) => {
    if (!user) return;
    if (shopItems.includes(productId)) {
      await supabase.from("seller_shop_items").delete().eq("user_id", user.id).eq("product_id", productId);
      setShopItems((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase.from("seller_shop_items").insert({ user_id: user.id, product_id: productId });
      setShopItems((prev) => [...prev, productId]);
    }
  };

  const copyLink = async (product: any) => {
    const code = profile?.referral_code || "";
    const link = `https://www.tryvoltapp.com/p/${product.slug || product.id}?ref=${code}`;
    await Share.share({ message: `Check out ${product.name} on Volt! ${link}` });
  };

  function FilterBtn({ label, isActive, onPress, isAll }: { label: string, isActive: boolean, onPress: () => void, isAll: boolean }) {
    if (isAll) {
      return (
        <TouchableOpacity onPress={onPress}>
          <LinearGradient
            colors={isActive ? ["#3b82f6", "#8b5cf6"] : ["#18181b", "#18181b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: isActive ? 0 : 1, borderColor: "#27272a" }}
          >
            <Text style={{ color: isActive ? "#fff" : "#71717a", fontSize: 12, fontWeight: "700" }}>{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
          backgroundColor: isActive ? "#27272a" : "transparent",
          borderWidth: 1, borderColor: isActive ? "#52525b" : "#27272a"
        }}
      >
        <Text style={{ color: isActive ? "#fff" : "#a1a1aa", fontSize: 12, fontWeight: isActive ? "600" : "500" }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Banner */}
        <LinearGradient
          colors={["#0ea5e9", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20 }}
        >
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
            What are you selling today, <Text style={{ textDecorationLine: "underline" }}>{firstName}</Text>?
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 6 }}>
            {filtered.length} products available
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, paddingHorizontal: 14, marginTop: 16, gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, color: "#fff", fontSize: 14 }}
              placeholder="Search products, brands..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </LinearGradient>

        {/* Filters Grid */}
        <View style={{ marginVertical: 20, gap: 12 }}>
          {types.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {types.map(t => <FilterBtn key={t} label={t} isActive={t === activeType} onPress={() => setActiveType(t)} isAll={t.startsWith("All ")} />)}
            </ScrollView>
          )}
          {categories.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {categories.map(c => <FilterBtn key={c} label={c} isActive={c === activeCategory} onPress={() => setActiveCategory(c)} isAll={c.startsWith("All ")} />)}
            </ScrollView>
          )}
          {subcategories.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {subcategories.map(s => <FilterBtn key={s} label={s} isActive={s === activeSubcategory} onPress={() => setActiveSubcategory(s)} isAll={s.startsWith("All ")} />)}
            </ScrollView>
          )}
          
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}>
              {brands.map(b => <FilterBtn key={b} label={b} isActive={b === activeBrand} onPress={() => setActiveBrand(b)} isAll={b.startsWith("All ")} />)}
            </ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="filter-outline" size={16} color="#71717a" />
              <Text style={{ color: "#71717a", fontSize: 12, fontWeight: "600" }}>Commission</Text>
            </View>
          </View>
        </View>

        {/* Products */}
        <View style={{ paddingHorizontal: 16 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Ionicons name="file-tray-outline" size={48} color="#27272a" />
              <Text style={{ color: "#71717a", fontSize: 13, marginTop: 12 }}>No products match your filters</Text>
            </View>
          ) : (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} inShop={shopItems.includes(product.id)} onToggleShop={() => toggleShop(product.id)} onShare={() => copyLink(product)} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ProductCard({ product, inShop, onToggleShop, onShare }: { product: any; inShop: boolean; onToggleShop: () => void; onShare: () => void }) {
  const catColor = CATEGORY_COLORS[product.category] || "#3b82f6";
  const commission = product.commission_model === "percentage" || product.commission_type === "percentage"
    ? `${product.commission_rate || product.commission_value}%`
    : product.commission_model === "fixed" || product.commission_type === "fixed" ? `₦${(product.commission_value || product.commission_rate || 0).toLocaleString()}` : product.commission_type;

  return (
    <View style={{ backgroundColor: "#111", borderRadius: 20, marginBottom: 24, overflow: "hidden" }}>
      <View style={{ position: "relative" }}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={{ width: "100%", height: 350 }} resizeMode="cover" />
        ) : (
          <View style={{ width: "100%", height: 350, backgroundColor: "#18181b", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="image-outline" size={40} color="#3f3f46" />
          </View>
        )}
        {product.category && (
          <View style={{ position: "absolute", top: 16, right: 16, backgroundColor: `${catColor}33`, borderColor: `${catColor}66`, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: catColor, fontSize: 11, fontWeight: "700" }}>{product.category}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ color: "#fafafa", fontWeight: "800", fontSize: 20, flex: 1 }} numberOfLines={1}>{product.name}</Text>
          {product.product_type && (
            <View style={{ backgroundColor: "#18181b", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#a1a1aa", fontSize: 10, fontWeight: "700" }}>{product.product_type}</Text>
            </View>
          )}
        </View>
        
        {product.brand && <Text style={{ color: "#71717a", fontSize: 13, marginBottom: 16, fontWeight: "500" }}>{product.brand}</Text>}

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#a1a1aa", fontSize: 13, fontWeight: "600" }}>₦{(Number(product.price) || 0).toLocaleString()}</Text>
          {commission && <Text style={{ color: "#3b82f6", fontSize: 16, fontWeight: "800" }}>{commission}</Text>}
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={onToggleShop} style={{ flex: 1 }}>
            <LinearGradient
              colors={inShop ? ["#27272a", "#27272a"] : ["#0ea5e9", "#7c3aed"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name={inShop ? "checkmark" : "cart-outline"} size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{inShop ? "In Shop" : "Add to Shop"}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#000", borderWidth: 1, borderColor: "#27272a", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="link-outline" size={20} color="#fafafa" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
