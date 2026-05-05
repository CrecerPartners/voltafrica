import { useState, useEffect } from 'react';
import { supabase, useAuth } from '@digihire/shared';
import type { TalentEnrollment } from '../types';

export function useTalentEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<TalentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from('talent_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (mounted) { setEnrollments(data ?? []); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [user]);

  const enroll = async (courseId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('talent_enrollments')
      .insert({ user_id: user.id, course_id: courseId, progress: 0, completed_modules: [] })
      .select()
      .single();
    if (!error && data) setEnrollments(prev => [...prev, data]);
    return { error };
  };

  return { enrollments, loading, enroll };
}
