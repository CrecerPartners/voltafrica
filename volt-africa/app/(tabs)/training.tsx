import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";

const COURSE_COLORS = ["#ec4899", "#8b5cf6", "#f59e0b", "#3b82f6", "#10b981", "#ef4444"];
const CATEGORIES = ["All", "Sales Skills", "Marketing", "Branding"];

export default function TrainingScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: courseData }, { data: progData }] = await Promise.all([
      supabase.from("training_courses").select("*, training_lessons(count)").eq("is_published", true),
      supabase.from("training_progress").select("lesson_id, completed, training_lessons(course_id)").eq("user_id", user.id),
    ]);
    setCourses(courseData || []);

    const pct: Record<string, number> = {};
    (courseData || []).forEach((c: any) => {
      const total = c.training_lessons?.[0]?.count || 0;
      const done = (progData || []).filter((p: any) => p.training_lessons?.course_id === c.id && p.completed).length;
      pct[c.id] = total > 0 ? Math.round((done / total) * 100) : 0;
    });
    setProgress(pct);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ color: "#fafafa", fontSize: 22, fontWeight: "700" }}>Learning Hub</Text>
          <Text style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>Explore courses to level up your skills</Text>
        </View>

        {/* Search */}
        <View style={{ marginHorizontal: 16, flexDirection: "row", alignItems: "center", backgroundColor: "#27272a", borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, gap: 8 }}>
          <Ionicons name="search-outline" size={16} color="#71717a" />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, color: "#fafafa", fontSize: 13 }}
            placeholder="Search courses..."
            placeholderTextColor="#71717a"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginRight: 8, backgroundColor: activeCategory === cat ? "#3b82f6" : "#27272a" }}
            >
              <Text style={{ color: activeCategory === cat ? "#fff" : "#a1a1aa", fontSize: 12, fontWeight: "600" }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Courses */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Ionicons name="school-outline" size={48} color="#71717a" />
              <Text style={{ color: "#71717a", fontSize: 13, marginTop: 12 }}>No courses found</Text>
            </View>
          ) : (
            filtered.map((course, idx) => {
              const bgColor = COURSE_COLORS[idx % COURSE_COLORS.length];
              const pct = progress[course.id] || 0;
              const lessonCount = course.training_lessons?.[0]?.count || 0;
              return (
                <View key={course.id} style={{ backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
                  {/* Cover */}
                  <View style={{ backgroundColor: bgColor, height: 120, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="book-outline" size={40} color="rgba(255,255,255,0.9)" />
                  </View>
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <Text style={{ color: "#fafafa", fontWeight: "700", fontSize: 15, flex: 1 }}>{course.title}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#71717a" />
                    </View>
                    {course.description && (
                      <Text style={{ color: "#71717a", fontSize: 12, marginTop: 4 }} numberOfLines={2}>{course.description}</Text>
                    )}
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      {course.level && (
                        <View style={{ borderWidth: 1, borderColor: "#27272a", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                          <Text style={{ color: "#a1a1aa", fontSize: 11 }}>{course.level}</Text>
                        </View>
                      )}
                      {course.category && (
                        <View style={{ borderWidth: 1, borderColor: "#27272a", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                          <Text style={{ color: "#a1a1aa", fontSize: 11 }}>{course.category}</Text>
                        </View>
                      )}
                      <Text style={{ color: "#71717a", fontSize: 11, marginLeft: "auto" }}>{lessonCount} lessons</Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ color: "#71717a", fontSize: 11 }}>Progress</Text>
                        <Text style={{ color: "#71717a", fontSize: 11 }}>{pct}%</Text>
                      </View>
                      <View style={{ height: 4, backgroundColor: "#27272a", borderRadius: 2 }}>
                        <View style={{ height: 4, width: `${pct}%`, backgroundColor: bgColor, borderRadius: 2 }} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
