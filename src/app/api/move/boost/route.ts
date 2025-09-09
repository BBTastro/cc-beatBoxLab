import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getChallengeData, getChallengeInfo, getBeatsProgress, getBeatDetails, getRewards } from '@/lib/challenge-data';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    console.log('Move Boost API called');
    
    const { promptContext, moveType, moveTitle, moveContent, moveAiBoostContent }: { 
      promptContext?: string; 
      moveType?: string; 
      moveTitle?: string;
      moveContent?: string;
      moveAiBoostContent?: string;
    } = await req.json();
    
    console.log('Move Boost request:', { 
      promptContext, 
      moveType, 
      moveTitle, 
      hasMoveContent: !!moveContent,
      hasMoveAiBoostContent: !!moveAiBoostContent
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
    
    try {
      console.log('Fetching challenge data from database...');
      const challengeInfo = await getChallengeInfo(userId);
      console.log('Challenge info result:', challengeInfo);
      
      const progress = await getBeatsProgress(userId);
      console.log('Progress result:', progress);
      
      const beatDetails = await getBeatDetails(userId);
      console.log('Beat details count:', beatDetails?.length || 0);
      
      // Get beats data for proper date display
      const challengeDataFromDb = await getChallengeData(userId);
      const beats = challengeDataFromDb.beats || [];
      console.log('Beats count:', beats.length);
      
      const rewards = await getRewards(userId);
      console.log('Rewards result:', rewards);
      
      if (challengeInfo && !challengeInfo.error) {
        console.log('Successfully fetched challenge data:', {
          title: challengeInfo.title,
          progress: challengeInfo.progress,
          rewards: rewards,
          beatDetailsCount: beatDetails?.length || 0
        });
        
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

RECENT BEAT DETAILS WITH TAGS (last 10 entries):
${(beatDetails || []).slice(0, 10).map(detail => {
  const tag = detail.category || 'untagged';
  const content = detail.content;
  
  // Find the corresponding beat to get the assigned date
  const correspondingBeat = (beats || []).find(beat => beat.id === detail.beatId);
  let dateDisplay = 'No date';
  
  if (correspondingBeat) {
    // Use the beat's assigned date and day number
    const assignedDate = new Date(correspondingBeat.date).toLocaleDateString();
    const dayNumber = correspondingBeat.dayNumber;
    dateDisplay = `Day ${dayNumber} (${assignedDate})`;
  } else if (detail.createdAt) {
    // Fallback to creation date if beat not found
    dateDisplay = detail.createdAt.toLocaleDateString();
  }
  
  return `- [${tag.toUpperCase()}] ${content} (${dateDisplay})`;
}).join('\n')}

TAG SUMMARY:
${(() => {
  const tagCounts: { [key: string]: number } = {};
  (beatDetails || []).forEach(detail => {
    const tag = detail.category || 'untagged';
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([tag, count]) => `- ${tag}: ${count} entries`)
    .join('\n');
})()}

REWARDS:
- Total: ${rewards.total}
- Achieved: ${rewards.achieved}
- Planned: ${rewards.planned}
- Active: ${rewards.active}
        `.trim();
      } else {
        console.log('No challenge data found for user');
        challengeData = '\nUSER HAS NO ACTIVE CHALLENGE DATA. Please encourage them to create their first challenge to start tracking their progress.';
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
      challengeData = '\nUNABLE TO FETCH USER CHALLENGE DATA.';
    }

    // Create system prompt for motivational boost generation
    const systemPrompt = `You are the beatBox Move Assistant, a motivational AI coach specializing in providing personalized encouragement and strategic guidance for goal achievement.

Your role is to generate motivational "boosts" that help users overcome challenges and maintain momentum in their goal pursuit.

RESPONSE REQUIREMENTS:
- Generate a motivational response of 2-4 sentences
- Be specific to the user's current challenge and progress
- Reference their actual data when relevant (completion rates, recent entries, etc.)
- Address their specific context and concerns from the prompt
- Use an encouraging, supportive tone
- Focus on actionable motivation rather than generic advice
- Incorporate the specific Move concept principles into your response

MOVE CONCEPT DETAILS:
- Move Type: ${moveType || 'general'} (${moveTitle || 'Move'})
- Description: ${moveTitle ? 'Focus on this specific movement approach' : 'General motivation'}

${moveContent ? `MOVE CONCEPT PRINCIPLES:
${moveContent}

${moveAiBoostContent ? `AI BOOST GUIDANCE:
${moveAiBoostContent}` : ''}` : ''}

${challengeData}

USER'S ADDITIONAL CONTEXT:
${promptContext || 'No additional context provided'}

Generate a personalized motivational boost that helps this user stay motivated and focused on their goal achievement journey. The boost should incorporate the specific Move concept principles and be tailored to their current challenge data and personal context.`;

    console.log('Generating boost with system prompt length:', systemPrompt.length);

    // Generate motivational boost using OpenAI
    const result = await generateText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Generate a motivational boost for my current challenge and situation.'
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
