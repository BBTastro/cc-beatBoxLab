"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChallengeProvider, useChallengeContext } from "@/contexts/ChallengeContext";
import { useSession } from "@/lib/auth-client";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { BarChart3, TrendingUp, Calendar, Target, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";


// Animated radial progress component
function RadialProgress({ percentage, size = 120, strokeWidth = 8, color = "hsl(var(--primary))" }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            strokeDasharray,
            strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">{percentage}%</span>
      </div>
    </div>
  );
}

// Animated bar chart component
function AnimatedBarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-1000 ease-out",
                item.color || "bg-primary"
              )}
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                animationDelay: `${index * 200}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsContent() {
  const {
    currentChallenge,
    challenges,
    beats,
    beatDetails,
    rewards,
    motivationalStatements,
    isLoading,
    syncToDatabase,
  } = useChallengeContext();

  const [animatedStats, setAnimatedStats] = useState({
    completionRate: 0,
    totalEntries: 0,
    activeDays: 0,
    categories: 0,
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Calculate stats for current active challenge only
  const completionRate = currentChallenge && currentChallenge.totalBeats > 0 
    ? Math.round((currentChallenge.completedBeats / currentChallenge.totalBeats) * 100)
    : 0;
  
  // Filter data to only include current active challenge
  const currentChallengeBeats = currentChallenge ? beats.filter(beat => beat.challengeId === currentChallenge.id) : [];
  const currentChallengeBeatDetails = currentChallenge ? beatDetails.filter(detail => 
    currentChallengeBeats.some(beat => beat.id === detail.beatId)
  ) : [];
  const currentChallengeRewards = currentChallenge ? rewards.filter(reward => reward.challengeId === currentChallenge.id) : [];
  const currentChallengeStatements = currentChallenge ? motivationalStatements.filter(statement => 
    statement.challengeId === currentChallenge.id
  ) : [];
  
  const totalEntries = currentChallengeBeatDetails.length;
  const activeDays = new Set(currentChallengeBeatDetails.map(detail => {
    const beat = currentChallengeBeats.find(beat => beat.id === detail.beatId);
    return beat ? beat.date.toDateString() : null;
  }).filter(Boolean)).size;
  const categories = new Set(currentChallengeBeatDetails.map(detail => detail.category).filter(Boolean)).size;
  const totalRewards = currentChallengeRewards.length;
  const achievedRewards = currentChallengeRewards.filter(reward => reward.status === 'achieved').length;
  const totalStatements = currentChallengeStatements.length;

  // Debug logging to verify data flow
  console.log('Stats page data:', {
    currentChallengeId: currentChallenge?.id,
    totalBeats: currentChallengeBeats.length,
    totalEntries,
    totalBeatDetails: beatDetails.length,
    currentChallengeBeatDetails: currentChallengeBeatDetails.length,
    activeDays,
    categories,
    totalRewards,
    totalStatements
  });

  // Animate stats on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        completionRate,
        totalEntries,
        activeDays,
        categories,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [completionRate, totalEntries, activeDays, categories]);

  // Calculate weekly activity based on character count of beat entries for previous 7 days
  const getWeeklyActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Find beat details for this specific day
      const dayBeatDetails = currentChallengeBeatDetails.filter(detail => {
        const beat = currentChallengeBeats.find(beat => beat.id === detail.beatId);
        if (!beat) return false;
        
        const beatDate = new Date(beat.date);
        return beatDate.toDateString() === date.toDateString();
      });
      
      // Calculate total character count for this day
      const characterCount = dayBeatDetails.reduce((total, detail) => {
        return total + (detail.content?.length || 0);
      }, 0);
      
      weeklyData.push({
        label: dayName,
        value: characterCount,
        color: "bg-primary"
      });
    }
    
    return weeklyData;
  };
  
  const weeklyData = getWeeklyActivityData();
  const maxWeeklyValue = Math.max(...weeklyData.map(day => day.value), 1); // Ensure at least 1 to avoid division by zero

  // Calculate category distribution based on actual beat details
  const getCategoryDistributionData = () => {
    const categoryCounts: { [key: string]: number } = {};
    
    // Count beats per category for current active challenge
    currentChallengeBeatDetails.forEach(detail => {
      const category = detail.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Convert to chart data format with colors
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
      "bg-red-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500"
    ];
    
    return Object.entries(categoryCounts).map(([category, count], index) => ({
      label: category,
      value: count,
      color: colors[index % colors.length]
    }));
  };
  
  const categoryData = getCategoryDistributionData();
  const maxCategoryValue = Math.max(...categoryData.map(cat => cat.value), 1);

  const handleSyncToDatabase = async () => {
    try {
      setIsSyncing(true);
      await syncToDatabase();
      // Show success message or handle success
      console.log('Data synced to database successfully');
    } catch (error) {
      console.error('Error syncing to database:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Stats</h1>
            <p className="text-muted-foreground mt-2">Loading your progress statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentChallenge) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Stats</h1>
            <p className="text-muted-foreground mt-2">Create a challenge to see your statistics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Stats</h1>
          <p className="text-muted-foreground mt-2">Track your progress and insights</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">
              {currentChallenge.title}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncToDatabase}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync to Database'}
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Completion Rate */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{animatedStats.completionRate}%</div>
                <p className="text-sm text-muted-foreground">Progress rate</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Entries */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entries</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{animatedStats.totalEntries}</div>
                <p className="text-sm text-muted-foreground">Total entries</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Days */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Days</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{animatedStats.activeDays}</div>
                <p className="text-sm text-muted-foreground">Days active</p>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{animatedStats.categories}</div>
                <p className="text-sm text-muted-foreground">Categories used</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Activity (Characters)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart data={weeklyData} maxValue={maxWeeklyValue} />
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Beat Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart data={categoryData} maxValue={maxCategoryValue} />
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievedRewards}/{totalRewards}</div>
              <p className="text-xs text-muted-foreground">
                Achieved rewards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motivational Statements</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStatements}</div>
              <p className="text-xs text-muted-foreground">
                Personal statements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Challenge Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentChallenge?.completedBeats || 0}/{currentChallenge?.totalBeats || 0}</div>
              <p className="text-xs text-muted-foreground">
                Beats completed
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function StatsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Stats</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthenticationPage />;
  }

  return (
    <ChallengeProvider userId={session.user.id}>
      <StatsContent />
    </ChallengeProvider>
  );
}