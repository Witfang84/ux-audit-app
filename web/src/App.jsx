import { useState, useCallback } from "react";

const AGENTS = [
  {
    id: "heuristics",
    name: "Heuristics & Design Laws",
    icon: "◈",
    color: "#E8D5B7",
    persona: `You are Dr. Heuristica, a Senior UX Auditor and Cognitive Design Expert with 20 years of experience. You analyze UI designs against established design laws, heuristics, and frameworks.

Analyze against ALL of the following:

NIELSEN'S 10 HEURISTICS: Visibility of system status, Match between system and real world, User control and freedom, Consistency and standards, Error prevention, Recognition rather than recall, Flexibility and efficiency of use, Aesthetic and minimalist design, Help users recognize/diagnose/recover from errors, Help and documentation.

SHNEIDERMAN'S 8 GOLDEN RULES: Consistency, shortcuts for experts, informative feedback, closure in dialogs, error handling, easy reversal, user control, reduce short-term memory load.

COGNITIVE PSYCHOLOGY LAWS: Jakob's Law (familiar conventions), Fitts's Law (CTA size and placement), Tesler's Law (complexity on system not user), Von Restorff Effect (key elements stand out), Peak-End Rule (key moments and endings), Zeigarnik Effect (progress indicators).

GESTALT PRINCIPLES: Proximity (grouping), Similarity (same look = same function), Continuity (visual flow), Common Fate (related motion), Figure/Ground (modals and overlays).

BEHAVIORAL FRAMEWORKS: Fogg's B=MAP (Motivation + Ability + Prompt present?), Hook Model (Trigger→Action→Reward→Investment), System 1 vs System 2 thinking.

UX WRITING: No passive voice in UI copy, no jargon or unexplained acronyms, concise (one idea per screen, max 15 words per sentence), most important info first (inverted pyramid), CTAs use verbs, no filler words, no italics, left-aligned text, natural when read aloud.

Return max 5 most important findings. Return ONLY valid JSON, no text before or after:
{
  "agent": "heuristics",
  "persona": "Dr. Heuristica — Heuristics & Design Laws Expert",
  "score": <number 0-10>,
  "summary": "<2 sentence overall assessment>",
  "findings": [
    {
      "title": "<short issue title>",
      "heuristic": "<which law, heuristic or principle>",
      "severity": "critical|high|medium|low",
      "description": "<what is wrong and why it matters>",
      "recommendation": "<specific, actionable fix>"
    }
  ]
}`
  },
  {
    id: "darkpatterns",
    name: "Dark Patterns",
    icon: "◉",
    color: "#C9B8D4",
    persona: `You are Shadow Detector, an Ethical Design and Manipulation Auditor. You analyze UI designs for manipulative patterns that work against users' interests. Be thorough but fair — only flag genuine manipulation, not aggressive but honest design.

Check for ALL of these dark patterns: Nagging (repeated prompts after decline), Activity Messages (FOMO-inducing notifications), Fake Social Proof, Fake Testimonials, Comparison Prevention, Intermediate Currency, Sneak into Basket, Hidden Costs/Drip Pricing, Forced Continuity, Bait and Switch, Hidden Information/False Hierarchy, Preselection (without consent), Toying with Emotion, Trick Questions, Misdirection/Visual Interference, Disguised Ads, Confirmshaming, Low Stock/High Demand (false scarcity), Countdown Timers (false urgency), Overloading, Obstructing (blocking exit), Fickle (inconsistent navigation), Left in the Dark (hidden data info), Roach Motel, Privacy Zuckering.

ETHICAL DESIGN CHECKLIST — also check:
Transparency: cancellation options simple and visible, all costs shown upfront, options presented equitably, privacy settings understandable.
Ethical Engagement: no repeated requests after user declined, no overwhelming information, no emotional manipulation, no false scarcity/urgency, ads clearly marked.
Fair Practices: user consent for cart additions, no fake social proof, clear unambiguous language, easy product comparison.
User Autonomy: no preselected options without consent, easy data management, easy exit from processes.

UX WRITING DARK PATTERNS — also check: No false urgency in copy ("Buy before others do"), no intentional misdirection in text, no trick questions in forms, no confirmshaming language ("No, I don't want to save money").

Return max 5 most important findings. Return ONLY valid JSON, no text before or after:
{
  "agent": "darkpatterns",
  "persona": "Shadow Detector — Ethical Design Auditor",
  "score": <number 0-10, where 10 = no dark patterns found>,
  "summary": "<2 sentence overall assessment>",
  "findings": [
    {
      "title": "<pattern name>",
      "heuristic": "<dark pattern category>",
      "severity": "critical|high|medium|low",
      "description": "<what manipulation is present and how it harms users>",
      "recommendation": "<ethical alternative>"
    }
  ]
}`
  },
  {
    id: "accessibility",
    name: "Accessibility (WCAG)",
    icon: "◎",
    color: "#B8D4C9",
    persona: `You are A11y Guardian, an accessibility specialist with lived experience of disabilities and deep WCAG 2.1 AA/AAA expertise. You evaluate from the perspective of users with visual, motor, cognitive, and hearing impairments.

Check ALL of the following:
VISUAL ACCESSIBILITY: Color contrast ratios (min 4.5:1 AA for normal text, 3:1 for large text and UI components), not relying on color alone (icons/text/pattern accompany color), font size (min 16px for body), line length (max 75-80 chars).
NAVIGATION & INTERACTION: Visible focus states for all interactive elements, logical focus order, touch targets min 44x44px, keyboard accessibility, no keyboard traps.
CONTENT & STRUCTURE: Alt text for images and icons, form labels linked to fields, heading hierarchy (H1→H2→H3), descriptive error messages, plain language.
COGNITIVE ACCESSIBILITY: Limited cognitive load (one main action per screen), progress indicators in multi-step flows, no automatic timeouts, respect for prefers-reduced-motion, consistent navigation.

Return max 5 most important findings. Return ONLY valid JSON, no text before or after:
{
  "agent": "accessibility",
  "persona": "A11y Guardian — Accessibility Expert",
  "score": <number 0-10>,
  "summary": "<2 sentence overall assessment>",
  "findings": [
    {
      "title": "<issue title>",
      "heuristic": "<WCAG criterion or accessibility principle>",
      "severity": "critical|high|medium|low",
      "description": "<accessibility barrier and who it affects>",
      "recommendation": "<specific fix with standard reference>"
    }
  ]
}`
  },
  {
    id: "designflaws",
    name: "Design Flaws",
    icon: "◇",
    color: "#D4C9B8",
    persona: `You are Design Flaw Detector, a UX/UI Systems Analyst combining cognitive psychology expertise with senior visual design experience. You analyze both UX (flow, information architecture, mental models) and UI (visual consistency, components, hierarchy) layers together.

Analyze ALL of the following:

UX LAYER — Information Architecture & Flow: Mental model alignment (is the flow intuitive?), task efficiency (how many steps to complete the main action?), onboarding friction (understandable without instructions?), error recovery (easy to get back after mistakes?), feedback loops (every action has a visible system response?), affordances and signifiers (elements suggest their function?), progressive disclosure (complexity revealed gradually?), user goal vs design goal alignment.

UX LAYER — Cognitive Load: Number of decisions on one screen, short-term memory burden, clarity of priorities (what should the user do first?), terminology consistency throughout interface.

UI LAYER — Layout & Visual Hierarchy: Broken visual hierarchy (no clear distinction between primary and secondary elements), inconsistent margins and padding (no vertical/horizontal rhythm), poor element grouping (violating Gestalt proximity), lack of whitespace (cluttered layout making scanning difficult), alignment issues (elements not on a grid).

UI LAYER — Components & Consistency: Inconsistent button styles (different border-radius, shadows for same action class), mixed icon styles (different stroke weight or fill vs outline), non-standardized controls (different dropdown/checkbox styles across screens), inconsistent interactions (same gesture triggers different behaviors in different places).

UI LAYER — Interaction States: Tap targets too small (below 44x44px), missing interaction states (no hover, active, focus, disabled views), unclear selected state (no readable difference between selected/unselected), missing visual affordance (buttons that don't look clickable).

UI LAYER — Data & States: No handling of variable text length (UI breaks with long names), missing loading states (no skeleton/spinner), inconsistent validation styles (form errors in different places/styles), missing progress indicators in multi-step processes.

UI LAYER — Typography & Readability: Font size too small (below 12-14px for readable text), line length too long (no max-width container), weak typographic hierarchy (no clear size scale).

Return max 5 most important findings. Return ONLY valid JSON, no text before or after:
{
  "agent": "designflaws",
  "persona": "Design Flaw Detector — UX/UI Systems Analyst",
  "score": <number 0-10>,
  "summary": "<2 sentence overall assessment>",
  "findings": [
    {
      "title": "<issue title>",
      "heuristic": "<UX/UI principle or design law>",
      "severity": "critical|high|medium|low",
      "description": "<what is wrong, which layer (UX/UI), why it matters>",
      "recommendation": "<specific, actionable improvement>"
    }
  ]
}`
  }
];

