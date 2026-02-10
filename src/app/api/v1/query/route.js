import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { performRAG } from "@/app/utils/rag-service";
import crypto from 'crypto';

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
      .select('id')
      .eq('id', brain_id)
      .eq('user_id', keyData.user_id)
      .single();

    if (!brain) return NextResponse.json({ error: "Access Denied: Brain not found" }, { status: 403 });

    // 4. Call Service (Non-streaming for standard JSON API)
    const result = await performRAG({ query, brain_id, stream: false });

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}