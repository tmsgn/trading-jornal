"use server";

import type { Trade } from "@/lib/data";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "<REDACTED>";

export async function generateInsightsAction(trades: Trade[]) {
  if (!trades || trades.length === 0) {
    return {
      patterns: [],
      correlations: [],
      recommendations: [],
    };
  }

  // We send a dense, token-efficient payload to the LLM
  const summary = trades.slice(0, 100).map((t) => ({
    sym: t.symbol,
    s: t.side,
    pnl: t.netPnl,
    dur: t.duration,
    t: t.time,
    rr: t.rr,
    tags: t.tags,
    ruleSync: t.rulesChecklist ? (t.rulesChecklist.planFollowed ? 1 : 0) : null,
  }));

  const prompt = `
  You are an expert, professional trading risk manager. Analyze this trade history.
  You MUST explicitly scan for behavioral blind spots, specifically looking for:
  1. Revenge Trading: Rapid consecutive trades or increased frequency immediately following a loss.
  2. Session Slippage: Taking trades outside the primary execution window (e.g., outside 09:30 - 11:30 NY time). Note: "t" is the execution time.
  3. Rule Adherence: Correlating execution notes and the "ruleSync" flag against strategy boundaries.
  
  Return strictly in this JSON format:
  {
    "patterns": [ 
      { "name": "e.g. Breakout", "accuracy": 85, "occurrences": 5, "avgPnl": 500 } 
    ],
    "correlations": [ 
      { "factor": "e.g. Time of Day", "condition": "e.g. Morning", "winRate": "60%", "avgPnl": "+$200" } 
    ],
    "recommendations": [ 
      { "priority": "High", "title": "e.g. Stop Revenge Trading", "description": "...", "impact": "Est +$100/mo" } 
    ]
  }
  Note: priority must be exactly "High", "Medium", or "Low".

  Here are my trades (sym=symbol, s=side, pnl=netPnl, dur=duration(min), t=time, ruleSync=1 if plan followed): ${JSON.stringify(summary)}
  `;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      },
    );

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
      recommendations: [],
    };
  }
}
