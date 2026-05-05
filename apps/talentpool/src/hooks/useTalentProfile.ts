import { useState, useEffect } from 'react';
import { supabase, useAuth } from '@digihire/shared';
import type { TalentProfile } from '../types';

export function useTalentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (mounted) {
          setProfile(err ? null : data);
          setError(err?.message ?? null);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [user?.id]);

  const updateProfile = async (updates: Partial<TalentProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error: err } = await supabase
      .from('talent_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle();
    if (!err && data) setProfile(data);
    return { error: err };
  };

  return { profile, loading, error, setProfile, updateProfile };
}
