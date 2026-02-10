import { NextResponse } from "next/server";
import { performRAG } from "@/app/utils/rag-service";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, brain_id } = await request.json();

    // Verify ownership
    const { data: brain } = await supabase
      .from('brains')
      .select('id')
      .eq('id', brain_id)
      .single();

    if (!brain) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

    const userQuery = messages[messages.length - 1].content;

    // Call the Service
    const responseStream = await performRAG({ 
        query: userQuery, 
        brain_id, 
        stream: true 
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            controller.enqueue(encoder.encode(chunk.response));
          }

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