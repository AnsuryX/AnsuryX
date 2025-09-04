import { useState } from 'react';
import { Trophy, Medal, Star, Calendar, Target, Flame, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTrophyRoom } from '@/hooks/useTrophyRoom';
import { format } from 'date-fns';

export default function TrophyRoom() {
  const { archivedCycles, badges, userBadges, loading } = useTrophyRoom();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'week_warrior': return <Medal className="h-5 w-5" />;
      case 'halfway_hero': return <Target className="h-5 w-5" />;
      case 'marathon_mindset': return <Flame className="h-5 w-5" />;
      case 'challenge_complete': return <Trophy className="h-5 w-5" />;
      case 'perfect_week': return <Star className="h-5 w-5" />;
      case 'streak_master': return <Award className="h-5 w-5" />;
      default: return <Medal className="h-5 w-5" />;
    }
  };

  const getBadgeColor = (code: string) => {
    switch (code) {
      case 'week_warrior': return 'bg-blue-500';
      case 'halfway_hero': return 'bg-green-500';
      case 'marathon_mindset': return 'bg-purple-500';
      case 'challenge_complete': return 'bg-gold-500';
      case 'perfect_week': return 'bg-yellow-500';
      case 'streak_master': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            Trophy Room
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your collection of achievements and completed cycles
          </p>
        </div>

        <Tabs defaultValue="cycles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cycles">Completed Cycles</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="cycles" className="space-y-4">
            {archivedCycles.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">No Completed Cycles Yet</CardTitle>
                  <CardDescription className="text-center">
                    Complete your first 40-day cycle to see it here!
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedCycles.map((cycle) => {
                  const cycleStats = cycle.stats;
                  const completionRate = cycleStats?.completionRate || 0;
                  
                  return (
                    <Card key={cycle.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {cycle.name || `Cycle ${format(new Date(cycle.start_date), 'MMM yyyy')}`}
                            </CardTitle>
                            <CardDescription>
                              {format(new Date(cycle.start_date), 'MMM d')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Completion Rate */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Completion Rate</span>
                          <Badge variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "outline"}>
                            {completionRate}%
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            <span>Best Streak: {cycleStats?.longestStreak || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>Habits: {cycleStats?.totalHabits || 0}</span>
                          </div>
                        </div>

                        {/* Badges for this cycle */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Badges Earned</span>
                          <div className="flex flex-wrap gap-1">
                            {userBadges
                              .filter(ub => ub.cycle_id === cycle.id)
                              .map((userBadge) => {
                                const badge = badges.find(b => b.id === userBadge.badge_id);
                                if (!badge) return null;
                                
                                return (
                                  <div
                                    key={userBadge.id}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${getBadgeColor(badge.code)}`}
                                  >
                                    {getBadgeIcon(badge.code)}
                                    {badge.name}
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedCycle(cycle.id)}
                        >
                          View Report
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => {
                const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
                const earned = !!userBadge;
                
                return (
                  <Card key={badge.id} className={`${earned ? 'ring-2 ring-primary' : 'opacity-60'} transition-all`}>
                    <CardHeader className="text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${earned ? getBadgeColor(badge.code) : 'bg-muted'} text-white`}>
                        {getBadgeIcon(badge.code)}
                      </div>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {badge.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      {earned ? (
                        <div className="space-y-1">
                          <Badge variant="default">Earned!</Badge>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(userBadge.awarded_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline">Not Earned</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievement Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Achievement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{archivedCycles.length}</div>
                <div className="text-sm text-muted-foreground">Completed Cycles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{userBadges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {archivedCycles.length * 40}
                </div>
                <div className="text-sm text-muted-foreground">Days Committed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted">
                  {Math.round(archivedCycles.reduce((acc, cycle) => acc + (cycle.stats?.completionRate || 0), 0) / Math.max(archivedCycles.length, 1))}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}