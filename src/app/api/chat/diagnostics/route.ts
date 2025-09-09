import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    console.log('Chat diagnostics endpoint called');
    
    // Get user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'No user session found'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        hasKey: false,
        env: process.env.NODE_ENV 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      userId,
      environment: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 8) + '...',
      configuredModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
      modelTests: [] as Array<{
        model: string;
        status: string;
        responseLength?: number;
        finishReason?: any;
        error?: string;
        errorType?: string;
      }>
    };

    // Test different models
    const testModels = [
      process.env.OPENAI_MODEL || "gpt-4o-mini",
      "gpt-4o-mini", 
      "gpt-3.5-turbo"
    ];

    for (const model of testModels) {
      try {
        console.log(`Testing model: ${model}`);
        const result = await generateText({
          model: openai(model),
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }]
        });
        
        diagnostics.modelTests.push({
          model,
          status: 'success',
          responseLength: result.text.length,
          finishReason: result.finishReason
        });
        
        console.log(`Model ${model} test successful`);
      } catch (error) {
        console.error(`Model ${model} test failed:`, error);
        diagnostics.modelTests.push({
          model,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        });
      }
    }

    return new Response(JSON.stringify(diagnostics), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in diagnostics API:', error);
    
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
