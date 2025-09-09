// Helper functions to access challenge data for the chatbot
import { 
  Challenge, 
  Beat, 
  BeatDetail, 
  Reward, 
  MotivationalStatement,
  StoredChallenge,
  StoredBeat,
  StoredBeatDetail,
  StoredReward,
  StoredMotivationalStatement,
  STORAGE_KEYS
} from './types';
import { db } from './db';
import { challenges, beats, beatDetails, rewards, motivationalStatements } from './schema';
import { eq, desc } from 'drizzle-orm';

// Note: These functions are designed to work in a server environment
// In a real implementation, you'd want to use a proper database
// For now, we'll return placeholder data since localStorage isn't available on the server

export async function getChallengeData(userId: string) {
  try {
    console.log('Getting challenge data for userId:', userId);
    
    // Get the user's default challenge
    const userChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.userId, userId))
      .orderBy(desc(challenges.isDefault), desc(challenges.createdAt));

    console.log('Found challenges:', userChallenges.length);

    if (userChallenges.length === 0) {
      console.log('No challenges found for user');
      return {
        challenge: null,
        beats: [],
        beatDetails: [],
        rewards: [],
        motivationalStatements: [],
      };
    }

    const challenge = userChallenges[0];

    // Get beats for this challenge
    const userBeats = await db
      .select()
      .from(beats)
      .where(eq(beats.challengeId, challenge.id))
      .orderBy(beats.dayNumber);

    // Get beat details for this challenge
    const userBeatDetails = await db
      .select()
      .from(beatDetails)
      .innerJoin(beats, eq(beatDetails.beatId, beats.id))
      .where(eq(beats.challengeId, challenge.id))
      .orderBy(desc(beatDetails.createdAt));

    // Get rewards for this challenge
    const userRewards = await db
      .select()
      .from(rewards)
      .where(eq(rewards.challengeId, challenge.id))
      .orderBy(desc(rewards.createdAt));

    // Get motivational statements for this user
    const userMotivationalStatements = await db
      .select()
      .from(motivationalStatements)
      .where(eq(motivationalStatements.userId, userId))
      .orderBy(desc(motivationalStatements.createdAt));

    return {
      challenge,
      beats: userBeats,
      beatDetails: userBeatDetails.map(bd => bd.beatDetails),
      rewards: userRewards,
      motivationalStatements: userMotivationalStatements,
    };
  } catch (error) {
    console.error('Error fetching challenge data:', error);
    return {
      challenge: null,
      beats: [],
      beatDetails: [],
      rewards: [],
      motivationalStatements: [],
    };
  }
}

export async function getChallengeInfo(userId: string) {
  const data = await getChallengeData(userId);
  if (!data.challenge) {
    return { error: "No challenge found" };
  }
  
  // Ensure beats is an array before filtering
  const beatsArray = Array.isArray(data.beats) ? data.beats : [];
  const completedBeats = beatsArray.filter(beat => beat && beat.isCompleted).length;
  const totalBeats = beatsArray.length;
  return {
    title: data.challenge.title,
    description: data.challenge.description,
    duration: data.challenge.duration,
    status: data.challenge.status,
    startDate: data.challenge.startDate,
    endDate: data.challenge.endDate,
    progress: {
      completed: completedBeats,
      total: totalBeats,
      percentage: totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0,
    },
  };
}

