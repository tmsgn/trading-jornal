"use server";

import type { Trade } from "@/lib/data";
import { getDailyJournalsAction } from "@/app/actions/journal";

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
    notes: t.notes ? t.notes.replace(/<[^>]*>/g, "").trim().slice(0, 150) : "",
    ruleSync: t.rulesChecklist ? (t.rulesChecklist.planFollowed ? 1 : 0) : null,
  }));

  // Fetch daily journals for psychological/mindset analysis
  let journalsList: any[] = [];
  try {
    const journalsMap = await getDailyJournalsAction();
    journalsList = Object.values(journalsMap)
      .slice(0, 30) // get last 30 daily logs
      .map((j) => ({
        d: j.date,
        mood: j.mood,
        sleep: j.sleep,
        stress: j.stress,
        conf: j.confidence,
        disc: j.discipline,
        rating: j.rating,
        preNotes: j.preMarketNotes ? j.preMarketNotes.replace(/<[^>]*>/g, "").trim().slice(0, 150) : "",
        postNotes: j.postMarketNotes ? j.postMarketNotes.replace(/<[^>]*>/g, "").trim().slice(0, 150) : "",
        notes: j.notes ? j.notes.replace(/<[^>]*>/g, "").trim().slice(0, 150) : "",
      }));
  } catch (err) {
    console.error("Failed to load journals for AI", err);
  }

  const prompt = `
  You are an expert, professional trading risk manager. Analyze this trade history and daily journal reflection logs to find actionable patterns.
  You MUST explicitly scan for behavioral, psychological, and execution blind spots, specifically looking for:
  1. Revenge Trading: Rapid consecutive trades or increased frequency immediately following a loss.
  2. Session Slippage: Taking trades outside the primary execution window (e.g., outside 09:30 - 11:30 NY time). Note: "t" is the execution time.
  3. Rule Adherence: Correlating execution notes and the "ruleSync" flag against strategy boundaries.
  4. Mindset & Performance: How stress, sleep, mood, confidence, discipline, and pre/post-market notes correlate with trading outcomes (wins/losses).
  
  Return strictly in this JSON format:
  {
    "patterns": [ 
      { "name": "e.g. Overtrading on Low Sleep", "accuracy": 85, "occurrences": 5, "avgPnl": -150 } 
    ],
    "correlations": [ 
      { "factor": "e.g. Sleep vs PnL", "condition": "e.g. Sleep < 3 hours", "winRate": "30%", "avgPnl": "-$250" } 
    ],
    "recommendations": [ 
      { "priority": "High", "title": "e.g. Implement Sleep Rules", "description": "Do not trade on days with less than 6 hours of sleep as your win rate drops to 30%.", "impact": "Est +$250/mo" } 
    ]
  }
  Note: priority must be exactly "High", "Medium", or "Low".

  Here are my trades (sym=symbol, s=side, pnl=netPnl, dur=duration(min), t=time, ruleSync=1 if plan followed): ${JSON.stringify(summary)}

  Here are my daily journal reflections (d=date, conf=confidence 1-5, disc=discipline 1-5, rating=overall rating 1-5, preNotes=pre-market outlook, postNotes=post-market reflection, notes=general daily notes): ${JSON.stringify(journalsList)}
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

