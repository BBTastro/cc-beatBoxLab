import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  saveChallengeToDatabase,
  saveBeatToDatabase,
  saveBeatDetailToDatabase,
  saveRewardToDatabase,
  saveMotivationalStatementToDatabase
} from '@/lib/sync-to-db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      challenges, 
      beats, 
      beatDetails, 
      rewards, 
      motivationalStatements 
    } = await req.json();

    const userId = session.user.id;
    const results = {
      challenges: { success: 0, failed: 0, errors: [] as string[] },
      beats: { success: 0, failed: 0, errors: [] as string[] },
      beatDetails: { success: 0, failed: 0, errors: [] as string[] },
      rewards: { success: 0, failed: 0, errors: [] as string[] },
      motivationalStatements: { success: 0, failed: 0, errors: [] as string[] },
    };

    // Sync challenges
    if (challenges && Array.isArray(challenges)) {
      for (const challenge of challenges) {
        const result = await saveChallengeToDatabase(challenge);
        if (result.success) {
          results.challenges.success++;
        } else {
          results.challenges.failed++;
          results.challenges.errors.push(result.error || 'Unknown error');
        }
      }
    }

    // Sync beats
    if (beats && Array.isArray(beats)) {
      for (const beat of beats) {
        const result = await saveBeatToDatabase(beat);
        if (result.success) {
          results.beats.success++;
        } else {
          results.beats.failed++;
          results.beats.errors.push(result.error || 'Unknown error');
        }
      }
    }

    // Sync beat details
    if (beatDetails && Array.isArray(beatDetails)) {
      for (const beatDetail of beatDetails) {
        const result = await saveBeatDetailToDatabase(beatDetail);
        if (result.success) {
          results.beatDetails.success++;
        } else {
          results.beatDetails.failed++;
          results.beatDetails.errors.push(result.error || 'Unknown error');
        }
      }
    }

    // Sync rewards
    if (rewards && Array.isArray(rewards)) {
      for (const reward of rewards) {
        const result = await saveRewardToDatabase(reward);
        if (result.success) {
          results.rewards.success++;
        } else {
          results.rewards.failed++;
          results.rewards.errors.push(result.error || 'Unknown error');
        }
      }
    }

    // Sync motivational statements
    if (motivationalStatements && Array.isArray(motivationalStatements)) {
      for (const statement of motivationalStatements) {
        const result = await saveMotivationalStatementToDatabase(statement);
        if (result.success) {
          results.motivationalStatements.success++;
        } else {
          results.motivationalStatements.failed++;
          results.motivationalStatements.errors.push(result.error || 'Unknown error');
        }
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      results,
      summary: {
        totalSynced: 
          results.challenges.success + 
          results.beats.success + 
          results.beatDetails.success + 
          results.rewards.success + 
          results.motivationalStatements.success,
        totalFailed: 
          results.challenges.failed + 
          results.beats.failed + 
          results.beatDetails.failed + 
          results.rewards.failed + 
          results.motivationalStatements.failed,
      }
    });
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
