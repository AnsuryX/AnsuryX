import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCycle } from './useCycle';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';

interface CompletionStats {
  overallRate: number;
  completedDays: number;
  totalDays: number;
  weeklyRate: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalStreaks: number;
}

interface HabitConsistency {
  title: string;
  rate: number;
  completions: number;
  total: number;
}

interface MoodTrends {
  average: number;
  data: Array<{ date: string; mood: number; completion: number }>;
}

interface WeeklyProgress {
  date: string;
  completion: number;
}

export function useAnalytics() {
  const { activeCycle, habits } = useCycle();
  const [loading, setLoading] = useState(false);

  const getCompletionStats = (): CompletionStats => {
    if (!activeCycle) {
      return { overallRate: 0, completedDays: 0, totalDays: 0, weeklyRate: 0 };
    }

    const startDate = new Date(activeCycle.start_date);
    const today = new Date();
    const daysPassed = Math.min(
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      40
    );

    // Mock data for now - in real implementation, calculate from completions
    const completedDays = Math.floor(daysPassed * 0.75); // 75% completion rate
    const overallRate = Math.round((completedDays / Math.max(daysPassed, 1)) * 100);
    
    // Last 7 days completion
    const weeklyCompletedDays = Math.floor(Math.min(daysPassed, 7) * 0.8);
    const weeklyRate = Math.round((weeklyCompletedDays / Math.min(daysPassed, 7)) * 100);

    return {
      overallRate,
      completedDays,
      totalDays: daysPassed,
      weeklyRate
    };
  };

  const getStreakData = (): StreakData => {
    // Mock streak data - in real implementation, calculate from habit_completions
    return {
      currentStreak: 5,
      longestStreak: 12,
      totalStreaks: 3
    };
  };

  const getHabitConsistency = (): HabitConsistency[] => {
    if (!habits.length) return [];

    // Mock consistency data - in real implementation, calculate from habit_completions
    return habits.map((habit, index) => ({
      title: habit.title,
      rate: Math.floor(Math.random() * 40) + 60, // Random between 60-100%
      completions: Math.floor(Math.random() * 20) + 15,
      total: 25
    })).sort((a, b) => b.rate - a.rate);
  };

  const getMoodTrends = (): MoodTrends => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    const data = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      mood: Math.random() * 2 + 3, // Random between 3-5
      completion: Math.random() * 40 + 60 // Random between 60-100%
    }));

    const average = data.reduce((sum, item) => sum + item.mood, 0) / data.length;

    return { average, data };
  };

  const getWeeklyProgress = (): WeeklyProgress[] => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    return days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      completion: Math.random() * 40 + 60 // Random between 60-100%
    }));
  };

  const getXPProgress = async () => {
    if (!activeCycle) return { total: 0, level: 1, nextLevel: 100 };

    try {
      const { data, error } = await supabase
        .from('xp_events')
        .select('amount')
        .eq('cycle_id', activeCycle.id);

      if (error) throw error;

      const totalXP = data?.reduce((sum, event) => sum + event.amount, 0) || 0;
      const level = Math.floor(totalXP / 100) + 1;
      const nextLevel = level * 100;

      return { total: totalXP, level, nextLevel };
    } catch (error) {
      console.error('Error fetching XP progress:', error);
      return { total: 0, level: 1, nextLevel: 100 };
    }
  };

  return {
    loading,
    getCompletionStats,
    getStreakData,
    getHabitConsistency,
    getMoodTrends,
    getWeeklyProgress,
    getXPProgress
  };
}