export async function getBeatsProgress(userId: string) {
  const data = await getChallengeData(userId);
  
  if (!data.challenge) {
    return { error: "No challenge found" };
  }
  
  // Ensure arrays are valid before filtering
  const beatsArray = Array.isArray(data.beats) ? data.beats : [];
  const beatDetailsArray = Array.isArray(data.beatDetails) ? data.beatDetails : [];
  
  // Calculate phase information
  const totalDays = data.challenge.duration;
  const completedBeats = beatsArray.filter((beat) => 
    beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
  ).length;
  
  // For 365-day challenges: 5 phases (4 phases of 91 days + 1 final phase of 1 day)
  if (totalDays === 365) {
    const phase1Beats = beatsArray.filter(beat => beat && beat.dayNumber >= 1 && beat.dayNumber <= 91);
    const phase1Completed = phase1Beats.filter(beat => 
      beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
    ).length;
    
    const phase2Beats = beatsArray.filter(beat => beat && beat.dayNumber >= 92 && beat.dayNumber <= 182);
    const phase2Completed = phase2Beats.filter(beat => 
      beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
    ).length;
    
    const phase3Beats = beatsArray.filter(beat => beat && beat.dayNumber >= 183 && beat.dayNumber <= 273);
    const phase3Completed = phase3Beats.filter(beat => 
      beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
    ).length;
    
    const phase4Beats = beatsArray.filter(beat => beat && beat.dayNumber >= 274 && beat.dayNumber <= 364);
    const phase4Completed = phase4Beats.filter(beat => 
      beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
    ).length;
    
    const phase5Beats = beatsArray.filter(beat => beat && beat.dayNumber === 365);
    const phase5Completed = phase5Beats.filter(beat => 
      beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
    ).length;
    
    // Determine current phase
    let currentPhase = 1;
    let phaseProgress = phase1Completed;
    let daysPerPhase = 91;
    
    if (phase1Completed === phase1Beats.length && phase2Completed === 0) {
      currentPhase = 2;
      phaseProgress = 0;
      daysPerPhase = 91;
    } else if (phase2Completed > 0 && phase2Completed < phase2Beats.length) {
      currentPhase = 2;
      phaseProgress = phase2Completed;
      daysPerPhase = 91;
    } else if (phase2Completed === phase2Beats.length && phase3Completed === 0) {
      currentPhase = 3;
      phaseProgress = 0;
      daysPerPhase = 91;
    } else if (phase3Completed > 0 && phase3Completed < phase3Beats.length) {
      currentPhase = 3;
      phaseProgress = phase3Completed;
      daysPerPhase = 91;
    } else if (phase3Completed === phase3Beats.length && phase4Completed === 0) {
      currentPhase = 4;
      phaseProgress = 0;
      daysPerPhase = 91;
    } else if (phase4Completed > 0 && phase4Completed < phase4Beats.length) {
      currentPhase = 4;
      phaseProgress = phase4Completed;
      daysPerPhase = 91;
    } else if (phase4Completed === phase4Beats.length && phase5Completed === 0) {
      currentPhase = 5;
      phaseProgress = 0;
      daysPerPhase = 1;
    } else if (phase5Completed > 0) {
      currentPhase = 5;
      phaseProgress = phase5Completed;
      daysPerPhase = 1;
    }
    
    return {
      totalBeats: beatsArray.length,
      completedBeats: completedBeats,
      currentPhase,
      phaseProgress,
      daysPerPhase,
      completionRate: beatsArray.length > 0 ? Math.round((completedBeats / beatsArray.length) * 100) : 0,
    };
  }
  
  // For other challenge durations: use the 2-phase system
  // Phase 1: All days except the final day
  const phase1EndDay = totalDays - 1;
  const phase1Beats = beatsArray.filter(beat => beat && beat.dayNumber >= 1 && beat.dayNumber <= phase1EndDay);
  const phase1Completed = phase1Beats.filter(beat => 
    beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
  ).length;
  
  // Phase 2: Final day only
  const phase2Beats = beatsArray.filter(beat => beat && beat.dayNumber === totalDays);
  const phase2Completed = phase2Beats.filter(beat => 
    beat && beatDetailsArray.some((detail) => detail && detail.beatId === beat.id)
  ).length;
  
  // Determine current phase
  let currentPhase = 1;
  let phaseProgress = phase1Completed;
  let daysPerPhase = phase1EndDay;
  
  if (phase1Completed === phase1Beats.length && phase2Completed === 0) {
    // Phase 1 complete, starting Phase 2
    currentPhase = 2;
    phaseProgress = 0;
    daysPerPhase = 1;
  } else if (phase2Completed > 0) {
    // In Phase 2
    currentPhase = 2;
    phaseProgress = phase2Completed;
    daysPerPhase = 1;
  }
  
  return {
    totalBeats: beatsArray.length,
    completedBeats: completedBeats,
    currentPhase,
    phaseProgress,
    daysPerPhase,
    completionRate: beatsArray.length > 0 ? Math.round((completedBeats / beatsArray.length) * 100) : 0,
  };
}

