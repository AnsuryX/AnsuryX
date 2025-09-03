import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, X } from "lucide-react";
import { useState } from "react";
import { useCycle } from "@/hooks/useCycle";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const CreateCycle = () => {
  const [cycleName, setCycleName] = useState("");
  const [habits, setHabits] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const { createCycle } = useCycle();
  const navigate = useNavigate();

  const addHabit = () => {
    if (habits.length < 5) {
      setHabits([...habits, ""]);
    }
  };

  const removeHabit = (index: number) => {
    if (habits.length > 2) {
      setHabits(habits.filter((_, i) => i !== index));
    }
  };

  const updateHabit = (index: number, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = value;
    setHabits(newHabits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filledHabits = habits.filter(h => h.trim());
    
    if (filledHabits.length < 2) {
      toast({
        title: "Not enough missions",
        description: "You need at least 2 missions for your 40-day challenge.",
        variant: "destructive",
      });
      return;
    }

    if (filledHabits.length > 5) {
      toast({
        title: "Too many missions",
        description: "Maximum 5 missions allowed for focused progress.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const cycle = await createCycle(cycleName.trim() || "My Challenge", filledHabits);
    
    if (cycle) {
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Target className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-gradient-primary">Start Your Journey</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Define your 40-day transformation challenge
          </p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Challenge Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Challenge Name */}
              <div className="space-y-2">
                <Label htmlFor="cycleName">Challenge Name (Optional)</Label>
                <Input
                  id="cycleName"
                  placeholder="e.g., Winter Transformation, Health Reset..."
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="bg-surface border-border"
                />
              </div>

              {/* Habits/Missions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Daily Missions (2-5 required)</Label>
                  <span className="text-sm text-muted-foreground">
                    {habits.filter(h => h.trim()).length}/5
                  </span>
                </div>
                
                <div className="space-y-3">
                  {habits.map((habit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={`Mission ${index + 1} (e.g., Exercise for 30 minutes)`}
                          value={habit}
                          onChange={(e) => updateHabit(index, e.target.value)}
                          className="bg-surface border-border"
                        />
                      </div>
                      {habits.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeHabit(index)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {habits.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addHabit}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Mission
                  </Button>
                )}
              </div>

              {/* Info Box */}
              <Card className="card-glass">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-primary">📋 Challenge Rules</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Exactly 40 consecutive days</li>
                      <li>• 2-5 daily missions for focused progress</li>
                      <li>• Complete all missions each day to maintain your streak</li>
                      <li>• Earn XP and badges for milestones</li>
                      <li>• Daily reflection in your private journal</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-hero"
                  disabled={isLoading || habits.filter(h => h.trim()).length < 2}
                >
                  {isLoading ? "Starting Challenge..." : "Begin 40-Day Journey"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Motivation */}
        <Card className="card-glass text-center">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">🎯 Your Transformation Awaits</h3>
              <p className="text-sm text-muted-foreground">
                In 40 days, you'll look back amazed at how far you've come. 
                Every small action compounds into extraordinary results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCycle;