import { useState, useEffect } from 'react';
import { supabase, Cycle, Badge, UserBadge } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface CycleWithStats extends Cycle {
  stats?: {
    completionRate: number;
    longestStreak: number;
    totalHabits: number;
    averageMood: number;
  };
}

export function useTrophyRoom() {
  const { user } = useAuth();
  const [archivedCycles, setArchivedCycles] = useState<CycleWithStats[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchArchivedCycles();
      fetchBadges();
      fetchUserBadges();
    }
  }, [user]);

  const fetchArchivedCycles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('end_date', { ascending: false });

      if (error) throw error;

      // Enhance cycles with stats (mock data for now)
      const cyclesWithStats: CycleWithStats[] = (data || []).map(cycle => ({
        ...cycle,
        stats: {
          completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
          longestStreak: Math.floor(Math.random() * 20) + 5, // 5-25 days
          totalHabits: Math.floor(Math.random() * 4) + 2, // 2-6 habits
          averageMood: Math.random() * 2 + 3 // 3-5
        }
      }));

      setArchivedCycles(cyclesWithStats);
    } catch (error) {
      console.error('Error fetching archived cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('code');

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchUserBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      setUserBadges(data || []);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  };

  const getCycleReport = async (cycleId: string) => {
    try {
      // Fetch detailed cycle data including habits, completions, journal entries
      const [cycleData, habitsData, completionsData, journalData] = await Promise.all([
        supabase.from('cycles').select('*').eq('id', cycleId).single(),
        supabase.from('habits').select('*').eq('cycle_id', cycleId),
        supabase.from('habit_completions').select('*').eq('cycle_id', cycleId),
        supabase.from('journal_entries').select('*').eq('cycle_id', cycleId)
      ]);

      return {
        cycle: cycleData.data,
        habits: habitsData.data || [],
        completions: completionsData.data || [],
        journalEntries: journalData.data || []
      };
    } catch (error) {
      console.error('Error fetching cycle report:', error);
      return null;
    }
  };

  const getLifetimeStats = () => {
    const totalDays = archivedCycles.length * 40;
    const avgCompletion = archivedCycles.reduce((sum, cycle) => 
      sum + (cycle.stats?.completionRate || 0), 0) / Math.max(archivedCycles.length, 1);
    
    return {
      totalCycles: archivedCycles.length,
      totalDays,
      totalBadges: userBadges.length,
      avgCompletion: Math.round(avgCompletion),
      bestStreak: Math.max(...archivedCycles.map(c => c.stats?.longestStreak || 0), 0)
    };
  };

  return {
    archivedCycles,
    badges,
    userBadges,
    loading,
    getCycleReport,
    getLifetimeStats,
    refreshData: () => {
      fetchArchivedCycles();
      fetchUserBadges();
    }
  };
}