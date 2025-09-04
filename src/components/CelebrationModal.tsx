import { useEffect, useState } from 'react';
import { Trophy, Star, Award, Download, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCycle } from '@/hooks/useCycle';
import { useTrophyRoom } from '@/hooks/useTrophyRoom';
import confetti from 'canvas-confetti';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewCycle: () => void;
  onViewTrophyRoom: () => void;
}

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  onStartNewCycle, 
  onViewTrophyRoom 
}: CelebrationModalProps) {
  const { activeCycle } = useCycle();
  const { getLifetimeStats } = useTrophyRoom();
  const [showConfetti, setShowConfetti] = useState(false);

  const lifetimeStats = getLifetimeStats();

  useEffect(() => {
    if (isOpen && !showConfetti) {
      setShowConfetti(true);
      
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          }
        });
        
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, showConfetti]);

  if (!activeCycle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold">
              🎉 Challenge Complete! 🎉
            </DialogTitle>
            <p className="text-muted-foreground text-lg">
              You've successfully completed your 40-day journey!
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Achievement Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">40</div>
                  <div className="text-sm text-muted-foreground">Days Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {/* Mock completion rate */}
                    85%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {/* Mock streak */}
                    12
                  </div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {/* Mock XP */}
                    2,450
                  </div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Badges */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Star className="h-5 w-5" />
              New Badges Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <Trophy className="h-4 w-4 mr-1" />
                Challenge Complete
              </Badge>
              <Badge className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <Award className="h-4 w-4 mr-1" />
                40-Day Warrior
              </Badge>
            </div>
          </div>

          {/* Inspirational Message */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">You Did It! 🌟</h3>
                <p className="text-muted-foreground">
                  "The journey of a thousand miles begins with one step. You've taken 40 steps towards 
                  a better you. Every habit formed, every challenge overcome, has shaped you into 
                  someone stronger."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lifetime Achievement */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold">{lifetimeStats.totalCycles + 1}</div>
              <div className="text-muted-foreground">Total Cycles</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{lifetimeStats.totalBadges + 2}</div>
              <div className="text-muted-foreground">Total Badges</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onViewTrophyRoom} variant="outline" className="flex-1">
              <Trophy className="h-4 w-4 mr-2" />
              View Trophy Room
            </Button>
            <Button onClick={onStartNewCycle} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Cycle
            </Button>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}