import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@digihire/shared";
import { Input } from "@digihire/shared";
import { Badge } from "@digihire/shared";
import { Progress } from "@digihire/shared";
import { Search, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { useCourses, useAllProgress } from "@/hooks/useTraining";
import { Loader2 } from "lucide-react";
import { supabase } from "@digihire/shared";
import { useQuery } from "@tanstack/react-query";

const Training = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();
  const { data: allProgress } = useAllProgress();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get lesson counts per course
  const { data: lessonCounts } = useQuery({
    queryKey: ["training-lesson-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_lessons" as any)
        .select("course_id, id");
      if (error) throw error;
      const counts: Record<string, { total: number; lessonIds: string[] }> = {};
      (data as any[]).forEach((l: any) => {
        if (!counts[l.course_id]) counts[l.course_id] = { total: 0, lessonIds: [] };
        counts[l.course_id].total++;
        counts[l.course_id].lessonIds.push(l.id);
      });
      return counts;
    },
  });

  const categories = useMemo(() => {
    if (!courses) return ["All"];
    const cats = [...new Set(courses.map((c) => c.category))];
    return ["All", ...cats];
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "All" || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [courses, search, selectedCategory]);

  const getProgress = (courseId: string) => {
    if (!lessonCounts?.[courseId] || !allProgress) return 0;
    const { lessonIds, total } = lessonCounts[courseId];
    const completed = allProgress.filter(
      (p) => p.completed && lessonIds.includes(p.lesson_id)
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          Learning Hub
        </h1>
        <p className="text-muted-foreground mt-1">Explore courses to level up your skills</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((course) => {
          const progress = getProgress(course.id);
          const total = lessonCounts?.[course.id]?.total || 0;
          return (
            <Card
              key={course.id}
              className="border-border/50 cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate(`/training/${course.id}`)}
            >
              <CardContent className="p-0">
                <div
                  className="h-24 rounded-t-xl flex items-center justify-center"
                  style={{ backgroundColor: course.cover_color }}
                >
                  <BookOpen className="h-10 w-10 text-white/90" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold font-display">{course.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {course.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {total} lessons
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No courses found</p>
        </div>
      )}
    </div>
  );
};

export default Training;