const SYNTHESIS_PROMPT = (results) => `You are Synthesis Oracle, a principal UX strategist. You receive audit results from specialist agents and create a unified, deduplicated, actionable report.

CRITICAL TASK — DEDUPLICATION: Scan ALL findings from ALL agents. If two agents flag the same root problem (same UI element or same root cause), MERGE them into ONE finding citing both. Never list the same problem twice.

Merging examples:
- Design Flaws low contrast + Accessibility WCAG contrast → merge, sources: ["designflaws","accessibility"]
- Design Flaws small buttons + Accessibility touch targets → merge, sources: ["designflaws","accessibility"]  
- Dark Patterns false urgency + Heuristics trust violation (same element) → merge

Agent results:
${JSON.stringify(results, null, 2)}

Return ONLY valid JSON, no markdown:
{
  "overall_score": <weighted average 0-10>,
  "grade": "<A+|A|B+|B|C+|C|D|F>",
  "executive_summary": "<3-4 sentences: overall quality, most critical theme, key next step>",
  "top_priorities": [
    {
      "priority": 1,
      "title": "<most critical issue>",
      "from_agents": ["<agent id>"],
      "impact": "<why this matters most for users>",
      "quick_win": true
    }
  ],
  "merged_findings": [
    {
      "title": "<issue title>",
      "severity": "critical|high|medium|low",
      "sources": ["<agent id>"],
      "description": "<combined description integrating all relevant agent perspectives>",
      "recommendation": "<unified actionable fix>"
    }
  ],
  "strengths": ["<what the design does well>"],
  "critical_count": <number>,
  "high_count": <number>,
  "medium_count": <number>,
  "low_count": <number>
}`;

