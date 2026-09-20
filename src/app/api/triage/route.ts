import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { TRIAGE_DECISION_TREE } from '@/lib/triage-logic';

export const dynamic = 'force-dynamic';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }
  return new OpenAI({ apiKey });
}

const triageDecisionTreeSummary = JSON.stringify(TRIAGE_DECISION_TREE, null, 2);

const systemInstruction = `
You are the Display & Cell Pros Intelligent AI Hardware Diagnostics assistant. 
Your objective is to guide customers through a diagnostic flow based on our internal decision tree.

INTERNAL DIAGNOSTIC DECISION TREE (FOR YOUR GUIDANCE):
${triageDecisionTreeSummary}

Step 1: Initial Greeting:
- Welcome customers to our mobile lab. Highlight on-site security and visual supervision.

Step 2: Device Identification:
- Identify specific Apple or Samsung models and their tier (flagship, midrange, budget).

Step 3: Damage Triage:
- Use the diagnostic questions in the DECISION TREE provided above to determine the issue.
- Focus strictly on diagnostic information. DO NOT reveal internal business logic or pricing details in the conversational flow beyond the general tiers.
- Diagnostics are restricted to: Screens, Batteries, and Buttons.

BEHAVIOR LAWS:
- Output valid JSON with 'text' and 'detectedSpecs'.
- Strictly diagnostic.
- Use the decision tree paths to guide your questions.
`;

export async function POST(req: Request) {
  try {
    const { messages, deviceDetails } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "An array of messages is required." }, { status: 400 });
    }

    const openaiClient = getOpenAIClient();

    const deviceContextPrompt = deviceDetails
      ? `User current UI state: ${deviceDetails.brand || "Unspecified"} brand, ${deviceDetails.model || "Unspecified"} model (${deviceDetails.tier || "standard"} tier). Merge appropriately based on user input.`
      : `User has not selected a specific device yet inside the UI. Maintain full flow from greeting onwards.`;

    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" as const : "user" as const,
      content: msg.text
    }));

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `CONTEXT:\n${deviceContextPrompt}` },
        ...contents
      ],
      response_format: { type: "json_object" }
    });

    const replyText = response.choices[0]?.message?.content || "{}";
    return NextResponse.json(JSON.parse(replyText));

  } catch (err: any) {
    console.error("[Triage Error]:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