export async function getBeatDetails(userId: string, beatId?: string, category?: string, date?: string) {
  console.log('getBeatDetails called with:', { userId, beatId, category, date });
  
  const data = await getChallengeData(userId);
  
  // Ensure arrays are valid
  const beatDetailsArray = Array.isArray(data.beatDetails) ? data.beatDetails : [];
  const beatsArray = Array.isArray(data.beats) ? data.beats : [];
  
  console.log('Challenge data:', { 
    hasChallenge: !!data.challenge, 
    beatDetailsCount: beatDetailsArray.length,
    beatsCount: beatsArray.length 
  });

  if (!data.challenge) {
    console.log('No challenge found, returning empty array');
    return [];
  }

  let filteredDetails = beatDetailsArray;
  console.log('Initial beat details count:', filteredDetails.length);
  
  // Filter by specific beat ID if provided
  if (beatId) {
    filteredDetails = filteredDetails.filter((detail) => detail.beatId === beatId);
  }
  
  // Filter by category if provided
  if (category) {
    console.log('Filtering by category:', category);
    const beforeCount = filteredDetails.length;
    filteredDetails = filteredDetails.filter((detail) => {
      const matches = detail.category?.toLowerCase().includes(category.toLowerCase());
      if (matches) {
        console.log('Found matching detail:', { id: detail.id, category: detail.category, content: detail.content });
      }
      return matches;
    });
    console.log(`Category filter: ${beforeCount} -> ${filteredDetails.length} details`);
  }
  
  // Filter by date if provided
  if (date) {
    // Parse the date string to find matching beats
    const targetDate = parseDate(date);
    if (targetDate) {
      const beatsForDate = beatsArray.filter(beat => {
        return beat && beat.date && new Date(beat.date).toDateString() === targetDate.toDateString();
      });
      const beatIdsForDate = beatsForDate.map(beat => beat.id);
      filteredDetails = filteredDetails.filter(detail => 
        detail && beatIdsForDate.includes(detail.beatId)
      );
    }
  }
  
  // Return filtered beat details sorted by creation date (most recent first)
  return filteredDetails
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helper function to parse various date formats
function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Try different date formats
  const formats = [
    // ISO format
    (d: string) => new Date(d),
    // Month day formats
    (d: string) => {
      const match = d.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?/i);
      if (match) {
        const [, month, day] = match;
        const currentYear = new Date().getFullYear();
        return new Date(`${month} ${day}, ${currentYear}`);
      }
      return null;
    },
    // Numeric formats
    (d: string) => {
      const match = d.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/);
      if (match) {
        const [, month, day, year] = match;
        const currentYear = new Date().getFullYear();
        const fullYear = year ? (year.length === 2 ? `20${year}` : year) : currentYear;
        return new Date(`${month}/${day}/${fullYear}`);
      }
      return null;
    }
  ];
  
  for (const format of formats) {
    try {
      const date = format(dateString);
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      // Continue to next format
    }
  }
  
  return null;
}

export async function getRewards(userId: string) {
  const data = await getChallengeData(userId);
  
  // Ensure rewards is an array
  const rewardsArray = Array.isArray(data.rewards) ? data.rewards : [];
  
  return {
    total: rewardsArray.length,
    planned: rewardsArray.filter((r) => r && r.status === 'planned').length,
    active: rewardsArray.filter((r) => r && r.status === 'active').length,
    achieved: rewardsArray.filter((r) => r && r.status === 'achieved').length,
    rewards: rewardsArray,
  };
}

export async function getMotivationalStatements(userId: string) {
  const data = await getChallengeData(userId);
  return data.motivationalStatements;
}

export async function getProgressStats(userId: string) {
  const data = await getChallengeData(userId);
  
  if (!data.challenge) {
    return { error: "No challenge found" };
  }
  
  const beatsProgress = await getBeatsProgress(userId);
  const rewards = await getRewards(userId);
  
  return {
    challenge: {
      title: data.challenge.title,
      duration: data.challenge.duration,
      status: data.challenge.status,
    },
    beats: beatsProgress,
    rewards: {
      total: rewards.total,
      achieved: rewards.achieved,
      achievementRate: rewards.total > 0 ? Math.round((rewards.achieved / rewards.total) * 100) : 0,
    },
    overall: {
      completionRate: beatsProgress.completionRate,
      currentPhase: beatsProgress.currentPhase,
      daysRemaining: data.challenge.duration - (beatsProgress.completedBeats || 0),
    },
  };
}
