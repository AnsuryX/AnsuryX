import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Smile, Tag, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCycle } from '@/hooks/useCycle';
import { useJournal } from '@/hooks/useJournal';
import { format, addDays, subDays } from 'date-fns';

export default function Journal() {
  const { activeCycle } = useCycle();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const { 
    getJournalEntry, 
    saveJournalEntry, 
    getPromptForDate, 
    loading, 
    saving 
  } = useJournal();

  const entry = getJournalEntry(selectedDate);
  const prompt = getPromptForDate(selectedDate);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
      setMood(entry.mood || 3);
      setTags(entry.tags || []);
    } else {
      setContent('');
      setMood(3);
      setTags([]);
    }
  }, [entry, selectedDate]);

  const handleSave = async () => {
    if (!activeCycle) return;
    
    await saveJournalEntry(selectedDate, {
      content,
      mood,
      tags,
      prompt_id: prompt?.id
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const goToPrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isFuture = selectedDate > new Date();

  if (!activeCycle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mission Logbook
            </CardTitle>
            <CardDescription>
              Start a cycle to begin journaling your 40-day journey.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Date Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>Mission Logbook</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center min-w-[140px]">
                  <div className="font-semibold">
                    {isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Day {Math.max(1, Math.ceil((selectedDate.getTime() - new Date(activeCycle.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)} of 40
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextDay}
                  disabled={isFuture}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Journal Prompt */}
        {prompt && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Reflection</CardTitle>
              <CardDescription className="text-base">
                {prompt.text}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Journal Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                <label className="text-sm font-medium">
                  How are you feeling? ({mood}/5)
                </label>
              </div>
              <Slider
                value={[mood]}
                onValueChange={(value) => setMood(value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Struggling</span>
                <span>Neutral</span>
                <span>Thriving</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your thoughts</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, insights, and reflections..."
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <label className="text-sm font-medium">Tags</label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving || !content.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}