import { useState, useEffect } from 'react';
import { supabase, Settings } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      setSettings(data || {
        user_id: user.id,
        theme: 'system',
        prompt_pack: 'general',
        notifications: {
          morning_prompts: true,
          evening_prompts: true,
          daily_reminders: true
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!user) return;

    try {
      const newSettings = { ...settings, ...updates, user_id: user.id };

      const { error } = await supabase
        .from('settings')
        .upsert(newSettings);

      if (error) throw error;

      setSettings(newSettings as Settings);
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Update failed",
        description: "There was an error saving your settings.",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [cyclesData, journalData, completionsData] = await Promise.all([
        supabase.from('cycles').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('cycle_id', user.id), // This would need proper join
        supabase.from('habit_completions').select('*').eq('cycle_id', user.id) // This would need proper join
      ]);

      const exportData = {
        user: {
          email: user.email,
          display_name: user.user_metadata?.display_name
        },
        cycles: cyclesData.data || [],
        journalEntries: journalData.data || [],
        completions: completionsData.data || [],
        exportedAt: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ansury-x-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    exportData
  };
}