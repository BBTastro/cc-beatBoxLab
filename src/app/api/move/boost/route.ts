import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getChallengeData } from '@/lib/challenge-data';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    console.log('Move Boost API called');
    
    const { promptContext, moveType, moveTitle }: { 
      promptContext?: string; 
      moveType?: string; 
      moveTitle?: string; 
    } = await req.json();
    
    console.log('Move Boost request:', { promptContext, moveType, moveTitle });
    
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

    // Fetch user's challenge data
    let challengeData = '';
    
    try {
      const data = await getChallengeData(userId);
      console.log('Challenge data fetched:', {
        hasChallenge: !!data.challenge,
        beatsCount: data.beats.length,
        beatDetailsCount: data.beatDetails.length,
        rewardsCount: data.rewards.length,
        statementsCount: data.motivationalStatements.length
      });

      if (data.challenge) {
        // Calculate progress
        const totalBeats = data.beats.length;
        const completedBeats = data.beats.filter(beat => beat.isCompleted).length;
        const progressPercentage = totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0;

        // Format beat details with tags and dates
        const recentBeatDetails = data.beatDetails.slice(0, 10).map(detail => {
          const correspondingBeat = data.beats.find(beat => beat.id === detail.beatId);
          let dateDisplay = 'No date';
          
          if (correspondingBeat) {
            const assignedDate = new Date(correspondingBeat.date).toLocaleDateString();
            const dayNumber = correspondingBeat.dayNumber;
            dateDisplay = `Day ${dayNumber} (${assignedDate})`;
          } else if (detail.createdAt) {
            dateDisplay = detail.createdAt.toLocaleDateString();
          }
          
          const tag = detail.category || 'untagged';
          return `- [${tag.toUpperCase()}] ${detail.content} (${dateDisplay})`;
        });

        // Create tag summary
        const tagCounts: { [key: string]: number } = {};
        data.beatDetails.forEach(detail => {
          const tag = detail.category || 'untagged';
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        const tagSummary = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .map(([tag, count]) => `- ${tag}: ${count} entries`)
          .join('\n');

        // Format rewards
        const totalRewards = data.rewards.length;
        const achievedRewards = data.rewards.filter(reward => reward.status === 'achieved').length;
        const plannedRewards = data.rewards.filter(reward => reward.status === 'planned').length;
        const activeRewards = data.rewards.filter(reward => reward.status === 'active').length;

        // Format motivational statements
        const motivationalStatements = data.motivationalStatements.map(stmt => 
          `- ${stmt.title}: ${stmt.statement}`
        ).join('\n');

        challengeData = `
USER'S CURRENT CHALLENGE DATA:
- Challenge: ${data.challenge.title}
- Description: ${data.challenge.description || 'No description'}
- Duration: ${data.challenge.duration} days
- Status: ${data.challenge.status}
- Progress: ${completedBeats}/${totalBeats} days (${progressPercentage}% complete)
- Start Date: ${new Date(data.challenge.startDate).toLocaleDateString()}
- End Date: ${new Date(data.challenge.endDate).toLocaleDateString()}

RECENT BEAT DETAILS WITH TAGS (last 10 entries):
${recentBeatDetails.join('\n')}

TAG SUMMARY:
${tagSummary}

REWARDS:
- Total: ${totalRewards}
- Achieved: ${achievedRewards}
- Planned: ${plannedRewards}
- Active: ${activeRewards}

MOTIVATIONAL STATEMENTS:
${motivationalStatements || 'No motivational statements'}
        `.trim();
      } else {
        challengeData = '\nUSER HAS NO ACTIVE CHALLENGE DATA.';
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

MOVE TYPE CONTEXT:
- Move Type: ${moveType || 'general'} (${moveTitle || 'Move'})
- This boost should align with the ${moveType || 'general'} movement principles

${challengeData}

USER'S ADDITIONAL CONTEXT:
${promptContext || 'No additional context provided'}

Generate a personalized motivational boost that helps this user stay motivated and focused on their goal achievement journey.`;

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
