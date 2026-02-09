import { NextResponse } from "next/server";
import { performRAG } from "@/app/utils/rag-service";

export async function POST(request) {
  try {
    const { messages, brain_id } = await request.json();
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