import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";
import { 
  getBeatDetails, 
  getChallengeInfo, 
  getBeatsProgress, 
  getRewards,
  getChallengeData,
  getMotivationalStatements
} from "@/lib/challenge-data";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log('Chat API called');
    
    const { messages, challengeData: frontendChallengeData }: { messages: UIMessage[], challengeData?: any } = await req.json();
    
    // Validate messages array
    if (!Array.isArray(messages)) {
      console.error('Messages is not an array:', messages);
      return new Response(JSON.stringify({
        error: 'Invalid messages format',
        received: typeof messages
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('Messages received:', messages.length);
    console.log('Challenge data received:', frontendChallengeData ? 'Yes' : 'No');
    if (frontendChallengeData) {
      console.log('Frontend challenge data:', JSON.stringify(frontendChallengeData, null, 2));
    }
    
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

    console.log('Chat request from user:', userId, 'with', messages.length, 'messages');
    
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
    console.log('OpenAI API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 8) + '...');

    // Always try to get the latest data from database first, then use frontend data as fallback
    let challengeData = '';
    let usingDatabaseData = false;
    
    // First, try to get the latest data from database to ensure we have the most current active challenge
    try {
      console.log('Fetching latest challenge data from database...');
      const challengeInfo = await getChallengeInfo(userId);
      console.log('Database challenge info:', challengeInfo);
      
      if (challengeInfo && !challengeInfo.error && challengeInfo.status === 'active') {
        console.log('Using database data (active challenge found)');
        usingDatabaseData = true;
        
        const progress = await getBeatsProgress(userId);
        const beatDetails = await getBeatDetails(userId);
        const challengeDataFromDb = await getChallengeData(userId);
        const beats = challengeDataFromDb.beats || [];
        const rewards = await getRewards(userId);
        const motivationalStatements = await getMotivationalStatements(userId);
        
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

MOTIVATIONAL STATEMENTS:
${Array.isArray(motivationalStatements) && motivationalStatements.length > 0 ? motivationalStatements.map((statement: any) => {
  const why = statement.why ? `\n  - Why: ${statement.why}` : '';
  const collaboration = statement.collaboration ? `\n  - Collaboration: ${statement.collaboration}` : '';
  return `- ${statement.title}: ${statement.statement}${why}${collaboration}`;
}).join('\n') : 'No motivational statements available'}
        `.trim();
      }
    } catch (dbError) {
      console.error('Error fetching from database, falling back to frontend data:', dbError);
    }
    
    // If we didn't get active challenge data from database, use frontend data as fallback
    if (!usingDatabaseData && frontendChallengeData && frontendChallengeData.challenge && frontendChallengeData.challenge.name) {
      console.log('Using challenge data from frontend (database fallback)');
      const { challenge, beats, beatDetails, rewards, motivationalStatements } = frontendChallengeData;
      
      // Calculate progress with safe array handling
      const beatsArray = Array.isArray(beats) ? beats : [];
      const totalBeats = beatsArray.length;
      const completedBeats = beatsArray.filter((beat: any) => beat && beat.completed).length;
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
- Total Steps: ${totalBeats}
- Completed Steps: ${completedBeats}
- Completion Rate: ${completionRate}%
- Recent Steps: ${beatsArray.slice(0, 5).map((beat: any) => `${beat?.date || 'No date'}: ${beat?.completed ? 'Completed' : 'Pending'}`).join(', ')}

RECENT BEAT DETAILS WITH TAGS (last 10 entries):
${Array.isArray(beatDetails) ? beatDetails.slice(0, 10).map((detail: any) => {
  const tag = detail?.category || 'untagged';
  const content = detail?.content || 'No content';
  
  // Find the corresponding beat to get the assigned date
  const correspondingBeat = Array.isArray(beats) ? beats.find((beat: any) => beat.id === detail.beatId) : null;
  let dateDisplay = 'No date';
  
  if (correspondingBeat) {
    // Use the beat's assigned date and day number
    const assignedDate = new Date(correspondingBeat.date).toLocaleDateString();
    const dayNumber = correspondingBeat.dayNumber;
    dateDisplay = `Day ${dayNumber} (${assignedDate})`;
  } else if (detail?.createdAt) {
    // Fallback to creation date if beat not found
    dateDisplay = new Date(detail.createdAt).toLocaleDateString();
  }
  
  return `- [${tag.toUpperCase()}] ${content} (${dateDisplay})`;
}).join('\n') : 'No beat details available'}

TAG SUMMARY:
${Array.isArray(beatDetails) ? (() => {
  const tagCounts: { [key: string]: number } = {};
  beatDetails.forEach((detail: any) => {
    const tag = detail?.category || 'untagged';
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([tag, count]) => `- ${tag}: ${count} entries`)
    .join('\n');
})() : 'No tags available'}

REWARDS EARNED:
${Array.isArray(rewards) ? rewards.slice(0, 5).map((reward: any) => `- ${reward?.name || 'No name'}: ${reward?.description || 'No description'}`).join('\n') : 'No rewards available'}

MOTIVATIONAL STATEMENTS:
${Array.isArray(motivationalStatements) && motivationalStatements.length > 0 ? motivationalStatements.map((statement: any) => {
  const why = statement.why ? `\n  - Why: ${statement.why}` : '';
  const collaboration = statement.collaboration ? `\n  - Collaboration: ${statement.collaboration}` : '';
  return `- ${statement.title}: ${statement.statement}${why}${collaboration}`;
}).join('\n') : 'No motivational statements available'}
      `.trim();
    } else {
      console.log('No challenge data available from either database or frontend');
      challengeData = '\nUSER HAS NO ACTIVE CHALLENGE DATA.';
    }

    // Filter and validate messages before conversion
    const validMessages = messages.filter(msg => 
      msg && 
      typeof msg === 'object' && 
      (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
      ('content' in msg || 'text' in msg)
    );
    console.log('Valid messages count:', validMessages.length);
    console.log('Valid messages:', JSON.stringify(validMessages, null, 2));
    
    // Ensure messages have the correct structure for convertToModelMessages
    const formattedMessages = validMessages.map(msg => {
      // Extract content from various possible formats
      let content = '';
      if ((msg as any).content) {
        content = (msg as any).content;
      } else if ((msg as any).text) {
        content = (msg as any).text;
      } else if (msg.parts && Array.isArray(msg.parts)) {
        // Extract text from parts array
        const textParts = msg.parts.filter(part => part.type === 'text');
        content = textParts.map(part => (part as any).text).join('');
      }
      
      return {
        id: msg.id || Date.now().toString(),
        role: msg.role,
        parts: [{ type: 'text' as const, text: content }],
        createdAt: (msg as any).createdAt || new Date()
      };
    });
    console.log('Formatted messages:', JSON.stringify(formattedMessages, null, 2));

    // Try streaming first, fallback to non-streaming if organization verification fails
    let result;
    try {
      result = streamText({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        messages: convertToModelMessages(formattedMessages),
        onError: ({ error }) => {
          console.error('Chatbot streaming error:', error);
        },
        onFinish: ({ response }) => {
          console.log('Chat completed successfully:', response);
        },
        system: `You are the stepBox Assistant, a helpful AI coach for stepBox, a daily goal tracking application.

RESPONSE STYLE:
- Be extremely concise and direct. Answer ONLY the specific question asked.
- For simple questions (like "tell me about my meals" or "bad day"), give brief, focused answers in 1-2 sentences.
- NEVER provide detailed analysis, actionable steps, or lengthy explanations unless specifically requested.
- Keep responses under 2-3 sentences for basic questions.
- Do NOT include sections, bullet points, or multiple paragraphs for simple questions.

Key concepts:
- Challenges: Goal-tracking campaigns with specific durations
- Steps: Individual days in a challenge
- Step Details: Daily entries with categories/tags (e.g., "meals", "bad day", "exercise")
- Motivational Statements: Personal statements that include the statement, why (reasoning), and collaboration (how others can help)
- Progress tracking and motivation

TAG ANALYSIS:
- Always look at the tags/categories when analyzing entries
- Group entries by their tags to identify patterns
- Use tag information to provide specific insights about user behavior
- When users ask about specific topics (like "meals" or "bad day"), focus on entries with those tags

MOTIVATIONAL STATEMENTS:
- Reference the user's motivational statements when providing encouragement
- Use the "why" field to understand their deeper motivation
- Suggest collaboration opportunities based on the "collaboration" field
- Connect current progress to their stated motivations

DATE FORMATTING:
- Use the formatted dates provided in the data (e.g., "9/9/2025") 
- Do NOT use raw timestamp formats like "2025-09-09T13:29:42.779Z"
- Always reference dates in a user-friendly format

EXAMPLE RESPONSES:
- "tell me about my meals" → "You have 2 meal entries: Bacon and Eggs and Burger & Fries on 9/9/2025."
- "bad day" → "You logged 1 bad day entry: 'Alligator in the toilet' on 9/9/2025. You're at 3/7 steps complete (43%)."

CRITICAL INSTRUCTIONS:
1. You ONLY respond about the user's CURRENT ACTIVE CHALLENGE. Do not discuss past challenges, future challenges, or general topics.
2. You have access to the user's actual challenge data below. When users ask about their challenge, progress, or data, provide direct answers based on their real data instead of asking them to provide it manually.
3. If the user asks about anything other than their current active challenge, politely redirect them back to their current challenge.
4. Match the response length to the question complexity - simple questions get simple answers.

${challengeData}

Be helpful but concise. If users don't have any data yet, encourage them to start their first challenge and begin tracking their progress.`,
      });
    } catch (streamingError) {
      console.error('Streaming failed, trying non-streaming approach:', streamingError);
      
      // Fallback to non-streaming if streaming fails due to organization verification
      if (streamingError instanceof Error && 
          streamingError.message.includes('organization must be verified')) {
        
        console.log('Organization verification issue detected, using non-streaming fallback');
        
        // Import generateText for non-streaming fallback
        const { generateText } = await import("ai");
        
        // Try different models in order of preference for non-streaming
        const fallbackModels = [
          process.env.OPENAI_MODEL || "gpt-4o-mini",
          "gpt-4o-mini",
          "gpt-3.5-turbo"
        ];
        
        let nonStreamingResult;
        let lastError;
        
        for (const model of fallbackModels) {
          try {
            console.log(`Trying non-streaming with model: ${model}`);
            nonStreamingResult = await generateText({
              model: openai(model),
              messages: convertToModelMessages(formattedMessages),
              system: `You are the stepBox Assistant, a helpful AI coach for stepBox, a daily goal tracking application.

RESPONSE STYLE:
- Be extremely concise and direct. Answer ONLY the specific question asked.
- For simple questions (like "tell me about my meals" or "bad day"), give brief, focused answers in 1-2 sentences.
- NEVER provide detailed analysis, actionable steps, or lengthy explanations unless specifically requested.
- Keep responses under 2-3 sentences for basic questions.
- Do NOT include sections, bullet points, or multiple paragraphs for simple questions.

Key concepts:
- Challenges: Goal-tracking campaigns with specific durations
- Steps: Individual days in a challenge
- Step Details: Daily entries with categories/tags (e.g., "meals", "bad day", "exercise")
- Motivational Statements: Personal statements that include the statement, why (reasoning), and collaboration (how others can help)
- Progress tracking and motivation

TAG ANALYSIS:
- Always look at the tags/categories when analyzing entries
- Group entries by their tags to identify patterns
- Use tag information to provide specific insights about user behavior
- When users ask about specific topics (like "meals" or "bad day"), focus on entries with those tags

MOTIVATIONAL STATEMENTS:
- Reference the user's motivational statements when providing encouragement
- Use the "why" field to understand their deeper motivation
- Suggest collaboration opportunities based on the "collaboration" field
- Connect current progress to their stated motivations

DATE FORMATTING:
- Use the formatted dates provided in the data (e.g., "9/9/2025") 
- Do NOT use raw timestamp formats like "2025-09-09T13:29:42.779Z"
- Always reference dates in a user-friendly format

EXAMPLE RESPONSES:
- "tell me about my meals" → "You have 2 meal entries: Bacon and Eggs and Burger & Fries on 9/9/2025."
- "bad day" → "You logged 1 bad day entry: 'Alligator in the toilet' on 9/9/2025. You're at 3/7 steps complete (43%)."

CRITICAL INSTRUCTIONS:
1. You ONLY respond about the user's CURRENT ACTIVE CHALLENGE. Do not discuss past challenges, future challenges, or general topics.
2. You have access to the user's actual challenge data below. When users ask about their challenge, progress, or data, provide direct answers based on their real data instead of asking them to provide it manually.
3. If the user asks about anything other than their current active challenge, politely redirect them back to their current challenge.
4. Match the response length to the question complexity - simple questions get simple answers.

${challengeData}

Be helpful but concise. If users don't have any data yet, encourage them to start their first challenge and begin tracking their progress.`,
            });
            console.log(`Successfully used model: ${model}`);
            break;
          } catch (modelError) {
            console.error(`Model ${model} failed:`, modelError);
            lastError = modelError;
            continue;
          }
        }
        
        if (!nonStreamingResult) {
          throw lastError || new Error('All fallback models failed');
        }
        
        // Convert non-streaming result to streaming response
        return new Response(
          JSON.stringify({
            id: Date.now().toString(),
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            choices: [{
              index: 0,
              delta: { content: nonStreamingResult.text },
              finish_reason: 'stop'
            }]
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          }
        );
      } else {
        // Re-throw if it's not an organization verification error
        throw streamingError;
      }
    }

    try {
      return result.toUIMessageStreamResponse();
    } catch (streamError) {
      console.error('Error converting to UI message stream response:', streamError);
      // Fallback to simple response if streaming conversion fails
      return new Response(JSON.stringify({
        error: 'Streaming response error',
        message: 'Unable to stream response, please try again'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
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
