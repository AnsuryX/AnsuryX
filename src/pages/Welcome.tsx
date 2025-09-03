import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, Trophy, Calendar, Flame, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target className="w-12 h-12 text-primary" />
              <h1 className="text-5xl lg:text-7xl font-bold text-gradient-primary">
                Ansury X
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              40 Days. Total Focus. Transform Your Life.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A privacy-first personal challenge system designed to build discipline, 
              track progress, and celebrate your transformation over exactly 40 days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="btn-hero px-8 py-4 text-lg">
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Learn More
              </Button>
            </div>

            <div className="flex justify-center gap-6 mt-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                🔒 Private & Secure
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                📱 Works Offline
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                🏆 Gamified Progress
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why 40 Days Changes Everything
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Science shows it takes about 40 days to form lasting habits. 
              Ansury X makes every day count with structured tracking and motivation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Custom Missions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose 2-5 personal habits and track them daily. 
                  From fitness to reading, make it yours.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-success" />
                </div>
                <CardTitle>Streak Power</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build momentum with streak tracking and bonus XP. 
                  Every day completed makes you stronger.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-accent-purple" />
                </div>
                <CardTitle>Guided Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Daily journal prompts help you process growth and 
                  track your mental journey.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>XP & Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn experience points and unlock achievements. 
                  Gamification keeps you motivated.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-accent-blue" />
                </div>
                <CardTitle>Battle Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics show your progress patterns 
                  and help optimize your approach.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-success" />
                </div>
                <CardTitle>Repeatable Cycles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete challenges, archive achievements, 
                  and start fresh with new goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent-purple/10 to-success/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform in 40 Days?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who have completed their transformation journey. 
              Your future self is waiting.
            </p>
            <Button size="lg" className="btn-hero px-12 py-4 text-lg">
              Start Challenge Now
            </Button>
            <p className="text-sm text-muted-foreground">
              No social features. No sharing required. Just you and your growth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;