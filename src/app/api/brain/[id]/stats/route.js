import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id: brain_id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Total Requests
    const { count: totalRequests } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .eq('brain_id', brain_id);

    // 2. Success/Error breakdown
    const { data: statusStats } = await supabase
      .from('request_logs')
      .select('status')
      .eq('brain_id', brain_id);

    const successCount = statusStats?.filter(s => s.status === 'success').length || 0;
    const errorCount = (statusStats?.length || 0) - successCount;

    // 3. Token Count
    const { data: tokenData } = await supabase
      .from('request_logs')
      .select('tokens_used')
      .eq('brain_id', brain_id);

    const totalTokens = tokenData?.reduce((acc, curr) => acc + (curr.tokens_used || 0), 0) || 0;

    // 4. Recent Logs
    const { data: recentLogs } = await supabase
      .from('request_logs')
      .select('*')
      .eq('brain_id', brain_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
        totalRequests,
        successCount,
        errorCount,
        totalTokens,
        recentLogs
    });
  } catch (error) {
    console.error("[Brain Stats API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
