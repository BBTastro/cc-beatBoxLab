import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getChallengeData, getChallengeInfo, getBeatsProgress, getBeatDetails, getRewards, getMotivationalStatements } from '@/lib/challenge-data';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { challenges } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Add runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('Move Boost API called');
    
    const { promptContext, moveType, moveTitle, moveContent, moveAiBoostContent, currentChallengeData }: { 
      promptContext?: string; 
      moveType?: string; 
      moveTitle?: string;
      moveContent?: string;
      moveAiBoostContent?: string;
      currentChallengeData?: any;
    } = await req.json();
    
    console.log('Move Boost request:', { 
      promptContext, 
      moveType, 
      moveTitle, 
      hasMoveContent: !!moveContent,
      hasMoveAiBoostContent: !!moveAiBoostContent,
      moveContentLength: moveContent?.length || 0,
      moveAiBoostContentLength: moveAiBoostContent?.length || 0,
      promptContextLength: promptContext?.length || 0
    });
    
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

    console.log('Move Boost request from user:', userId);
    
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
    
    console.log('Using OpenAI model:', process.env.OPENAI_MODEL || "gpt-4o-mini");

    // Fetch user's challenge data using the same pattern as chatbot
    let challengeData = '';
    let challengeInfo: any = null;
    
    try {
      console.log('Fetching challenge data from database...');
      
      // First, try to get the current challenge data
      challengeInfo = await getChallengeInfo(userId);
      console.log('Challenge info result:', challengeInfo);
      
      // If no challenge found or challenge seems outdated, log detailed info for debugging
      if (!challengeInfo || challengeInfo.error) {
        console.log('No challenge found in database, checking all user challenges...');
        const allChallenges = await db
          .select()
          .from(challenges)
          .where(eq(challenges.userId, userId))
          .orderBy(desc(challenges.createdAt));
        
        console.log('All challenges in database for user:', allChallenges.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          isDefault: c.isDefault,
          createdAt: c.createdAt
        })));
        
        // If we have challenges but none are marked as active, use the most recent one
        if (allChallenges.length > 0) {
          console.log('No active challenge found, using most recent challenge as fallback');
          const mostRecentChallenge = allChallenges[0];
          
          // Get progress data for the fallback challenge
          const fallbackChallengeData = await getChallengeData(userId);
          const fallbackProgress = await getBeatsProgress(userId);
          
          challengeInfo = {
            title: mostRecentChallenge.title,
            description: mostRecentChallenge.description,
            duration: mostRecentChallenge.duration,
            status: mostRecentChallenge.status,
            startDate: mostRecentChallenge.startDate,
            endDate: mostRecentChallenge.endDate,
            progress: {
              completed: fallbackProgress.completedBeats || 0,
              total: fallbackProgress.totalBeats || mostRecentChallenge.duration,
              percentage: fallbackProgress.completionRate || 0
            }
          };
          console.log('Using fallback challenge:', challengeInfo.title, 'with progress:', challengeInfo.progress);
        } else {
          console.log('No challenges found in database at all');
          
          // Use direct challenge data from frontend as final fallback
          if (currentChallengeData && currentChallengeData.challenge) {
            console.log('Using direct challenge data from frontend as fallback');
            const frontendChallenge = currentChallengeData.challenge;
            challengeInfo = {
              title: frontendChallenge.title,
              description: frontendChallenge.description,
              duration: frontendChallenge.duration,
              status: frontendChallenge.status,
              startDate: frontendChallenge.startDate,
              endDate: frontendChallenge.endDate,
              progress: {
                completed: frontendChallenge.completedBeats || 0,
                total: frontendChallenge.totalBeats || frontendChallenge.duration,
                percentage: frontendChallenge.completedBeats && frontendChallenge.totalBeats 
                  ? Math.round((frontendChallenge.completedBeats / frontendChallenge.totalBeats) * 100)
                  : 0
              }
            };
            console.log('Using frontend challenge:', challengeInfo.title, 'with progress:', challengeInfo.progress);
          }
        }
      } else {
        console.log('Found challenge in database:', {
          title: challengeInfo.title,
          status: challengeInfo.status,
          progress: challengeInfo.progress
        });
      }
      
      // Use frontend data if available, otherwise get from database
      let progress, beatDetails, beats, rewards, motivationalStatements;
      
      if (currentChallengeData && currentChallengeData.challenge) {
        console.log('Using frontend data for progress and details');
        progress = {
          currentPhase: 1,
          phaseProgress: 0,
          daysPerPhase: 0,
          completionRate: challengeInfo.progress?.percentage || 0
        };
        beatDetails = currentChallengeData.beatDetails || [];
        beats = currentChallengeData.beats || [];
        rewards = {
          total: currentChallengeData.rewards?.length || 0,
          achieved: currentChallengeData.rewards?.filter((r: any) => r.status === 'achieved').length || 0,
          planned: currentChallengeData.rewards?.filter((r: any) => r.status === 'planned').length || 0,
          active: currentChallengeData.rewards?.filter((r: any) => r.status === 'active').length || 0
        };
        motivationalStatements = currentChallengeData.motivationalStatements || [];
      } else {
        console.log('Using database data for progress and details');
        progress = await getBeatsProgress(userId);
        console.log('Progress result:', progress);
        
        beatDetails = await getBeatDetails(userId);
        console.log('Beat details count:', beatDetails?.length || 0);
        
        // Get beats data for proper date display
        const challengeDataFromDb = await getChallengeData(userId);
        beats = challengeDataFromDb.beats || [];
        console.log('Beats count:', beats.length);
        
        rewards = await getRewards(userId);
        console.log('Rewards result:', rewards);
        
        // Get motivational statements
        motivationalStatements = await getMotivationalStatements(userId);
        console.log('Motivational statements count:', motivationalStatements?.length || 0);
      }
      
      if (challengeInfo && !challengeInfo.error) {
        console.log('Successfully fetched challenge data:', {
          title: challengeInfo.title,
          description: challengeInfo.description,
          status: challengeInfo.status,
          progress: challengeInfo.progress,
          rewards: rewards,
          beatDetailsCount: beatDetails?.length || 0,
          beatsCount: beats.length
        });
        
        // Validate that we have meaningful challenge data
        if (!challengeInfo.title || challengeInfo.title.trim() === '') {
          console.log('Warning: Challenge title is empty or missing');
        }
        
        challengeData = `
USER'S CURRENT CHALLENGE DATA:
- Challenge: ${challengeInfo.title || 'Untitled Challenge'}
- Progress: ${challengeInfo.progress?.completed || 0}/${challengeInfo.progress?.total || 0} days (${challengeInfo.progress?.percentage || 0}% complete)
- Current Phase: ${progress.currentPhase || 'N/A'}
- Completion Rate: ${progress.completionRate || 0}%

RECENT ACTIVITY (last 5 entries):
${(beatDetails || []).slice(0, 5).map((detail: any) => {
  const tag = detail.category || 'untagged';
  const content = detail.content.length > 100 ? detail.content.substring(0, 100) + '...' : detail.content;
  return `- [${tag.toUpperCase()}] ${content}`;
}).join('\n')}

TAG SUMMARY:
${(() => {
  const tagCounts: { [key: string]: number } = {};
  (beatDetails || []).forEach((detail: any) => {
    const tag = detail.category || 'untagged';
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5) // Limit to top 5 tags
    .map(([tag, count]) => `${tag}: ${count}`)
    .join(', ');
})()}

REWARDS: ${rewards.achieved}/${rewards.total} achieved

MOTIVATIONAL STATEMENTS:
${Array.isArray(motivationalStatements) && motivationalStatements.length > 0 ? motivationalStatements.map((statement: any) => {
  const why = statement.why ? `\n  - Why: ${statement.why}` : '';
  const collaboration = statement.collaboration ? `\n  - Collaboration: ${statement.collaboration}` : '';
  return `- ${statement.title}: ${statement.statement}${why}${collaboration}`;
}).join('\n') : 'No motivational statements available'}
        `.trim();
      } else {
        console.log('No challenge data found for user - challengeInfo:', challengeInfo);
        console.log('This might indicate a data access issue or the user truly has no challenges');
        challengeData = '\nUSER HAS NO ACTIVE CHALLENGE DATA. Please encourage them to create their first challenge to start tracking their progress.';
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
      challengeData = '\nUNABLE TO FETCH USER CHALLENGE DATA.';
    }

    // Create system prompt for motivational boost generation
    const systemPrompt = `You are the stepBox Move Assistant, a motivational AI coach specializing in providing personalized encouragement and strategic guidance for goal achievement.

Your role is to generate motivational "boosts" that help users overcome challenges and maintain momentum in their goal pursuit.

RESPONSE REQUIREMENTS:
- Generate a SHORT, CONCISE motivational response of 1-3 sentences maximum
- Keep it quick, punchy, and to the point - no lengthy explanations
- ALWAYS reference the user's actual challenge data provided below
- Be specific to their current challenge title and progress
- Use their motivational statements for personalized encouragement
- Connect their stated motivations ("why") to their current progress
- Address their specific context from the prompt
- Use an encouraging, supportive tone
- Focus on actionable motivation rather than generic advice
- Incorporate the specific Move concept principles into your response
- NEVER say the user has no active challenge if challenge data is provided below

MOVE CONCEPT DETAILS:
- Move Type: ${moveType || 'general'} (${moveTitle || 'Move'})
- Description: ${moveTitle ? 'Focus on this specific movement approach' : 'General motivation'}

${moveContent ? `MOVE CONCEPT PRINCIPLES:
${moveContent}` : ''}

${moveAiBoostContent ? `AI BOOST GUIDANCE:
${moveAiBoostContent}` : ''}

CHALLENGE DATA (USE THIS INFORMATION):
${challengeData}

USER'S ADDITIONAL CONTEXT:
${promptContext || 'No additional context provided'}

CRITICAL INSTRUCTIONS:
1. The challenge data above shows the user's current active challenge
2. Create a SHORT, PUNCHY boost that references their specific challenge title and progress
3. Reference their motivational statements for personalized encouragement
4. Connect their stated "why" motivations to their current progress and the Move concept
5. Incorporate the specific Move concept principles and AI boost guidance into your response
6. Use the user's additional context to personalize the boost further
7. Keep it brief - 1-3 sentences maximum, no lengthy explanations
8. Do not say they have no active challenge if the data above shows challenge information
9. Always mention their challenge title and current progress in your response
10. Make the boost specific to their actual data, not generic advice`;

    console.log('Generating boost with system prompt length:', systemPrompt.length);
    console.log('Challenge data being sent to AI:', challengeData.substring(0, 500) + '...');

    // Generate motivational boost using OpenAI with timeout
    const result = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate a motivational boost for my current challenge and situation. Use the challenge data provided in the system prompt to create a personalized response that references my specific challenge: "${challengeInfo?.title || 'my challenge'}" and my current progress.`
        }
      ],
    });

    console.log('Move Boost generated successfully');

    return new Response(JSON.stringify({
      success: true,
      boost: result.text,
      moveType: moveType || 'general',
      moveTitle: moveTitle || 'Move'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Move Boost API error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('timeout')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Request timed out. Please try again with a shorter prompt.',
        details: 'The AI response took too long to generate.'
      }), {
        status: 408,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate motivational boost. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}