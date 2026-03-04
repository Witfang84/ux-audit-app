import { useState, useEffect } from "react";
import { AGENTS, buildContextBlock, SYNTHESIS_PROMPT } from "./agents";
import type { AgentResult, SynthesisResult, AuditContext } from "./types";

const MODEL = "claude-sonnet-4-20250514";
const API_HEADERS = {
  "Content-Type": "application/json",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function parseJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  imageBase64: string
): Promise<AgentResult> {
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  app: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "#0F0F0F",
    color: "#E8E0D0",
    minHeight: "100vh",
    padding: 20,
    boxSizing: "border-box" as const,
  },
  label: {
    fontSize: 10,
    letterSpacing: "1.5px",
    color: "#888",
    marginBottom: 8,
    display: "block" as const,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: 4,
    color: "#E8E0D0",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  btn: {
    width: "100%",
    padding: "12px 16px",
    background: "#E8E0D0",
    color: "#0F0F0F",
    border: "none",
    borderRadius: 4,
    fontSize: 11,
    letterSpacing: "1.5px",
    fontFamily: "inherit",
    cursor: "pointer",
    fontWeight: "bold" as const,
  },
  btnOutline: {
    width: "100%",
    padding: "12px 16px",
    background: "transparent",
    color: "#E8E0D0",
    border: "1px solid #333",
    borderRadius: 4,
    fontSize: 11,
    letterSpacing: "1.5px",
    fontFamily: "inherit",
    cursor: "pointer",
  },
};

type Phase = "key" | "select" | "running" | "results";
type BuildStatus = "idle" | "building" | "done" | "error";

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState<Phase>("key");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("ux-audit-api-key") ?? "");

  const [frameName, setFrameName] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");

  const [context, setContext] = useState<AuditContext>({
    productType: "", targetAudience: "", userGoal: "", projectStage: "", additionalNotes: "",
  });
  const [contextExpanded, setContextExpanded] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENTS.map((a) => a.id));

  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [agentResults, setAgentResults] = useState<Record<string, AgentResult>>({});
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>("idle");
  const [error, setError] = useState("");

  // Listen for messages from code.ts
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === "export-ready") {
        const base64 = uint8ToBase64(new Uint8Array(msg.imageData));
        setImageBase64(base64);
        setFrameName(msg.frameName);
        setThumbUrl(`data:image/png;base64,${base64}`);
        setError("");
        setPhase("select");
      }
      if (msg.type === "no-selection") {
        setError("No frame selected. Select a frame in Figma first.");
      }
      if (msg.type === "report-built") {
        setBuildStatus("done");
      }
      if (msg.type === "report-error") {
        setBuildStatus("error");
        setError(msg.message);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const saveApiKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("ux-audit-api-key", apiKey.trim());
    setPhase("select");
  };

  const requestExport = () => {
    setError("");
    parent.postMessage({ pluginMessage: { type: "request-export" } }, "*");
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const runAudit = async () => {
    if (!imageBase64) { setError("Export a frame first."); return; }
    if (!selectedAgents.length) { setError("Select at least one agent."); return; }

    setPhase("running");
    setAgentStatuses({});
    setAgentResults({});
    setSynthesis(null);
    setError("");

    const initialStatuses: Record<string, string> = {};
    AGENTS.forEach((a) => { initialStatuses[a.id] = "pending"; });
    setAgentStatuses(initialStatuses);

    const activeAgents = AGENTS.filter((a) => selectedAgents.includes(a.id));
    const results: AgentResult[] = [];

    const runAgent = async (agent: typeof AGENTS[0]): Promise<AgentResult> => {
      setAgentStatuses((prev) => ({ ...prev, [agent.id]: "running" }));
      try {
        const result = await callClaude(apiKey, agent.persona + buildContextBlock(context), imageBase64);
        setAgentResults((prev) => ({ ...prev, [agent.id]: result }));
        setAgentStatuses((prev) => ({ ...prev, [agent.id]: "done" }));
        return result;
      } catch (err) {
        const errResult: AgentResult = {
          agent: agent.id, persona: agent.name, score: 0,
          summary: `Failed: ${(err as Error).message}`, findings: [],
          error: (err as Error).message,
        };
        setAgentResults((prev) => ({ ...prev, [agent.id]: errResult }));
        setAgentStatuses((prev) => ({ ...prev, [agent.id]: "error" }));
        return errResult;
      }
    };

    // Run in batches of 2 (API rate limit)
    for (let i = 0; i < activeAgents.length; i += 2) {
      const batch = activeAgents.slice(i, i + 2);
      const batchResults = await Promise.all(batch.map(runAgent));
      results.push(...batchResults);
      if (i + 2 < activeAgents.length) await new Promise((r) => setTimeout(r, 1000));
    }

    // Synthesis
    setAgentStatuses((prev) => ({ ...prev, synthesis: "running" }));
    try {
      const synthResult = await callClaudeSynthesis(apiKey, results);
      setSynthesis(synthResult);
      setAgentStatuses((prev) => ({ ...prev, synthesis: "done" }));
    } catch (err) {
      setAgentStatuses((prev) => ({ ...prev, synthesis: "error" }));
      setSynthesis({
        overall_score: 0, grade: "—",
        executive_summary: "Synthesis failed. See individual agent results.",
        top_priorities: [], merged_findings: [], strengths: [],
        critical_count: 0, high_count: 0, medium_count: 0, low_count: 0,
      });
    }

    setPhase("results");
  };

  const buildReport = () => {
    if (!synthesis) return;
    setBuildStatus("building");
    parent.postMessage({
      pluginMessage: {
        type: "build-report",
        synthesis,
        agentResults: Object.values(agentResults),
        frameName,
        context,
      },
    }, "*");
  };

  if (phase === "key") return <ApiKeyView apiKey={apiKey} setApiKey={setApiKey} onSave={saveApiKey} />;
  if (phase === "select") return (
    <SelectView
      frameName={frameName} thumbUrl={thumbUrl}
      context={context} setContext={setContext}
      contextExpanded={contextExpanded} setContextExpanded={setContextExpanded}
      selectedAgents={selectedAgents} toggleAgent={toggleAgent}
      setSelectedAgents={setSelectedAgents}
      onExport={requestExport} onRun={runAudit} error={error}
    />
  );
  if (phase === "running") return <RunningView agentStatuses={agentStatuses} />;
  if (phase === "results") return (
    <ResultsView
      synthesis={synthesis} agentResults={Object.values(agentResults)}
      buildStatus={buildStatus} onBuild={buildReport}
      onReset={() => { setPhase("select"); setBuildStatus("idle"); }}
      error={error}
    />
  );
  return null;
}

