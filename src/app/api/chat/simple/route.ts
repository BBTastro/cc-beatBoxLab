import { openai } from "@ai-sdk/openai";
import { generateText, UIMessage, convertToModelMessages, tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { 
  getBeatDetails, 
  getChallengeInfo, 
  getBeatsProgress, 
  getRewards, 
  getMotivationalStatements,
  getProgressStats,
  getChallengeData
} from "@/lib/challenge-data";

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log('Simple Chat API called (non-streaming fallback)');
    
    const { messages, challengeData: frontendChallengeData }: { messages: UIMessage[], challengeData?: any } = await req.json();
    console.log('Messages received:', messages.length);
    console.log('Message format:', JSON.stringify(messages, null, 2));
    console.log('Challenge data received:', frontendChallengeData ? 'Yes' : 'No');
    
    // Get user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    const userId = session?.user?.id;
    console.log('User session:', userId ? 'found' : 'not found');
    
    if (!userId) {
      console.error('No user session found');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('Simple chat request from user:', userId, 'with', messages.length, 'messages');
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        hasKey: !!process.env.OPENAI_API_KEY,
        env: process.env.NODE_ENV 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Using OpenAI model (non-streaming):', process.env.OPENAI_MODEL || "gpt-4o-mini");
    console.log('OpenAI API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 8) + '...');

    // Use challenge data passed from frontend or fetch from database as fallback
    let challengeData = '';
    
    if (frontendChallengeData && frontendChallengeData.challenge) {
      console.log('Using challenge data from frontend');
      const { challenge, beats, beatDetails, rewards } = frontendChallengeData;
      
      // Calculate progress
      const totalBeats = beats.length;
      const completedBeats = beats.filter((beat: any) => beat.completed).length;
      const completionRate = totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0;
      
      // Format challenge data for the AI
      challengeData = `
USER'S CURRENT CHALLENGE DATA:
- Challenge: ${challenge.name || 'No active challenge'}
- Description: ${challenge.description || 'No description'}
- Start Date: ${challenge.startDate || 'Not set'}
- End Date: ${challenge.endDate || 'Not set'}
- Status: ${challenge.status || 'Unknown'}
- Progress: ${completedBeats}/${totalBeats} beats (${completionRate}%)

PROGRESS DETAILS:
- Total Beats: ${totalBeats}
- Completed Beats: ${completedBeats}
- Completion Rate: ${completionRate}%
- Recent Beats: ${beats.slice(0, 5).map((beat: any) => `${beat.date}: ${beat.completed ? 'Completed' : 'Pending'}`).join(', ')}

RECENT BEAT DETAILS (last 10 entries):
${beatDetails.slice(0, 10).map((detail: any) => `- ${detail.content} (${detail.category || 'no category'}) - ${detail.createdAt || 'No date'}`).join('\n')}

REWARDS EARNED:
${rewards.slice(0, 5).map((reward: any) => `- ${reward.name}: ${reward.description}`).join('\n')}
      `.trim();
    } else {
      console.log('No challenge data from frontend, fetching from database...');
      try {
        const challengeInfo = await getChallengeInfo(userId);
        const progress = await getBeatsProgress(userId);
        const beatDetails = await getBeatDetails(userId);
        const rewards = await getRewards(userId);
        
        if (challengeInfo && !challengeInfo.error) {
          challengeData = `
USER'S CURRENT CHALLENGE DATA:
- Challenge: ${challengeInfo.title}
- Description: ${challengeInfo.description || 'No description'}
- Duration: ${challengeInfo.duration} days
- Status: ${challengeInfo.status}
- Progress: ${challengeInfo.progress?.completed || 0}/${challengeInfo.progress?.total || 0} days (${challengeInfo.progress?.percentage || 0}% complete)
- Start Date: ${challengeInfo.startDate}
- End Date: ${challengeInfo.endDate}

PROGRESS DETAILS:
- Current Phase: ${progress.currentPhase || 'N/A'}
- Phase Progress: ${progress.phaseProgress || 0}/${progress.daysPerPhase || 0}
- Completion Rate: ${progress.completionRate || 0}%

RECENT BEAT DETAILS (last 10 entries):
${beatDetails.slice(0, 10).map(detail => `- ${detail.content} (${detail.category || 'no category'}) - ${detail.createdAt.toDateString()}`).join('\n')}

REWARDS:
- Total: ${rewards.total}
- Achieved: ${rewards.achieved}
- Planned: ${rewards.planned}
- Active: ${rewards.active}
          `.trim();
        } else {
          challengeData = '\nUSER HAS NO ACTIVE CHALLENGE DATA.';
        }
      } catch (error) {
        console.error('Error fetching challenge data:', error);
        challengeData = '\nUNABLE TO FETCH USER CHALLENGE DATA.';
      }
    }

    // Try different models in order of preference for non-streaming
    const fallbackModels = [
      process.env.OPENAI_MODEL || "gpt-4o-mini",
      "gpt-4o-mini",
      "gpt-3.5-turbo"
    ];
    
    let result;
    let lastError;
    let usedModel;
    
    for (const model of fallbackModels) {
      try {
        console.log(`Trying simple endpoint with model: ${model}`);
        result = await generateText({
          model: openai(model),
          messages: convertToModelMessages(messages),
          system: `You are the beatBox Assistant, an enthusiastic and personalized AI coach for beatBox, a daily goal tracking application. 

You help users track their daily progress, analyze their habits, and stay motivated on their journey of self-improvement.

Be warm, encouraging, and helpful. Always provide actionable insights and celebrate their progress.

Key concepts:
- Challenges: Goal-tracking campaigns with specific durations
- Beats: Individual days in a challenge
- Beat Details: Daily entries with categories/tags
- Progress tracking and motivation

CRITICAL INSTRUCTIONS:
1. You ONLY respond about the user's CURRENT ACTIVE CHALLENGE. Do not discuss past challenges, future challenges, or general topics.
2. You have access to the user's actual challenge data below. When users ask about their challenge, progress, or data, provide direct answers based on their real data instead of asking them to provide it manually.
3. If the user asks about anything other than their current active challenge, politely redirect them back to their current challenge.
4. Always be supportive and provide personalized guidance based on their current challenge data.

${challengeData}

Always be supportive and provide personalized guidance. If users don't have any data yet, encourage them to start their first challenge and begin tracking their progress.`,
        });
        usedModel = model;
        console.log(`Successfully used model: ${model}`);
        break;
      } catch (modelError) {
        console.error(`Model ${model} failed:`, modelError);
        lastError = modelError;
        continue;
      }
    }
    
    if (!result) {
      throw lastError || new Error('All fallback models failed');
    }

    console.log('Simple chat completed successfully');

    return new Response(JSON.stringify({
      id: Date.now().toString(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: usedModel || process.env.OPENAI_MODEL || "gpt-4o-mini",
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: result.text
        },
        finish_reason: 'stop'
      }]
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in simple chat API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
