import { NextResponse } from "next/server";
import { performRAG } from "../../utils/rag-service";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkRateLimit, logUsage } from "../../utils/usage-service";
import { resolveModel } from "../../../lib/models.config";

export async function POST(request) {
  const { messages, brain_id } = await request.json();
  let userId = null;
  let chatModel = "unknown";

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = user.id;

    // 1. Rate Limit Check
    const isAllowed = await checkRateLimit(userId);
    if (!isAllowed) {
        return NextResponse.json({ error: "Rate limit exceeded. 10 requests per hour allowed." }, { status: 429 });
    }

    // 2. Verify ownership & get model info
    const { data: brain } = await supabase
      .from('brains')
      .select('*')
      .eq('id', brain_id)
      .single();

    if (!brain) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    chatModel = resolveModel(brain.chat_model);

    const userQuery = messages[messages.length - 1].content;

    // 3. Call the Service
    const responseStream = await performRAG({ 
        query: userQuery, 
        brain_id, 
        stream: true,
        brain,
        profile
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = "";
        try {
          for await (const chunk of responseStream) {
            controller.enqueue(encoder.encode(chunk.response));
            fullResponse += chunk.response;
          }

          // Log Success
          await logUsage({
              userId,
              brainId: brain_id,
              status: 'success',
              model: chatModel,
              type: 'chat',
              tokens: Math.ceil(fullResponse.length / 4) // Rough estimation of tokens if not provided
          });

          // After stream is finished, send sources if they exist
          if (responseStream.sourceNodes) {
            const sources = responseStream.sourceNodes.map(node => ({
              text: node.node.getContent().substring(0, 200) + "...",
              metadata: node.node.metadata,
              score: node.score
            }));
            controller.enqueue(encoder.encode(`\n\n[SOURCES]\n${JSON.stringify(sources)}`));
          }
        } catch (e) {
          console.error("Stream error:", e);
          await logUsage({
              userId,
              brainId: brain_id,
              status: 'error',
              model: chatModel,
              type: 'chat',
              error: e.message
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("[Chat API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
