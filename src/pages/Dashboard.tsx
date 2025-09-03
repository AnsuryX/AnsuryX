import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Zap, BookOpen, Target, Calendar } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const [missions, setMissions] = useState([
    { id: 1, title: "Morning meditation", completed: false },
    { id: 2, title: "Read 20 pages", completed: true },
    { id: 3, title: "Exercise for 30 minutes", completed: false },
    { id: 4, title: "Write in journal", completed: false },
  ]);

  // Mock data - will be replaced with Supabase data
  const currentDay = 15;
  const totalDays = 40;
  const currentStreak = 12;
  const xpCurrent = 850;
  const xpNext = 1000;
  const level = 3;
  const completionRate = 85;

  const toggleMission = (id: number) => {
    setMissions(missions.map(mission => 
      mission.id === id 
        ? { ...mission, completed: !mission.completed }
        : mission
    ));
  };

  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gradient-primary">
              Ansury X
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">40 Days. Total Focus. Transform Your Life.</p>
        </header>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Day Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-4xl font-bold text-primary">
                  {currentDay}
                </div>
                <div className="text-muted-foreground">of {totalDays} days</div>
                <Progress value={(currentDay / totalDays) * 100} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-4xl font-bold text-orange-500">
                  {currentStreak}
                </div>
                <div className="text-muted-foreground">days in a row</div>
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                  On Fire! 🔥
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Level {level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-primary">
                  {xpCurrent} XP
                </div>
                <div className="text-muted-foreground text-sm">
                  {xpNext - xpCurrent} XP to level {level + 1}
                </div>
                <Progress value={(xpCurrent / xpNext) * 100} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Missions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Today's Missions
              </span>
              <Badge variant="outline">
                {completedMissions}/{totalMissions}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 ${
                  mission.completed
                    ? 'border-success bg-success/5 glow-success'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant={mission.completed ? "default" : "outline"}
                    onClick={() => toggleMission(mission.id)}
                    className={mission.completed ? "bg-success hover:bg-success/90" : ""}
                  >
                    {mission.completed ? "✓" : "○"}
                  </Button>
                  <span className={`text-lg ${mission.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {mission.title}
                  </span>
                </div>
                {mission.completed && (
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    +10 XP
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-blue" />
                Quick Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Reflect on your day and track your progress.
              </p>
              <Button className="w-full btn-hero">
                Open Today's Entry
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent-purple" />
                Battle Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View your analytics and achievement progress.
              </p>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mini Analytics */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Week Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                <div className="text-muted-foreground text-sm">7-day completion</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">Exercise</div>
                <div className="text-muted-foreground text-sm">Best habit</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-pink">4.2</div>
                <div className="text-muted-foreground text-sm">Avg mood score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;