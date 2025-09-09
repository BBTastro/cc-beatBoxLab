// Functions to sync localStorage data to the database
import { db } from './db';
import { challenges, beats, beatDetails, rewards, motivationalStatements } from './schema';
import { eq } from 'drizzle-orm';
import { 
  Challenge, 
  Beat, 
  BeatDetail, 
  Reward, 
  MotivationalStatement,
  STORAGE_KEYS 
} from './types';

export async function syncUserDataToDatabase(userId: string) {
  try {
    console.log('Syncing user data to database for userId:', userId);
    
    // This function will be called from the client side
    // We need to get the localStorage data and send it to the server
    // For now, we'll create a placeholder that can be called from the client
    
    return {
      success: true,
      message: 'Sync initiated - this should be called from client side'
    };
  } catch (error) {
    console.error('Error syncing user data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function saveChallengeToDatabase(challenge: Challenge) {
  try {
    await db.insert(challenges).values({
      id: challenge.id,
      userId: challenge.userId,
      title: challenge.title,
      description: challenge.description,
      duration: challenge.duration,
      status: challenge.status,
      isDefault: challenge.isDefault,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      templateId: challenge.templateId,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }).onConflictDoUpdate({
      target: challenges.id,
      set: {
        title: challenge.title,
        description: challenge.description,
        duration: challenge.duration,
        status: challenge.status,
        isDefault: challenge.isDefault,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        templateId: challenge.templateId,
        updatedAt: challenge.updatedAt,
      }
    });
    
    console.log('Saved challenge to database:', challenge.id);
    return { success: true };
  } catch (error) {
    console.error('Error saving challenge to database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveBeatToDatabase(beat: Beat) {
  try {
    await db.insert(beats).values({
      id: beat.id,
      challengeId: beat.challengeId,
      userId: beat.userId,
      date: beat.date,
      dayNumber: beat.dayNumber,
      isCompleted: beat.isCompleted,
      completedAt: beat.completedAt,
      createdAt: beat.createdAt,
      updatedAt: beat.updatedAt,
    }).onConflictDoUpdate({
      target: beats.id,
      set: {
        challengeId: beat.challengeId,
        userId: beat.userId,
        date: beat.date,
        dayNumber: beat.dayNumber,
        isCompleted: beat.isCompleted,
        completedAt: beat.completedAt,
        updatedAt: beat.updatedAt,
      }
    });
    
    console.log('Saved beat to database:', beat.id);
    return { success: true };
  } catch (error) {
    console.error('Error saving beat to database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveBeatDetailToDatabase(beatDetail: BeatDetail) {
  try {
    await db.insert(beatDetails).values({
      id: beatDetail.id,
      beatId: beatDetail.beatId,
      userId: beatDetail.userId,
      content: beatDetail.content,
      category: beatDetail.category,
      createdAt: beatDetail.createdAt,
      updatedAt: beatDetail.updatedAt,
    }).onConflictDoUpdate({
      target: beatDetails.id,
      set: {
        beatId: beatDetail.beatId,
        userId: beatDetail.userId,
        content: beatDetail.content,
        category: beatDetail.category,
        updatedAt: beatDetail.updatedAt,
      }
    });
    
    console.log('Saved beat detail to database:', beatDetail.id);
    return { success: true };
  } catch (error) {
    console.error('Error saving beat detail to database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveRewardToDatabase(reward: Reward) {
  try {
    await db.insert(rewards).values({
      id: reward.id,
      challengeId: reward.challengeId,
      userId: reward.userId,
      title: reward.title,
      description: reward.description,
      status: reward.status,
      proofUrl: reward.proofUrl,
      achievedAt: reward.achievedAt,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    }).onConflictDoUpdate({
      target: rewards.id,
      set: {
        challengeId: reward.challengeId,
        userId: reward.userId,
        title: reward.title,
        description: reward.description,
        status: reward.status,
        proofUrl: reward.proofUrl,
        achievedAt: reward.achievedAt,
        updatedAt: reward.updatedAt,
      }
    });
    
    console.log('Saved reward to database:', reward.id);
    return { success: true };
  } catch (error) {
    console.error('Error saving reward to database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveMotivationalStatementToDatabase(statement: MotivationalStatement) {
  try {
    await db.insert(motivationalStatements).values({
      id: statement.id,
      userId: statement.userId,
      challengeId: statement.challengeId,
      title: statement.title,
      statement: statement.statement,
      why: statement.why,
      collaboration: statement.collaboration,
      createdAt: statement.createdAt,
      updatedAt: statement.updatedAt,
    }).onConflictDoUpdate({
      target: motivationalStatements.id,
      set: {
        userId: statement.userId,
        challengeId: statement.challengeId,
        title: statement.title,
        statement: statement.statement,
        why: statement.why,
        collaboration: statement.collaboration,
        updatedAt: statement.updatedAt,
      }
    });
    
    console.log('Saved motivational statement to database:', statement.id);
    return { success: true };
  } catch (error) {
    console.error('Error saving motivational statement to database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
