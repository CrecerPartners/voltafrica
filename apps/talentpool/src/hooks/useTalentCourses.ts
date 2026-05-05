import { useState, useEffect } from 'react';
import { supabase } from '@digihire/shared';
import type { TalentCourse } from '../types';

export function useTalentCourses() {
  const [courses, setCourses] = useState<TalentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('talent_courses')
      .select('*')
      .eq('is_published', true)
      .then(({ data, error: err }) => {
        if (mounted) {
          setCourses(err ? [] : (data ?? []));
          setError(err?.message ?? null);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  return { courses, loading, error };
}

export function useTalentCourse(id: string | undefined) {
  const [course, setCourse] = useState<TalentCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    supabase
      .from('talent_courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (mounted) {
          setCourse(err ? null : data);
          setError(err?.message ?? null);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [id]);

  return { course, loading, error };
}