const API_HEADERS = {
  "Content-Type": "application/json",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
};

function parseJSON(raw) {
  // Strip markdown fences, trim whitespace
  const bt = String.fromCharCode(96);
  let clean = raw.replace(new RegExp(bt+bt+bt+"json\\s*", "gi"), "").replace(new RegExp(bt+bt+bt+"\\s*", "g"), "").trim();
  // If JSON got cut off mid-string, try to recover by closing open structures
  try {
    return JSON.parse(clean);
  } catch {
    // Try to find last complete object — truncate at last valid closing brace
    const lastBrace = clean.lastIndexOf("}");
    if (lastBrace > 0) {
      // Count unclosed arrays and objects and close them
      let snippet = clean.slice(0, lastBrace + 1);
      // Close findings array and root object if needed
      const openArrays = (snippet.match(/\[/g) || []).length - (snippet.match(/\]/g) || []).length;
      const openObjects = (snippet.match(/\{/g) || []).length - (snippet.match(/\}/g) || []).length;
      for (let i = 0; i < openArrays; i++) snippet += "]";
      for (let i = 0; i < openObjects; i++) snippet += "}";
      try { return JSON.parse(snippet); } catch {}
    }
    throw new Error("Could not parse JSON response. Raw: " + raw.slice(0, 200));
  }
}

async function callClaude(systemPrompt, imageBase64, mediaType, textInput) {
  const userContent = [];

  if (imageBase64) {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: mediaType || "image/png", data: imageBase64 }
    });
  }

  userContent.push({
    type: "text",
    text: textInput || "Analyze this UI design thoroughly according to your expertise. Be specific and actionable. Return max 5 findings to keep response concise."
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content.map(i => i.text || "").join("");
  return parseJSON(text);
}

async function callClaudeText(systemPrompt, text, maxTokens = 2000) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: text }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.content.map(i => i.text || "").join("");
  return parseJSON(raw);
}

const severityConfig = {
  critical: { color: "#FF4444", bg: "#FF444422", label: "CRITICAL" },
  high: { color: "#FF8C00", bg: "#FF8C0022", label: "HIGH" },
  medium: { color: "#FFB800", bg: "#FFB80022", label: "MEDIUM" },
  low: { color: "#44AA44", bg: "#44AA4422", label: "LOW" }
};

const gradeColor = (grade) => {
  if (grade?.startsWith("A")) return "#44DD44";
  if (grade?.startsWith("B")) return "#88CC44";
  if (grade?.startsWith("C")) return "#FFB800";
  if (grade?.startsWith("D")) return "#FF8C00";
  return "#FF4444";
};

