import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Mock response if no API key is provided for testing
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn("[Models API] GROQ_API_KEY is not set. Returning mock models for testing.");
    return NextResponse.json({
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Default)" },
        { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
        { id: "gemma-7b-it", name: "Gemma 7B" }
      ]
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();

    const filteredModels = data.data
      .filter(model => {
        const id = model.id.toLowerCase();
        return !id.includes("whisper") &&
               !id.includes("vision") &&
               !id.includes("embedding") &&
               !id.includes("guard");
      })
      .map(model => ({
        id: model.id,
        name: model.id
      }));

    return NextResponse.json({ models: filteredModels });
  } catch (error) {
    console.error("[Models API] Error fetching models:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
