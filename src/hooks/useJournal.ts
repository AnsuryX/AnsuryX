import { useState, useEffect } from 'react';
import { supabase, JournalEntry, Prompt } from '@/lib/supabase';
import { useCycle } from './useCycle';
import { toast } from '@/hooks/use-toast';

interface JournalEntryData {
  content: string;
  mood?: number;
  tags?: string[];
  prompt_id?: string;
}

export function useJournal() {
  const { activeCycle } = useCycle();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeCycle) {
      fetchEntries();
    }
    fetchPrompts();
  }, [activeCycle]);

  const fetchEntries = async () => {
    if (!activeCycle) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('cycle_id', activeCycle.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('pack', 'general')
        .order('type');

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const getJournalEntry = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.find(entry => entry.date === dateStr);
  };

  const getPromptForDate = (date: Date) => {
    const hour = date.getHours();
    const isMorning = hour < 12;
    const promptType = isMorning ? 'morning' : 'evening';
    
    // Get a deterministic prompt based on date
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const typePrompts = prompts.filter(p => p.type === promptType);
    
    if (typePrompts.length === 0) {
      return prompts.find(p => p.type === 'general') || prompts[0];
    }
    
    return typePrompts[dayOfYear % typePrompts.length];
  };

  const saveJournalEntry = async (date: Date, entryData: JournalEntryData) => {
    if (!activeCycle) return;

    try {
      setSaving(true);
      const dateStr = date.toISOString().split('T')[0];
      const existing = getJournalEntry(date);

      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            content: entryData.content,
            mood: entryData.mood,
            tags: entryData.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;

        setEntries(entries.map(entry => 
          entry.id === existing.id 
            ? { ...entry, ...entryData, updated_at: new Date().toISOString() }
            : entry
        ));
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            cycle_id: activeCycle.id,
            date: dateStr,
            prompt_id: entryData.prompt_id,
            content: entryData.content,
            mood: entryData.mood,
            tags: entryData.tags
          })
          .select()
          .single();

        if (error) throw error;

        setEntries([data, ...entries]);
      }

      toast({
        title: "Entry saved! ✨",
        description: "Your thoughts have been recorded.",
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Failed to save entry",
        description: "There was an error saving your journal entry.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteJournalEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== entryId));
      
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Failed to delete entry",
        description: "There was an error deleting your journal entry.",
        variant: "destructive",
      });
    }
  };

  const searchEntries = (query: string, tags?: string[]) => {
    return entries.filter(entry => {
      const matchesContent = entry.content.toLowerCase().includes(query.toLowerCase());
      const matchesTags = !tags || tags.length === 0 || 
        (entry.tags && tags.some(tag => entry.tags!.includes(tag)));
      
      return matchesContent && matchesTags;
    });
  };

  return {
    entries,
    prompts,
    loading,
    saving,
    getJournalEntry,
    getPromptForDate,
    saveJournalEntry,
    deleteJournalEntry,
    searchEntries,
    refreshEntries: fetchEntries
  };
}