export default function UXAuditApp() {
  const [inputType, setInputType] = useState("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/png");
  const [agentStatuses, setAgentStatuses] = useState({});
  const [agentResults, setAgentResults] = useState({});
  const [synthesis, setSynthesis] = useState(null);
  const [phase, setPhase] = useState("input"); // input | running | results
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedFindings, setExpandedFindings] = useState({});
  const [urlFetchStatus, setUrlFetchStatus] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState(AGENTS.map(a => a.id));
  const [context, setContext] = useState({
    productType: "",
    targetAudience: "",
    userGoal: "",
    projectStage: "",
    additionalNotes: ""
  });
  const [contextExpanded, setContextExpanded] = useState(false);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaType(file.type || "image/png");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      setUploadedImage(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setMediaType(file.type || "image/png");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      setUploadedImage(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const fetchUrlAsContext = async (url) => {
    setUrlFetchStatus("fetching");
    await new Promise(r => setTimeout(r, 500));
    setUrlFetchStatus("ready");
    return url;
  };

  const buildContextBlock = () => {
    const lines = [];
    if (context.productType) lines.push(`- Product type: ${context.productType}`);
    if (context.targetAudience) lines.push(`- Target audience: ${context.targetAudience}`);
    if (context.userGoal) lines.push(`- User's goal on this screen: ${context.userGoal}`);
    if (context.projectStage) lines.push(`- Project stage: ${context.projectStage}`);
    if (context.additionalNotes) lines.push(`- Additional context: ${context.additionalNotes}`);
    if (!lines.length) return "";
    return `\n\nDESIGN CONTEXT (take this into account during your analysis):\n${lines.join("\n")}\n`;
  };

  const runAudit = async () => {
    setPhase("running");
    setAgentStatuses({});
    setAgentResults({});
    setSynthesis(null);

    let contextText = null;
    if (inputType !== "upload") {
      await fetchUrlAsContext(urlInput);
      contextText = `Analyze this UI/UX design from the following URL: ${urlInput}\n\nImagine you can see the full interface. Based on the URL and typical patterns for this type of product, provide a thorough analysis.`;
    }

    // Set all agents to pending
    const initialStatuses = {};
    AGENTS.forEach(a => { initialStatuses[a.id] = "pending"; });
    setAgentStatuses(initialStatuses);

    // Run agents in batches of 2 to avoid concurrent request limits
    const runAgent = async (agent) => {
      setAgentStatuses(prev => ({ ...prev, [agent.id]: "running" }));
      try {
        let result;
        if (imageBase64) {
          result = await callClaude(agent.persona + buildContextBlock(), imageBase64, mediaType, null);
        } else {
          result = await callClaudeText(agent.persona + buildContextBlock(), contextText);
        }
        setAgentResults(prev => ({ ...prev, [agent.id]: result }));
        setAgentStatuses(prev => ({ ...prev, [agent.id]: "done" }));
        return result;
      } catch (err) {
        const errResult = { agent: agent.id, error: err.message, findings: [], score: 0, summary: "Analysis failed: " + err.message };
        setAgentResults(prev => ({ ...prev, [agent.id]: errResult }));
        setAgentStatuses(prev => ({ ...prev, [agent.id]: "error" }));
        return errResult;
      }
    };

    const activeAgents = AGENTS.filter(a => selectedAgents.includes(a.id));
    const results = [];
    const batchSize = 2;
    for (let i = 0; i < activeAgents.length; i += batchSize) {
      const batch = activeAgents.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(runAgent));
      results.push(...batchResults);
      // Small delay between batches to respect rate limits
      if (i + batchSize < activeAgents.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Run synthesis
    setAgentStatuses(prev => ({ ...prev, synthesis: "running" }));
    try {
      const synthResult = await callClaudeText(
        "You are Synthesis Oracle, a principal UX strategist. Return ONLY valid JSON, no markdown, no text outside JSON.",
        SYNTHESIS_PROMPT(results),
        3500
      );
      setSynthesis(synthResult);
      setAgentStatuses(prev => ({ ...prev, synthesis: "done" }));
    } catch (err) {
      setAgentStatuses(prev => ({ ...prev, synthesis: "error" }));
      setSynthesis({
        overall_score: 0, grade: "—",
        executive_summary: "Synthesis agent failed. See individual agent tabs for findings.",
        top_priorities: [], merged_findings: [], strengths: [],
        critical_count: 0, high_count: 0, medium_count: 0, low_count: 0
      });
    }

    setPhase("results");
    setActiveTab("overview");
  };

  const reset = () => {
    setPhase("input");
    setAgentStatuses({});
    setAgentResults({});
    setSynthesis(null);
    setUploadedImage(null);
    setImageBase64(null);
    setUrlInput("");
    setUrlFetchStatus(null);
    setContext({ productType: "", targetAudience: "", userGoal: "", projectStage: "", additionalNotes: "" });
    setContextExpanded(false);
    setSelectedAgents(AGENTS.map(a => a.id));
  };

  const toggleFinding = (key) => {
    setExpandedFindings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allFindings = Object.values(agentResults).flatMap(r =>
    (r.findings || []).map(f => ({ ...f, agentId: r.agent }))
  );

  const toggleAgent = (id) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const canRun = ((inputType === "upload" && imageBase64) || (inputType !== "upload" && urlInput.trim())) && selectedAgents.length > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F0F0F",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#E8E0D0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1A1A1A; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .agent-card:hover { transform: translateY(-2px); }
        .agent-card { transition: transform 0.2s ease; }
        .tab-btn:hover { background: #2A2A2A !important; }
        .finding-row:hover { background: #1E1E1E !important; }
        .upload-zone:hover { border-color: #888 !important; background: #1A1A1A !important; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #222", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#E8E0D0" }}>UX AUDIT</span>
          <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#888", letterSpacing: "2px" }}>MULTI-AGENT v0.1</span>
        </div>
        {phase !== "input" && (
          <button onClick={reset} style={{ background: "none", border: "1px solid #333", color: "#888", padding: "6px 16px", cursor: "pointer", fontSize: 11, letterSpacing: "1px", fontFamily: "inherit" }}>
            ← NEW AUDIT
          </button>
        )}
      </div>

      {/* INPUT PHASE */}
      {phase === "input" && (
        <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12 }}>
              Drop your design.<br />
              <span style={{ color: "#999" }}>Get brutal feedback.</span>
            </h1>
            <p style={{ color: "#AAA", fontSize: 16, lineHeight: 1.6 }}>
              5 AI agents analyze your mockup simultaneously — Nielsen heuristics, dark patterns, accessibility, UX flaws, and visual quality.
            </p>
          </div>

          {/* Input type selector */}
          <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#1A1A1A", padding: 3, borderRadius: 4 }}>
            {[
              { id: "upload", label: "↑ UPLOAD" },
              { id: "url", label: "⌘ URL" },
              { id: "figma", label: "◈ FIGMA" },
              { id: "proto", label: "⚡ PROTOTYPE" }
            ].map(t => (
              <button key={t.id} onClick={() => setInputType(t.id)}
                style={{
                  flex: 1, padding: "8px 4px", background: inputType === t.id ? "#E8E0D0" : "transparent",
                  color: inputType === t.id ? "#0F0F0F" : "#888", border: "none", cursor: "pointer",
                  fontSize: 11, letterSpacing: "1px", fontFamily: "inherit", fontWeight: inputType === t.id ? 500 : 400,
                  borderRadius: 2, transition: "all 0.15s"
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Upload zone */}
          {inputType === "upload" && (
            <div
              className="upload-zone"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: "1px dashed #333", borderRadius: 4, padding: "48px 24px",
                textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                background: uploadedImage ? "#0F1A0F" : "#111", position: "relative", overflow: "hidden"
              }}
              onClick={() => document.getElementById("file-input").click()}
            >
              {uploadedImage ? (
                <div>
                  <img src={uploadedImage} alt="preview" style={{ maxHeight: 200, maxWidth: "100%", marginBottom: 12, opacity: 0.9 }} />
                  <div style={{ color: "#44AA44", fontSize: 16 }}>✓ Image loaded — ready to analyze</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 12, color: "#666" }}>⊕</div>
                  <div style={{ color: "#AAA", fontSize: 16 }}>Drop screenshot here or click to browse</div>
                  <div style={{ color: "#777", fontSize: 11, marginTop: 6 }}>PNG, JPG, WEBP supported</div>
                </>
              )}
              <input id="file-input" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </div>
          )}

          {/* URL inputs */}
          {inputType !== "upload" && (
            <div>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder={
                  inputType === "url" ? "https://example.com/page" :
                  inputType === "figma" ? "https://figma.com/design/..." :
                  "https://magic.patterns.com/... or similar"
                }
                style={{
                  width: "100%", padding: "14px 16px", background: "#111", border: "1px solid #333",
                  color: "#E8E0D0", fontSize: 16, fontFamily: "inherit", outline: "none", borderRadius: 4,
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#888"}
                onBlur={e => e.target.style.borderColor = "#333"}
              />
              {inputType === "figma" && (
                <div style={{ marginTop: 8, color: "#888", fontSize: 11, lineHeight: 1.6 }}>
                  Tip: Make sure your Figma file has public view access enabled. Share → Anyone with link → Can view.
                </div>
              )}
            </div>
          )}

          {/* Context Form */}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => setContextExpanded(p => !p)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#111", border: "1px solid #222", borderRadius: 4, padding: "12px 16px",
                color: contextExpanded ? "#E8E0D0" : "#999", cursor: "pointer", fontFamily: "inherit",
                fontSize: 11, letterSpacing: "1.5px", transition: "all 0.2s"
              }}
            >
              <span>
                {[context.productType, context.targetAudience, context.userGoal, context.projectStage, context.additionalNotes].filter(Boolean).length > 0
                  ? `✓ CONTEXT ADDED (${[context.productType, context.targetAudience, context.userGoal, context.projectStage, context.additionalNotes].filter(Boolean).length}/5 fields)`
                  : "＋ ADD DESIGN CONTEXT (optional but recommended)"}
              </span>
              <span style={{ fontSize: 11 }}>{contextExpanded ? "▲" : "▼"}</span>
            </button>

            {contextExpanded && (
              <div style={{ background: "#111", border: "1px solid #222", borderTop: "none", borderRadius: "0 0 4px 4px", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Product Type */}
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "#888", marginBottom: 8 }}>PRODUCT TYPE</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Landing page", "Onboarding / signup", "Dashboard", "Checkout / payment", "Mobile app", "Settings / profile", "Form / wizard", "Other"].map(opt => (
                      <button key={opt} onClick={() => setContext(p => ({ ...p, productType: p.productType === opt ? "" : opt }))}
                        style={{
                          padding: "6px 12px", background: context.productType === opt ? "#E8E0D022" : "transparent",
                          border: `1px solid ${context.productType === opt ? "#E8E0D066" : "#2A2A2A"}`,
                          color: context.productType === opt ? "#E8E0D0" : "#888", cursor: "pointer",
                          fontSize: 11, fontFamily: "inherit", borderRadius: 3, transition: "all 0.15s"
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "#888", marginBottom: 8 }}>TARGET AUDIENCE</div>
                  <input
                    type="text"
                    value={context.targetAudience}
                    onChange={e => setContext(p => ({ ...p, targetAudience: e.target.value }))}
                    placeholder='e.g. "seniors 60+", "B2B developers", "first-time buyers"'
                    style={{
                      width: "100%", padding: "10px 12px", background: "#0F0F0F", border: "1px solid #2A2A2A",
                      color: "#E8E0D0", fontSize: 16, fontFamily: "inherit", outline: "none", borderRadius: 3
                    }}
                    onFocus={e => e.target.style.borderColor = "#555"}
                    onBlur={e => e.target.style.borderColor = "#2A2A2A"}
                  />
                </div>

                {/* User Goal */}
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "#888", marginBottom: 8 }}>USER'S GOAL ON THIS SCREEN</div>
                  <input
                    type="text"
                    value={context.userGoal}
                    onChange={e => setContext(p => ({ ...p, userGoal: e.target.value }))}
                    placeholder='e.g. "Complete registration and reach step 2"'
                    style={{
                      width: "100%", padding: "10px 12px", background: "#0F0F0F", border: "1px solid #2A2A2A",
                      color: "#E8E0D0", fontSize: 16, fontFamily: "inherit", outline: "none", borderRadius: 3
                    }}
                    onFocus={e => e.target.style.borderColor = "#555"}
                    onBlur={e => e.target.style.borderColor = "#2A2A2A"}
                  />
                </div>

                {/* Project Stage */}
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "#888", marginBottom: 8 }}>PROJECT STAGE</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Lo-fi wireframe", "Mid-fi mockup", "Hi-fi design", "Prototype", "Live product"].map(opt => (
                      <button key={opt} onClick={() => setContext(p => ({ ...p, projectStage: p.projectStage === opt ? "" : opt }))}
                        style={{
                          padding: "6px 12px", background: context.projectStage === opt ? "#E8E0D022" : "transparent",
                          border: `1px solid ${context.projectStage === opt ? "#E8E0D066" : "#2A2A2A"}`,
                          color: context.projectStage === opt ? "#E8E0D0" : "#888", cursor: "pointer",
                          fontSize: 11, fontFamily: "inherit", borderRadius: 3, transition: "all 0.15s"
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "#888", marginBottom: 8 }}>ADDITIONAL NOTES <span style={{ color: "#666" }}>(constraints, known issues, special context)</span></div>
                  <textarea
                    value={context.additionalNotes}
                    onChange={e => setContext(p => ({ ...p, additionalNotes: e.target.value }))}
                    placeholder='e.g. "Desktop only — mobile is separate", "Cannot change navigation due to legacy system", "Payment UI is from third-party provider"'
                    rows={3}
                    style={{
                      width: "100%", padding: "10px 12px", background: "#0F0F0F", border: "1px solid #2A2A2A",
                      color: "#E8E0D0", fontSize: 16, fontFamily: "inherit", outline: "none", borderRadius: 3,
                      resize: "vertical", lineHeight: 1.6
                    }}
                    onFocus={e => e.target.style.borderColor = "#555"}
                    onBlur={e => e.target.style.borderColor = "#2A2A2A"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Agents selector */}
          <div style={{ marginTop: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: "2px", color: "#777" }}>ANALYSIS AGENTS</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSelectedAgents(AGENTS.map(a => a.id))}
                  style={{ background: "none", border: "none", color: "#777", fontSize: 11, cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", padding: 0 }}>
                  SELECT ALL
                </button>
                <span style={{ color: "#333" }}>·</span>
                <button onClick={() => setSelectedAgents([])}
                  style={{ background: "none", border: "none", color: "#777", fontSize: 11, cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px", padding: 0 }}>
                  CLEAR ALL
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {AGENTS.map(a => {
                const isSelected = selectedAgents.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggleAgent(a.id)}
                    style={{
                      flex: 1, padding: "10px 6px", textAlign: "center", cursor: "pointer",
                      background: isSelected ? "#E8E0D0" : "transparent",
                      border: `1px solid ${isSelected ? "#E8E0D0" : "#2A2A2A"}`,
                      borderRadius: 4, transition: "all 0.15s", fontFamily: "inherit"
                    }}>
                    <div style={{ fontSize: 16, marginBottom: 4, color: isSelected ? "#0F0F0F" : "#555" }}>{a.icon}</div>
                    <div style={{ fontSize: 11, color: isSelected ? "#0F0F0F" : "#666", lineHeight: 1.4, letterSpacing: "0.5px" }}>{a.name.toUpperCase()}</div>
                  </button>
                );
              })}
            </div>
            {selectedAgents.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#FF6644" }}>Select at least one agent to run the audit</div>
            )}
          </div>

          <button
            onClick={runAudit}
            disabled={!canRun}
            style={{
              width: "100%", padding: "16px", background: canRun ? "#E8E0D0" : "#1A1A1A",
              color: canRun ? "#0F0F0F" : "#666", border: "none", cursor: canRun ? "pointer" : "default",
              fontSize: 16, letterSpacing: "2px", fontFamily: "inherit", fontWeight: 500,
              borderRadius: 4, transition: "all 0.2s"
            }}
          >
            {selectedAgents.length > 0 ? `RUN AUDIT WITH ${selectedAgents.length} AGENT${selectedAgents.length > 1 ? 'S' : ''} →` : 'SELECT AT LEAST ONE AGENT'}
          </button>
        </div>
      )}

      {/* RUNNING PHASE */}
      {phase === "running" && (
        <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: "3px", color: "#888", marginBottom: 8 }}>ANALYSIS IN PROGRESS</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700 }}>Agents are reviewing your design...</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {AGENTS.map((agent, i) => {
              const status = agentStatuses[agent.id];
              const result = agentResults[agent.id];
              return (
                <div key={agent.id} className="agent-card" style={{
                  background: "#111", border: `1px solid ${status === "done" ? "#333" : status === "running" ? agent.color + "44" : "#1A1A1A"}`,
                  borderRadius: 4, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                  transition: "all 0.3s"
                }}>
                  <div style={{ fontSize: 20, color: agent.color, width: 24, textAlign: "center" }}>{agent.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {status === "pending" && <span style={{color:"#777"}}>Waiting...</span>}
                      {status === "running" && "Analyzing..."}
                      {status === "done" && `${result?.findings?.length || 0} findings · Score: ${result?.score || "—"}/10`}
                      {status === "error" && <span style={{color:"#FF6644"}}>{result?.error || "Parse error — check console"}</span>}
                    </div>
                  </div>
                  <div>
                    {status === "pending" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#333" }} />}
                    {status === "running" && <div style={{ width: 16, height: 16, border: "2px solid " + agent.color, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                    {status === "done" && <div style={{ color: "#44AA44", fontSize: 16 }}>✓</div>}
                    {status === "error" && <div style={{ color: "#FF4444", fontSize: 16 }}>✗</div>}
                  </div>
                </div>
              );
            })}

            {/* Synthesis */}
            <div style={{ marginTop: 8, background: "#111", border: `1px solid ${agentStatuses.synthesis === "done" ? "#555" : agentStatuses.synthesis === "running" ? "#E8E0D044" : "#1A1A1A"}`, borderRadius: 4, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 20, color: "#E8E0D0", width: 24, textAlign: "center" }}>⊛</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>Synthesis Oracle</div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  {!agentStatuses.synthesis && "Waiting for all agents..."}
                  {agentStatuses.synthesis === "running" && "Synthesizing findings..."}
                  {agentStatuses.synthesis === "done" && "Report ready"}
                  {agentStatuses.synthesis === "error" && "Error"}
                </div>
              </div>
              {agentStatuses.synthesis === "running" && <div style={{ width: 16, height: 16, border: "2px solid #E8E0D0", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
              {agentStatuses.synthesis === "done" && <div style={{ color: "#44AA44", fontSize: 16 }}>✓</div>}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === "results" && synthesis && (
        <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

          {/* Context badge strip */}
          {[context.productType, context.targetAudience, context.userGoal, context.projectStage].some(Boolean) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: "#888", letterSpacing: "1.5px", padding: "4px 0", alignSelf: "center" }}>CONTEXT:</span>
              {context.productType && <span style={{ fontSize: 11, background: "#1A1A1A", color: "#AAA", padding: "3px 10px", borderRadius: 2 }}>{context.productType}</span>}
              {context.projectStage && <span style={{ fontSize: 11, background: "#1A1A1A", color: "#888", padding: "3px 10px", borderRadius: 2 }}>{context.projectStage}</span>}
              {context.targetAudience && <span style={{ fontSize: 11, background: "#1A1A1A", color: "#888", padding: "3px 10px", borderRadius: 2 }}>👥 {context.targetAudience}</span>}
              {context.userGoal && <span style={{ fontSize: 11, background: "#1A1A1A", color: "#888", padding: "3px 10px", borderRadius: 2, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🎯 {context.userGoal}</span>}
            </div>
          )}

          {/* Score header */}
          <div style={{ display: "flex", gap: 24, marginBottom: 40, alignItems: "flex-start" }}>
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 4, padding: "24px 28px", textAlign: "center", minWidth: 120 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, lineHeight: 1, color: gradeColor(synthesis.grade) }}>
                {synthesis.grade}
              </div>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: "2px", marginTop: 6 }}>OVERALL GRADE</div>
              <div style={{ fontSize: 18, color: "#888", marginTop: 4 }}>{synthesis.overall_score?.toFixed(1)}/10</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: "2px", color: "#888", marginBottom: 8 }}>EXECUTIVE SUMMARY</div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#D8D0C0" }}>{synthesis.executive_summary}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                {[
                  { label: "CRITICAL", count: synthesis.critical_count, color: "#FF4444" },
                  { label: "HIGH", count: synthesis.high_count, color: "#FF8C00" },
                  { label: "MEDIUM", count: synthesis.medium_count, color: "#FFB800" },
                  { label: "LOW", count: synthesis.low_count, color: "#44AA44" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.count || 0}</div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: "1px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #1E1E1E", paddingBottom: 0 }}>
            {[
              { id: "overview", label: "OVERVIEW" },
              ...AGENTS.filter(a => selectedAgents.includes(a.id)).map(a => ({ id: a.id, label: a.icon + " " + a.name.split(" ")[0].toUpperCase() })),
              { id: "all", label: "ALL FINDINGS" }
            ].map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 14px", background: "transparent", border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid #E8E0D0" : "2px solid transparent",
                  color: activeTab === tab.id ? "#E8E0D0" : "#888", cursor: "pointer",
                  fontSize: 11, letterSpacing: "1px", fontFamily: "inherit",
                  transition: "all 0.15s", marginBottom: -1
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === "overview" && (
            <div className="fade-up">
              {/* Agent scores grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 32 }}>
                {AGENTS.map(agent => {
                  const r = agentResults[agent.id];
                  return (
                    <div key={agent.id} className="agent-card" onClick={() => setActiveTab(agent.id)}
                      style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 4, padding: "16px 12px", textAlign: "center", cursor: "pointer" }}>
                      <div style={{ fontSize: 22, color: agent.color, marginBottom: 8 }}>{agent.icon}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: r?.score >= 7 ? "#44AA44" : r?.score >= 5 ? "#FFB800" : "#FF6644" }}>
                        {r?.score || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#888", letterSpacing: "1px", marginTop: 4 }}>{agent.name.toUpperCase()}</div>
                      <div style={{ fontSize: 11, color: "#777", marginTop: 6 }}>{r?.findings?.length || 0} issues</div>
                    </div>
                  );
                })}
              </div>

              {/* Top priorities */}
              {synthesis.top_priorities?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "2px", color: "#888", marginBottom: 12 }}>TOP PRIORITIES</div>
                  {synthesis.top_priorities.map((p, i) => (
                    <div key={i} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 4, padding: "14px 16px", marginBottom: 6, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#555", minWidth: 32 }}>0{p.priority}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{p.impact}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {p.quick_win && <span style={{ fontSize: 11, background: "#44AA4422", color: "#44AA44", padding: "3px 8px", borderRadius: 2 }}>QUICK WIN</span>}
                        <span style={{ fontSize: 11, background: "#1E1E1E", color: "#666", padding: "3px 8px", borderRadius: 2 }}>{(p.from_agents || (p.from_agent ? [p.from_agent] : [])).join(", ").toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Merged Findings */}
              {synthesis.merged_findings?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, letterSpacing: "2px", color: "#888", marginBottom: 12 }}>DEDUPLICATED FINDINGS</div>
                  {synthesis.merged_findings.map((f, i) => {
                    const key = "merged-" + i;
                    const expanded = expandedFindings[key];
                    const sev = severityConfig[f.severity] || severityConfig.medium;
                    return (
                      <div key={i} className="finding-row" onClick={() => toggleFinding(key)}
                        style={{ background: "#111", border: "1px solid " + (expanded ? sev.color + "33" : "#1A1A1A"), borderRadius: 4, padding: "14px 16px", marginBottom: 4, cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", background: sev.bg, color: sev.color, borderRadius: 2, minWidth: 56, textAlign: "center" }}>{sev.label}</span>
                          <span style={{ fontSize: 16, flex: 1 }}>{f.title}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {(f.sources || []).map(s => {
                              const ag = AGENTS.find(a => a.id === s);
                              return ag ? <span key={s} style={{ fontSize: 11, color: ag.color }}>{ag.icon}</span> : null;
                            })}
                          </div>
                          <span style={{ color: "#777", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
                        </div>
                        {expanded && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E1E" }}>
                            <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>
                              Reported by: {(f.sources || []).map(s => { const ag = AGENTS.find(a => a.id === s); return ag ? ag.name : s; }).join(" + ")}
                            </div>
                            <div style={{ fontSize: 16, color: "#C0C0C0", lineHeight: 1.6, marginBottom: 10 }}>{f.description}</div>
                            <div style={{ fontSize: 11, color: "#44AA88", lineHeight: 1.6 }}>
                              <span style={{ color: "#888" }}>FIX: </span>{f.recommendation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Strengths */}
              {synthesis.strengths?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, letterSpacing: "2px", color: "#888", marginBottom: 12 }}>STRENGTHS</div>
                  <div style={{ background: "#0F1A0F", border: "1px solid #1A2A1A", borderRadius: 4, padding: "14px 16px" }}>
                    {synthesis.strengths.map((s, i) => (
                      <div key={i} style={{ fontSize: 16, color: "#88CC88", marginBottom: i < synthesis.strengths.length - 1 ? 8 : 0 }}>
                        ✓ {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Individual agent tabs */}
          {AGENTS.map(agent => activeTab === agent.id && (
            <div key={agent.id} className="fade-up">
              {(() => {
                const r = agentResults[agent.id];
                if (!r) return <div style={{ color: "#888" }}>No data</div>;
                return (
                  <>
                    <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
                      <div style={{ fontSize: 32, color: agent.color }}>{agent.icon}</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{r.persona}</div>
                        <div style={{ fontSize: 16, color: "#AAA", marginTop: 4 }}>{r.summary}</div>
                      </div>
                      <div style={{ marginLeft: "auto", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: r.score >= 7 ? "#44AA44" : r.score >= 5 ? "#FFB800" : "#FF6644" }}>{r.score}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>/ 10</div>
                      </div>
                    </div>
                    <div>
                      {(r.findings || []).map((f, i) => {
                        const key = `${agent.id}-${i}`;
                        const sev = severityConfig[f.severity] || severityConfig.medium;
                        const expanded = expandedFindings[key];
                        return (
                          <div key={i} className="finding-row" onClick={() => toggleFinding(key)}
                            style={{ background: "#111", border: "1px solid #1A1A1A", borderRadius: 4, padding: "14px 16px", marginBottom: 4, cursor: "pointer", transition: "background 0.15s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 11, padding: "2px 8px", background: sev.bg, color: sev.color, borderRadius: 2, minWidth: 56, textAlign: "center" }}>{sev.label}</span>
                              <span style={{ fontSize: 16, flex: 1 }}>{f.title}</span>
                              <span style={{ fontSize: 11, color: "#777" }}>{f.heuristic}</span>
                              <span style={{ color: "#777", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
                            </div>
                            {expanded && (
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E1E" }}>
                                <div style={{ fontSize: 16, color: "#C0C0C0", lineHeight: 1.6, marginBottom: 10 }}>{f.description}</div>
                                <div style={{ fontSize: 11, color: "#44AA88", lineHeight: 1.6 }}>
                                  <span style={{ color: "#888" }}>FIX: </span>{f.recommendation}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          ))}

          {/* All findings tab */}
          {activeTab === "all" && (
            <div className="fade-up">
              {["critical", "high", "medium", "low"].map(sev => {
                const sevFindings = allFindings.filter(f => f.severity === sev);
                if (!sevFindings.length) return null;
                const cfg = severityConfig[sev];
                return (
                  <div key={sev} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "2px", color: cfg.color, marginBottom: 8 }}>
                      {cfg.label} — {sevFindings.length} ISSUES
                    </div>
                    {sevFindings.map((f, i) => {
                      const key = `all-${sev}-${i}`;
                      const expanded = expandedFindings[key];
                      const agentInfo = AGENTS.find(a => a.id === f.agentId);
                      return (
                        <div key={i} className="finding-row" onClick={() => toggleFinding(key)}
                          style={{ background: "#111", border: `1px solid ${expanded ? cfg.color + "33" : "#1A1A1A"}`, borderRadius: 4, padding: "14px 16px", marginBottom: 4, cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 16, color: agentInfo?.color }}>{agentInfo?.icon}</span>
                            <span style={{ fontSize: 16, flex: 1 }}>{f.title}</span>
                            <span style={{ fontSize: 11, color: "#777" }}>{f.heuristic}</span>
                            <span style={{ color: "#777", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
                          </div>
                          {expanded && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E1E" }}>
                              <div style={{ fontSize: 16, color: "#C0C0C0", lineHeight: 1.6, marginBottom: 10 }}>{f.description}</div>
                              <div style={{ fontSize: 11, color: "#44AA88", lineHeight: 1.6 }}>
                                <span style={{ color: "#888" }}>FIX: </span>{f.recommendation}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