// ─── ApiKeyView ───────────────────────────────────────────────────────────────

function ApiKeyView({ apiKey, setApiKey, onSave }: {
  apiKey: string; setApiKey: (v: string) => void; onSave: () => void;
}) {
  return (
    <div style={S.app}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: "#888", marginBottom: 4 }}>UX AUDIT</div>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>Setup</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>ANTHROPIC API KEY</label>
        <input
          type="password" value={apiKey} autoFocus
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          placeholder="sk-ant-..."
          style={S.input}
        />
        <div style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
          Stored in localStorage. Sent only to Anthropic API.
        </div>
      </div>
      <button style={{ ...S.btn, opacity: apiKey.trim() ? 1 : 0.4 }} onClick={onSave} disabled={!apiKey.trim()}>
        CONTINUE →
      </button>
    </div>
  );
}

// ─── SelectView ───────────────────────────────────────────────────────────────

function SelectView({ frameName, thumbUrl, context, setContext, contextExpanded, setContextExpanded,
  selectedAgents, toggleAgent, setSelectedAgents, onExport, onRun, error }: {
  frameName: string; thumbUrl: string;
  context: AuditContext; setContext: React.Dispatch<React.SetStateAction<AuditContext>>;
  contextExpanded: boolean; setContextExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAgents: string[]; toggleAgent: (id: string) => void;
  setSelectedAgents: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void; onRun: () => void; error: string;
}) {
  const filledCount = Object.values(context).filter(Boolean).length;
  const canRun = !!thumbUrl && selectedAgents.length > 0;

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "2px", color: "#888" }}>UX AUDIT</div>
          <div style={{ fontSize: 16, fontWeight: "bold" }}>Figma Plugin</div>
        </div>
        <button onClick={onExport}
          style={{ ...S.btnOutline, width: "auto", padding: "8px 14px", fontSize: 10 }}>
          {frameName ? "↺ RESELECT" : "EXPORT FRAME"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#2A0F0F", border: "1px solid #FF4444", borderRadius: 4, padding: "10px 12px", fontSize: 11, color: "#FF8888", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Frame thumbnail */}
      {thumbUrl ? (
        <div style={{ marginBottom: 20 }}>
          <label style={S.label}>SELECTED FRAME</label>
          <div style={{ border: "1px solid #2A2A2A", borderRadius: 4, overflow: "hidden", background: "#1A1A1A" }}>
            <img src={thumbUrl} alt={frameName} style={{ width: "100%", display: "block", maxHeight: 140, objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 5 }}>{frameName}</div>
        </div>
      ) : (
        <div onClick={onExport} style={{
          border: "1px dashed #2A2A2A", borderRadius: 4, padding: "28px 16px",
          textAlign: "center", cursor: "pointer", marginBottom: 20, color: "#444", fontSize: 12,
        }}>
          Select a frame in Figma, then click Export Frame
        </div>
      )}

      {/* Context (collapsible) */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setContextExpanded((p) => !p)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#111", border: "1px solid #222", borderRadius: contextExpanded ? "4px 4px 0 0" : 4,
          padding: "10px 14px", color: filledCount > 0 ? "#E8E0D0" : "#666",
          cursor: "pointer", fontFamily: "inherit", fontSize: 10, letterSpacing: "1.5px",
        }}>
          <span>{filledCount > 0 ? `✓ CONTEXT (${filledCount}/5)` : "＋ ADD CONTEXT (recommended)"}</span>
          <span style={{ fontSize: 9 }}>{contextExpanded ? "▲" : "▼"}</span>
        </button>
        {contextExpanded && (
          <div style={{ background: "#111", border: "1px solid #222", borderTop: "none", borderRadius: "0 0 4px 4px", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Product Type */}
            <div>
              <label style={S.label}>PRODUCT TYPE</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["Landing page", "Onboarding", "Dashboard", "Checkout", "Mobile app", "Settings", "Form", "Other"].map((opt) => (
                  <button key={opt} onClick={() => setContext((p) => ({ ...p, productType: p.productType === opt ? "" : opt }))}
                    style={{
                      padding: "5px 10px", fontSize: 10, fontFamily: "inherit", cursor: "pointer", borderRadius: 3,
                      background: context.productType === opt ? "#E8E0D022" : "transparent",
                      border: `1px solid ${context.productType === opt ? "#E8E0D066" : "#2A2A2A"}`,
                      color: context.productType === opt ? "#E8E0D0" : "#777",
                    }}>{opt}</button>
                ))}
              </div>
            </div>
            {/* Target Audience */}
            <div>
              <label style={S.label}>TARGET AUDIENCE</label>
              <input style={S.input} type="text" value={context.targetAudience}
                placeholder='e.g. "seniors 60+", "B2B developers"'
                onChange={(e) => setContext((p) => ({ ...p, targetAudience: e.target.value }))} />
            </div>
            {/* User Goal */}
            <div>
              <label style={S.label}>USER'S GOAL ON THIS SCREEN</label>
              <input style={S.input} type="text" value={context.userGoal}
                placeholder='e.g. "Complete registration"'
                onChange={(e) => setContext((p) => ({ ...p, userGoal: e.target.value }))} />
            </div>
            {/* Project Stage */}
            <div>
              <label style={S.label}>PROJECT STAGE</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["Lo-fi", "Mid-fi", "Hi-fi", "Prototype", "Live"].map((opt) => (
                  <button key={opt} onClick={() => setContext((p) => ({ ...p, projectStage: p.projectStage === opt ? "" : opt }))}
                    style={{
                      padding: "5px 10px", fontSize: 10, fontFamily: "inherit", cursor: "pointer", borderRadius: 3,
                      background: context.projectStage === opt ? "#E8E0D022" : "transparent",
                      border: `1px solid ${context.projectStage === opt ? "#E8E0D066" : "#2A2A2A"}`,
                      color: context.projectStage === opt ? "#E8E0D0" : "#777",
                    }}>{opt}</button>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div>
              <label style={S.label}>ADDITIONAL NOTES</label>
              <textarea style={{ ...S.input, resize: "vertical", lineHeight: "1.5" }} rows={2}
                value={context.additionalNotes} placeholder="Constraints, known issues..."
                onChange={(e) => setContext((p) => ({ ...p, additionalNotes: e.target.value }))} />
            </div>
          </div>
        )}
      </div>

      {/* Agent Selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ ...S.label, marginBottom: 0 }}>AGENTS</label>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSelectedAgents(AGENTS.map((a) => a.id))}
              style={{ background: "none", border: "none", color: "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px" }}>ALL</button>
            <button onClick={() => setSelectedAgents([])}
              style={{ background: "none", border: "none", color: "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px" }}>NONE</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {AGENTS.map((a) => {
            const sel = selectedAgents.includes(a.id);
            return (
              <button key={a.id} onClick={() => toggleAgent(a.id)} style={{
                flex: 1, padding: "10px 4px", textAlign: "center", cursor: "pointer", borderRadius: 4,
                background: sel ? "#E8E0D0" : "transparent",
                border: `1px solid ${sel ? "#E8E0D0" : "#2A2A2A"}`,
                fontFamily: "inherit",
              }}>
                <div style={{ fontSize: 14, marginBottom: 4, color: sel ? "#0F0F0F" : "#555" }}>{a.icon}</div>
                <div style={{ fontSize: 9, letterSpacing: "0.5px", color: sel ? "#0F0F0F" : "#666", lineHeight: 1.3 }}>
                  {a.name.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button style={{ ...S.btn, opacity: canRun ? 1 : 0.4 }} onClick={onRun} disabled={!canRun}>
        RUN AUDIT →
      </button>
    </div>
  );
}

// ─── RunningView ──────────────────────────────────────────────────────────────

function RunningView({ agentStatuses }: { agentStatuses: Record<string, string> }) {
  const icon = (s: string) => s === "done" ? "✓" : s === "error" ? "✗" : s === "running" ? "…" : "·";
  const color = (s: string) => s === "done" ? "#44AA88" : s === "error" ? "#FF4444" : s === "running" ? "#E8E0D0" : "#444";

  return (
    <div style={S.app}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: "#888", marginBottom: 4 }}>ANALYZING</div>
        <div style={{ fontSize: 16, fontWeight: "bold" }}>Running agents...</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {AGENTS.map((a) => {
          const s = agentStatuses[a.id] ?? "pending";
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#1A1A1A", borderRadius: 6 }}>
              <span style={{ fontSize: 16, color: color(s), width: 16, textAlign: "center" }}>{icon(s)}</span>
              <div style={{ fontSize: 12, color: s === "running" ? "#E8E0D0" : "#888" }}>{a.name}</div>
            </div>
          );
        })}
        {/* Synthesis row */}
        {(() => {
          const s = agentStatuses["synthesis"] ?? "pending";
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#1A1A1A", borderRadius: 6, borderLeft: "2px solid #333" }}>
              <span style={{ fontSize: 16, color: color(s), width: 16, textAlign: "center" }}>{icon(s)}</span>
              <div style={{ fontSize: 12, color: s === "running" ? "#E8E0D0" : "#888" }}>Synthesis Oracle</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── ResultsView ──────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  critical: "#FF4444", high: "#FF8C00", medium: "#FFB800", low: "#888888",
};
const GRADE_COLOR: Record<string, string> = {
  "A+": "#44DD44", A: "#44DD44", "B+": "#88CC44", B: "#88CC44",
  "C+": "#FFB800", C: "#FFB800", D: "#FF8C00", F: "#FF4444",
};

function ResultsView({ synthesis, buildStatus, onBuild, onReset, error }: {
  synthesis: SynthesisResult | null;
  agentResults: AgentResult[];
  buildStatus: BuildStatus;
  onBuild: () => void;
  onReset: () => void;
  error: string;
}) {
  if (!synthesis) return null;
  const gColor = GRADE_COLOR[synthesis.grade] ?? "#888";

  return (
    <div style={S.app}>
      {/* Grade + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: "#1A1A1A", borderRadius: 8 }}>
        <div style={{
          width: 56, height: 56, background: gColor, borderRadius: 8, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: "bold", color: "#0F0F0F",
        }}>
          {synthesis.grade}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {synthesis.overall_score.toFixed(1)}<span style={{ fontSize: 13, color: "#888" }}>/10</span>
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 3, letterSpacing: "0.5px" }}>
            {synthesis.critical_count} CRIT · {synthesis.high_count} HIGH · {synthesis.medium_count} MED · {synthesis.low_count} LOW
          </div>
        </div>
      </div>

      {/* Findings */}
      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>FINDINGS</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {synthesis.merged_findings.map((f, i) => (
            <div key={i} style={{
              padding: "10px 12px", background: "#1A1A1A", borderRadius: 6,
              borderLeft: `3px solid ${SEV_COLOR[f.severity] ?? "#888"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "#E8E0D0", lineHeight: 1.3 }}>{f.title}</div>
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.5px",
                  background: `${SEV_COLOR[f.severity]}22`, color: SEV_COLOR[f.severity],
                  whiteSpace: "nowrap" as const, flexShrink: 0,
                }}>
                  {f.severity.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>{f.description}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "#2A0F0F", border: "1px solid #FF4444", borderRadius: 4, padding: "10px 12px", fontSize: 11, color: "#FF8888", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Build button */}
      <button
        style={{
          ...S.btn, marginBottom: 10,
          opacity: buildStatus === "building" ? 0.6 : 1,
          background: buildStatus === "done" ? "#44AA88" : "#E8E0D0",
        }}
        onClick={onBuild}
        disabled={buildStatus === "building" || buildStatus === "done"}
      >
        {buildStatus === "idle" && "BUILD REPORT FRAME IN FIGMA →"}
        {buildStatus === "building" && "BUILDING..."}
        {buildStatus === "done" && "✓ REPORT BUILT IN FIGMA"}
        {buildStatus === "error" && "RETRY BUILD →"}
      </button>

      <button style={S.btnOutline} onClick={onReset}>← NEW AUDIT</button>
    </div>
  );
}
