"use server";

import { Trade } from "@/lib/data";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "<REDACTED>";

export async function generateInsightsAction(trades: Trade[]) {
  if (!trades || trades.length === 0) {
    return {
      patterns: [],
      correlations: [],
      recommendations: []
    };
  }

  // We send a summary of the trades to the LLM to save tokens and speed up generation
  const summary = trades.slice(0, 50).map(t => ({
    symbol: t.symbol,
    side: t.side,
    netPnl: t.netPnl,
    duration: t.duration,
    rr: t.rr
  }));

  const prompt = `
  You are an expert, professional trading coach. I am going to give you my recent trade history.
  Please analyze my performance and give me 3 distinct JSON arrays. Be realistic and data-driven.
  
  Return strictly in this JSON format:
  {
    "patterns": [ 
      { "name": "e.g. Breakout", "accuracy": 85, "occurrences": 5, "avgPnl": 500 } 
    ],
    "correlations": [ 
      { "factor": "e.g. Time of Day", "condition": "e.g. Morning", "winRate": "60%", "avgPnl": "+$200" } 
    ],
    "recommendations": [ 
      { "priority": "High", "title": "e.g. Stop overtrading", "description": "...", "impact": "Est +$100/mo" } 
    ]
  }
  Note: priority must be exactly "High", "Medium", or "Low".

  Here are my trades: ${JSON.stringify(summary)}
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      console.error("Groq API Error:", await response.text());
      throw new Error("Failed to generate insights");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
    
  } catch (error) {
    console.error("Failed to call Groq", error);
    return {
      patterns: [],
      correlations: [],
      recommendations: []
    };
  }
}
