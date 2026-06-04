import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { updateMessageFeedback } from '@/lib/db/queries/messages';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const feedbackSchema = z.object({
  feedback: z.enum(['like', 'dislike', 'none']),
  feedback_content: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await requireAuth();
    const { messageId } = await params;

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateMessageFeedback(
      messageId,
      parsed.data.feedback,
      parsed.data.feedback_content
    );

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Feedback error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
