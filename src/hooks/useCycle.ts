import { useState, useEffect } from 'react';
import { supabase, Cycle, Habit } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useCycle() {
  const { user } = useAuth();
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveCycle();
    } else {
      setActiveCycle(null);
      setHabits([]);
      setLoading(false);
    }
  }, [user]);

  const fetchActiveCycle = async () => {
    try {
      const { data: cycle, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setActiveCycle(cycle || null);

      if (cycle) {
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('cycle_id', cycle.id)
          .order('order_index');

        if (habitsError) throw habitsError;
        setHabits(habitsData || []);
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.error('Error fetching active cycle:', error);
      toast({
        title: "Failed to load cycle",
        description: "There was an error loading your active cycle.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCycle = async (name: string, habitTitles: string[]) => {
    if (!user) return null;

    if (habitTitles.length < 2 || habitTitles.length > 5) {
      toast({
        title: "Invalid habits",
        description: "You must have between 2-5 habits for your challenge.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 39 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // Create cycle
      const { data: cycle, error: cycleError } = await supabase
        .from('cycles')
        .insert({
          name: name || null,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (cycleError) throw cycleError;

      // Create habits
      const habitsData = habitTitles.map((title, index) => ({
        cycle_id: cycle.id,
        title,
        order_index: index,
      }));

      const { data: newHabits, error: habitsError } = await supabase
        .from('habits')
        .insert(habitsData)
        .select();

      if (habitsError) throw habitsError;

      setActiveCycle(cycle);
      setHabits(newHabits || []);

      toast({
        title: "Challenge started!",
        description: "Your 40-day journey begins now. Let's transform together!",
      });

      return cycle;
    } catch (error) {
      console.error('Error creating cycle:', error);
      toast({
        title: "Failed to start challenge",
        description: "There was an error starting your challenge.",
        variant: "destructive",
      });
      return null;
    }
  };

  const completeCycle = async () => {
    if (!activeCycle) return;

    try {
      const { error } = await supabase
        .from('cycles')
        .update({ status: 'completed' })
        .eq('id', activeCycle.id);

      if (error) throw error;

      // Award completion badge
      const { error: badgeError } = await supabase
        .from('user_badges')
        .insert({
          user_id: user!.id,
          cycle_id: activeCycle.id,
          badge_id: (await supabase
            .from('badges')
            .select('id')
            .eq('code', 'challenge_complete')
            .single()).data?.id,
        });

      if (badgeError) console.error('Error awarding badge:', badgeError);

      setActiveCycle({ ...activeCycle, status: 'completed' });

      toast({
        title: "🎉 Challenge completed!",
        description: "Congratulations! You've completed your 40-day transformation journey!",
      });
    } catch (error) {
      console.error('Error completing cycle:', error);
      toast({
        title: "Failed to complete challenge",
        description: "There was an error completing your challenge.",
        variant: "destructive",
      });
    }
  };

  const getCurrentDay = () => {
    if (!activeCycle) return 0;
    
    const start = new Date(activeCycle.start_date);
    const today = new Date();
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(1, Math.min(40, diffDays));
  };

  return {
    activeCycle,
    habits,
    loading,
    createCycle,
    completeCycle,
    getCurrentDay,
    refreshCycle: fetchActiveCycle,
  };
}