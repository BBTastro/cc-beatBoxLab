import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// This endpoint provides access to user's localStorage data for the chatbot
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dataType, challengeId } = await req.json();
    const userId = session.user.id;

    // Return the localStorage key pattern that the client should use
    // The client will need to fetch the actual data from localStorage
    const storageKeys = {
      challenges: `beatbox-challenges-${userId}`,
      beats: challengeId ? `beatbox-beats-${userId}-${challengeId}` : null,
      beatDetails: challengeId ? `beatbox-beat-details-${userId}-${challengeId}` : null,
      rewards: challengeId ? `beatbox-rewards-${userId}-${challengeId}` : null,
      statements: `beatbox-statements-${userId}`,
      defaultChallenge: `beatbox-default-challenge-${userId}`,
    };

    return NextResponse.json({
      userId,
      storageKeys,
      dataType,
      challengeId,
    });
  } catch (error) {
    console.error('Error in data endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
