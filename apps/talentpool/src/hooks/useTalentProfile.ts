import { useState, useEffect } from 'react';
import { supabase, useAuth } from '@digihire/shared';
import type { TalentProfile } from '../types';

export function useTalentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (mounted) { setProfile(data); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [user]);

  const updateProfile = async (updates: Partial<TalentProfile>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('talent_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { error };
  };

  return { profile, loading, setProfile, updateProfile };
}
