import { useState, useEffect } from 'react';
import { supabase } from '@digihire/shared';
import type { TalentCourse } from '../types';

export function useTalentCourses() {
  const [courses, setCourses] = useState<TalentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('talent_courses')
      .select('*')
      .eq('is_published', true)
      .then(({ data }) => {
        if (mounted) { setCourses(data ?? []); setLoading(false); }
      });
    return () => { mounted = false; };
  }, []);

  return { courses, loading };
}

export function useTalentCourse(id: string) {
  const [course, setCourse] = useState<TalentCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    supabase
      .from('talent_courses')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (mounted) { setCourse(data); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [id]);

  return { course, loading };
}
