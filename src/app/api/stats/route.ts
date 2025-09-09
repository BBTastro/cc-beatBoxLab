import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getChallengeData, getProgressStats } from '@/lib/challenge-data';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('Fetching stats data for userId:', userId);

    // Get comprehensive challenge data from database
    const challengeData = await getChallengeData(userId);
    const progressStats = await getProgressStats(userId);

    console.log('Stats API - challengeData:', {
      hasChallenge: !!challengeData.challenge,
      challengeId: challengeData.challenge?.id,
      challengeTitle: challengeData.challenge?.title,
      challengeStatus: challengeData.challenge?.status,
      beatsCount: challengeData.beats?.length || 0,
      beatDetailsCount: challengeData.beatDetails?.length || 0,
    });

    if (!challengeData.challenge) {
      return NextResponse.json({
        success: true,
        data: {
          currentChallenge: null,
          beats: [],
          beatDetails: [],
          rewards: [],
          motivationalStatements: [],
          stats: null,
        }
      });
    }

    // Calculate additional stats for the stats page
    const beats = challengeData.beats || [];
    const beatDetails = challengeData.beatDetails || [];
    const rewards = challengeData.rewards || [];
    const motivationalStatements = challengeData.motivationalStatements || [];

    // Calculate completion rate based on beat details (same logic as frontend)
    const completedBeats = beats.filter(beat => 
      beatDetails.some(detail => detail.beatId === beat.id)
    ).length;

    const currentChallenge = {
      ...challengeData.challenge,
      totalBeats: beats.length,
      completedBeats,
      rewardsCount: rewards.length,
    };

    // Calculate weekly activity data
    const getWeeklyActivityData = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const weeklyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        
        // Find beat details for this specific day
        const dayBeatDetails = beatDetails.filter(detail => {
          const beat = beats.find(beat => beat.id === detail.beatId);
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

    // Calculate category distribution
    const getCategoryDistributionData = () => {
      const categoryCounts: { [key: string]: number } = {};
      
      beatDetails.forEach(detail => {
        const category = detail.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
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

    const weeklyData = getWeeklyActivityData();
    const categoryData = getCategoryDistributionData();

    // Calculate additional stats
    const totalEntries = beatDetails.length;
    const activeDays = new Set(beatDetails.map(detail => {
      const beat = beats.find(beat => beat.id === detail.beatId);
      return beat ? new Date(beat.date).toDateString() : null;
    }).filter(Boolean)).size;
    const categories = new Set(beatDetails.map(detail => detail.category).filter(Boolean)).size;
    const totalRewards = rewards.length;
    const achievedRewards = rewards.filter(reward => reward.status === 'achieved').length;
    const totalStatements = motivationalStatements.length;

    const stats = {
      completionRate: beats.length > 0 ? Math.round((completedBeats / beats.length) * 100) : 0,
      totalEntries,
      activeDays,
      categories,
      totalRewards,
      achievedRewards,
      totalStatements,
      weeklyData,
      categoryData,
      maxWeeklyValue: Math.max(...weeklyData.map(day => day.value), 1),
      maxCategoryValue: Math.max(...categoryData.map(cat => cat.value), 1),
    };

    return NextResponse.json({
      success: true,
      data: {
        currentChallenge,
        beats,
        beatDetails,
        rewards,
        motivationalStatements,
        stats,
        progressStats,
      }
    });

  } catch (error) {
    console.error('Error fetching stats data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
