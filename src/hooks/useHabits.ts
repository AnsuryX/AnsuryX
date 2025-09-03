import { useState, useEffect } from 'react';
import { supabase, HabitCompletion } from '@/lib/supabase';
import { useCycle } from './useCycle';
import { toast } from '@/hooks/use-toast';

export function useHabits() {
  const { activeCycle, habits } = useCycle();
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeCycle) {
      fetchTodayCompletions();
    }
  }, [activeCycle]);

  const fetchTodayCompletions = async () => {
    if (!activeCycle) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('cycle_id', activeCycle.id)
        .eq('date', today);

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!activeCycle) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = completions.find(c => c.habit_id === habitId);

      if (existing) {
        // Toggle existing completion
        const { error } = await supabase
          .from('habit_completions')
          .update({ completed: !existing.completed })
          .eq('id', existing.id);

        if (error) throw error;

        setCompletions(completions.map(c => 
          c.id === existing.id 
            ? { ...c, completed: !c.completed }
            : c
        ));

        // Award XP for completion
        if (!existing.completed) {
          await awardXP('completion', 10);
        }
      } else {
        // Create new completion
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            cycle_id: activeCycle.id,
            habit_id: habitId,
            date: today,
            completed: true,
          })
          .select()
          .single();

        if (error) throw error;

        setCompletions([...completions, data]);
        await awardXP('completion', 10);
      }

      // Check for streak bonuses and badges
      await checkStreakBonuses();
      
      toast({
        title: "Mission updated! 🎯",
        description: "Great progress on your journey!",
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Failed to update mission",
        description: "There was an error updating your mission.",
        variant: "destructive",
      });
    }
  };

  const awardXP = async (source: string, amount: number) => {
    if (!activeCycle) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('xp_events')
        .insert({
          cycle_id: activeCycle.id,
          date: today,
          source,
          amount,
        });
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const checkStreakBonuses = async () => {
    // This would implement streak checking logic
    // For now, we'll keep it simple
  };

  const getHabitCompletion = (habitId: string) => {
    return completions.find(c => c.habit_id === habitId)?.completed || false;
  };

  const getTodayCompletionRate = () => {
    if (habits.length === 0) return 0;
    const completedCount = habits.filter(h => getHabitCompletion(h.id)).length;
    return Math.round((completedCount / habits.length) * 100);
  };

  const getCompletedHabitsCount = () => {
    return habits.filter(h => getHabitCompletion(h.id)).length;
  };

  return {
    completions,
    loading,
    toggleHabitCompletion,
    getHabitCompletion,
    getTodayCompletionRate,
    getCompletedHabitsCount,
    refreshCompletions: fetchTodayCompletions,
  };
}
