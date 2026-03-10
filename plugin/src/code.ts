import { buildReportFrame } from "./report-builder";
import { AGENTS, SYNTHESIS_PROMPT, PLANNING_PROMPT, buildContextBlock } from "./agents";
import type { PluginMessage, AgentResult, SynthesisResult, AuditContext, AuditPlan, AgentPlanInstructions } from "./types";

const MODEL = "claude-sonnet-4-20250514";
const API_HEADERS = {
  "Content-Type": "application/json",
  "anthropic-version": "2023-06-01",
};

function parseJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

function buildContextBlock(context: AuditContext): string {
  const lines = [];
  if (context.productType) lines.push(`- Product type: ${context.productType}`);
  if (context.targetAudience) lines.push(`- Target audience: ${context.targetAudience}`);
  if (context.userGoal) lines.push(`- User's goal on this screen: ${context.userGoal}`);
  if (context.projectStage) lines.push(`- Project stage: ${context.projectStage}`);
  if (context.additionalNotes) lines.push(`- Additional context: ${context.additionalNotes}`);
  if (!lines.length) return "";
  return `\n\nDESIGN CONTEXT (take this into account during your analysis):\n${lines.join("\n")}\n`;
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  imageBase64: string
): Promise<AgentResult> {
  if (!apiKey.trim()) {
    throw new Error("API key is empty");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { ...API_HEADERS, "x-api-key": apiKey },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } },
          { type: "text", text: "Analyze this UI design thoroughly according to your expertise. Be specific and actionable. Return max 5 findings to keep response concise." },
        ],
      }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }
  const data = await response.json() as { content: Array<{ text?: string }> };
  const text = data.content.map((i) => i.text ?? "").join("");
  return parseJSON(text) as AgentResult;
}

async function callClaudeSynthesis(
  apiKey: string,
  results: AgentResult[]
): Promise<SynthesisResult> {
  if (!apiKey.trim()) {
    throw new Error("API key is empty");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { ...API_HEADERS, "x-api-key": apiKey },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3500,
      messages: [{ role: "user", content: SYNTHESIS_PROMPT(results) }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }
  const data = await response.json() as { content: Array<{ text?: string }> };
  const text = data.content.map((i) => i.text ?? "").join("");
  return parseJSON(text) as SynthesisResult;
}

async function callClaudePlanning(
  apiKey: string,
  imageBase64: string,
  context: AuditContext
): Promise<AuditPlan> {
  if (!apiKey.trim()) {
    throw new Error("API key is empty");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { ...API_HEADERS, "x-api-key": apiKey },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: PLANNING_PROMPT,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } },
          { 
            type: "text", 
            text: `Plan an audit for this design. Consider: ${context.productType || "General product"}, Target: ${context.targetAudience || "General users"}, Goal: ${context.userGoal || "General task"}, Stage: ${context.projectStage || "Not specified"}` 
          },
        ],
      }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }
  const data = await response.json() as { content: Array<{ text?: string }> };
  const text = data.content.map((i) => i.text ?? "").join("");
  return parseJSON(text) as AuditPlan;
}

function buildAgentInstructions(plan: AuditPlan, agentId: string): string {
  const instructions = plan.agent_instructions[agentId as keyof typeof plan.agent_instructions];
  if (!instructions) return "";
  
  let block = `\n\nAUDIT PLAN — YOUR FOCUS FOR THIS SESSION:\n`;
  block += `- Priority level: ${instructions.priority.toUpperCase()}\n`;
  block += `- Key areas to focus on: ${instructions.focus_areas.join(", ")}\n`;
  if (instructions.skip_notes) {
    block += `- What to deprioritize: ${instructions.skip_notes}\n`;
  }
  return block;
}

figma.showUI(__html__, { width: 480, height: 640 });

// Send stored API key to UI on startup
figma.clientStorage.getAsync("ux-audit-api-key").then((apiKey: string | undefined) => {
  figma.ui.postMessage({ type: "api-key", apiKey: apiKey !== undefined ? apiKey : "" });
});

figma.ui.onmessage = async (msg: PluginMessage) => {

  // UI requests to persist API key
  if (msg.type === "save-api-key") {
    await figma.clientStorage.setAsync("ux-audit-api-key", msg.apiKey);
    return;
  }

  // UI requests export of current selection
  if (msg.type === "request-export") {
    const selection = figma.currentPage.selection[0];

    if (!selection) {
      figma.ui.postMessage({ type: "no-selection" });
      return;
    }

    const imageData = await selection.exportAsync({
      format: "PNG",
      scale: 2,
      constraint: { type: "SCALE", value: 2 },
    });

    figma.ui.postMessage({
      type: "export-ready",
      imageData,
      frameName: selection.name,
      frameWidth: selection.width,
      frameHeight: selection.height,
    });
  }

  // UI sends completed audit results — build report frame
  if (msg.type === "build-report") {
    try {
      await buildReportFrame(msg.synthesis, msg.agentResults, msg.frameName, msg.context);
      figma.ui.postMessage({ type: "report-built" });
    } catch (e) {
      figma.ui.postMessage({
        type: "report-error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // UI requests to run audit (API calls happen here in code.ts, not in UI)
  if (msg.type === "run-audit") {
    try {
      figma.ui.postMessage({ type: "audit-started" });

      const { apiKey, agentIds, imageBase64, context } = msg;
      const results: AgentResult[] = [];
      let plan: AuditPlan | null = null;

      // Phase 1: Planning (fallback gracefully if fails)
      try {
        plan = await callClaudePlanning(apiKey, imageBase64, context);
        figma.ui.postMessage({ type: "planning-result", plan });
      } catch (planErr) {
        console.error("Planning failed, continuing with default audit:", planErr);
        figma.ui.postMessage({ type: "planning-result", plan: null });
      }

      // Phase 2: Run agents in batches of 2 (with plan instructions if available)
      const activeAgents = AGENTS.filter((a) => agentIds.includes(a.id));
      for (let i = 0; i < activeAgents.length; i += 2) {
        const batch = activeAgents.slice(i, i + 2);
        const batchPromises = batch.map(async (agent) => {
          try {
            const contextBlock = buildContextBlock(context);
            let systemPrompt = agent.persona + contextBlock;
            
            // Inject plan instructions if planning succeeded
            if (plan) {
              const planInstructions = buildAgentInstructions(plan, agent.id);
              systemPrompt += planInstructions;
            }
            
            const result = await callClaude(apiKey, systemPrompt, imageBase64);
            figma.ui.postMessage({ type: "agent-result", agentId: agent.id, result });
            return result;
          } catch (err) {
            const errResult: AgentResult = {
              agent: agent.id,
              persona: agent.name,
              score: 0,
              summary: `Failed: ${(err as Error).message}`,
              findings: [],
              error: (err as Error).message,
            };
            figma.ui.postMessage({ type: "agent-result", agentId: agent.id, result: errResult });
            return errResult;
          }
        });
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        if (i + 2 < activeAgents.length) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      // Phase 3: Run synthesis
      try {
        const synthResult = await callClaudeSynthesis(apiKey, results);
        figma.ui.postMessage({ type: "synthesis-result", result: synthResult });
      } catch (err) {
        figma.ui.postMessage({
          type: "audit-error",
          message: `Synthesis failed: ${(err as Error).message}`,
        });
      }
    } catch (err) {
      figma.ui.postMessage({
        type: "audit-error",
        message: (err as Error).message,
      });
    }
  }
};
