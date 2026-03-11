import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { performRAG } from "@/app/utils/rag-service";
import crypto from 'crypto';
import { checkRateLimit, logUsage } from "@/app/utils/usage-service";

export async function POST(request) {
  try {
    // 1. Get and Hash API Key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const rawKey = authHeader.split(' ')[1];
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Admin client to check keys/brains
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Validate Key Owner
    const { data: keyData } = await supabaseAdmin
      .from('api_keys')
      .select('user_id')
      .eq('hashed_key', hashedKey)
      .single();

    if (!keyData) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

    // 2.5 Rate Limit Check
    const isAllowed = await checkRateLimit(keyData.user_id);
    if (!isAllowed) {
        return NextResponse.json({ error: "Rate limit exceeded. 10 requests per hour allowed." }, { status: 429 });
    }

    // 3. Extract request body and check Brain Ownership
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { query, brain_id } = body;
    if (!query || !brain_id) {
      return NextResponse.json({ error: "Missing required fields: query, brain_id" }, { status: 400 });
    }
    
    const { data: brain } = await supabaseAdmin
      .from('brains')
      .select('*')
      .eq('id', brain_id)
      .eq('user_id', keyData.user_id)
      .single();

    if (!brain) return NextResponse.json({ error: "Access Denied: Brain not found" }, { status: 403 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', keyData.user_id)
      .single();

    // 4. Call Service (Non-streaming for standard JSON API)
    const result = await performRAG({ query, brain_id, stream: false, brain, profile });

    // 5. Log Usage
    await logUsage({
        userId: keyData.user_id,
        brainId: brain_id,
        status: 'success',
        model: brain.chat_model || 'llama3-8b-8192',
        type: 'v1_query',
        tokens: Math.ceil(result.response.length / 4)
    });

    // Format Sources
    const sources = result.sourceNodes?.map(node => ({
        file_name: node.node.metadata?.file_name || "Unknown",
        page_label: node.node.metadata?.page_label || null,
        text_snippet: node.node.getContent().substring(0, 150) + "...",
        score: node.score
    })) || [];

    return NextResponse.json({
        answer: result.response,
        sources: sources,
        brain_id: brain_id,
        created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("[V1 API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}