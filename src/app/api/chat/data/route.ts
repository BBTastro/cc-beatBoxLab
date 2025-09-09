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
      challenges: `stepbox-challenges-${userId}`,
      beats: challengeId ? `stepbox-beats-${userId}-${challengeId}` : null,
      beatDetails: challengeId ? `stepbox-beat-details-${userId}-${challengeId}` : null,
      rewards: challengeId ? `stepbox-rewards-${userId}-${challengeId}` : null,
      statements: `stepbox-statements-${userId}`,
      defaultChallenge: `stepbox-default-challenge-${userId}`,
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
