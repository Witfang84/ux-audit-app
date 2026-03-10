// src/report-builder.ts
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255
  };
}
function severityColor(severity) {
  switch (severity) {
    case "critical":
      return "#FF4444";
    case "high":
      return "#FF8C00";
    case "medium":
      return "#FFB800";
    case "low":
      return "#888888";
  }
}
function gradeColor(grade) {
  if (grade.startsWith("A"))
    return "#44DD44";
  if (grade.startsWith("B"))
    return "#88CC44";
  if (grade.startsWith("C"))
    return "#FFB800";
  if (grade.startsWith("D"))
    return "#FF8C00";
  return "#FF4444";
}
function createRect(width, height, color) {
  const rect = figma.createRectangle();
  rect.resize(width, height);
  rect.fills = [{ type: "SOLID", color: hexToRgb(color) }];
  return rect;
}
function createText(content, fontSize, color, fontStyle = "Regular") {
  const text = figma.createText();
  text.fontName = { family: "Inter", style: fontStyle };
  text.fontSize = fontSize;
  text.fills = [{ type: "SOLID", color: hexToRgb(color) }];
  text.characters = content;
  return text;
}
function createSection(width, bgColor) {
  const section = figma.createFrame();
  section.resize(width, 10);
  section.fills = [{ type: "SOLID", color: hexToRgb(bgColor) }];
  section.clipsContent = false;
  return section;
}
function append(parent, child, x, y) {
  parent.appendChild(child);
  child.x = x;
  child.y = y;
  return y + child.height;
}
async function buildReportFrame(synthesis, agentResults, auditedFrameName, context) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  const REPORT_WIDTH = 800;
  const date = new Date().toLocaleDateString("pl-PL");
  const reportName = `UX Audit — ${auditedFrameName} — ${date}`;
  let startX = 200;
  for (const node of figma.currentPage.children) {
    const right = node.x + node.width;
    if (right > startX)
      startX = right;
  }
  startX += 200;
  const reportFrame = figma.createFrame();
  reportFrame.name = reportName;
  reportFrame.resize(REPORT_WIDTH, 100);
  reportFrame.fills = [{ type: "SOLID", color: hexToRgb("#0F0F0F") }];
  reportFrame.clipsContent = false;
  reportFrame.x = startX;
  reportFrame.y = 0;
  figma.currentPage.appendChild(reportFrame);
  let currentY = 0;
  currentY = buildHeader(reportFrame, synthesis, auditedFrameName, date, REPORT_WIDTH, currentY);
  currentY = buildAgents(reportFrame, agentResults, REPORT_WIDTH, currentY);
  currentY = buildExecutiveSummary(reportFrame, synthesis, REPORT_WIDTH, currentY);
  currentY = buildTopPriorities(reportFrame, synthesis, REPORT_WIDTH, currentY);
  currentY = buildFindings(reportFrame, synthesis, REPORT_WIDTH, currentY);
  currentY = buildStrengths(reportFrame, synthesis, REPORT_WIDTH, currentY);
  currentY = buildFooter(reportFrame, REPORT_WIDTH, currentY);
  reportFrame.resize(REPORT_WIDTH, currentY);
  figma.viewport.scrollAndZoomIntoView([reportFrame]);
}
function buildHeader(parent, synthesis, auditedFrameName, date, width, startY) {
  const PAD = 40;
  let y = PAD;
  const section = createSection(width, "#0F0F0F");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const label = createText("UX AUDIT REPORT", 11, "#888888", "Bold");
  label.letterSpacing = { value: 3, unit: "PIXELS" };
  y = append(section, label, PAD, y) + 12;
  const title = createText(auditedFrameName, 32, "#E8E0D0", "Bold");
  title.resize(width - PAD * 2, title.height);
  y = append(section, title, PAD, y) + 8;
  const dateText = createText(date, 13, "#666666", "Regular");
  y = append(section, dateText, PAD, y) + 32;
  const gColor = gradeColor(synthesis.grade);
  const gradeBox = createRect(64, 64, gColor);
  gradeBox.cornerRadius = 8;
  append(section, gradeBox, PAD, y);
  const gradeLetter = createText(synthesis.grade, 28, "#0F0F0F", "Bold");
  gradeLetter.textAlignHorizontal = "CENTER";
  gradeLetter.textAlignVertical = "CENTER";
  gradeLetter.resize(64, 64);
  append(section, gradeLetter, PAD, y);
  const scoreText = createText(`${synthesis.overall_score.toFixed(1)} / 10`, 32, "#E8E0D0", "Bold");
  append(section, scoreText, PAD + 64 + 20, y + 16);
  y += 64 + PAD;
  section.resize(width, y);
  return startY + y;
}
function buildAgents(parent, agentResults, width, startY) {
  const PAD = 32;
  const CARD_W = 160;
  const CARD_H = 80;
  const CARD_GAP = 12;
  let y = PAD;
  const section = createSection(width, "#111111");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const label = createText("AGENTS", 11, "#888888", "Bold");
  label.letterSpacing = { value: 3, unit: "PIXELS" };
  y = append(section, label, PAD, y) + 16;
  const successfulAgents = agentResults.filter((r) => !r.error);
  successfulAgents.forEach((result, i) => {
    const cardX = PAD + i * (CARD_W + CARD_GAP);
    const card = createRect(CARD_W, CARD_H, "#1A1A1A");
    card.cornerRadius = 8;
    append(section, card, cardX, y);
    const icon = createText(getAgentIcon(result.agent), 18, "#E8E0D0", "Regular");
    append(section, icon, cardX + 12, y + 10);
    const name = createText(getAgentName(result.agent), 11, "#888888", "Regular");
    name.resize(CARD_W - 24, name.height);
    name.textTruncation = "ENDING";
    append(section, name, cardX + 12, y + 34);
    const score = createText(`${result.score}/10`, 13, "#E8E0D0", "Bold");
    append(section, score, cardX + 12, y + 52);
  });
  y += CARD_H + PAD;
  section.resize(width, y);
  return startY + y;
}
function getAgentIcon(agentId) {
  const icons = {
    heuristics: "◈",
    darkpatterns: "◉",
    accessibility: "◎",
    designflaws: "◇"
  };
  return icons[agentId] !== undefined ? icons[agentId] : "○";
}
function getAgentName(agentId) {
  const names = {
    heuristics: "Heuristics & Design Laws",
    darkpatterns: "Dark Patterns",
    accessibility: "Accessibility (WCAG)",
    designflaws: "Design Flaws"
  };
  return names[agentId] !== undefined ? names[agentId] : agentId;
}
function buildExecutiveSummary(parent, synthesis, width, startY) {
  const PAD = 32;
  let y = PAD;
  const section = createSection(width, "#0F0F0F");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const label = createText("EXECUTIVE SUMMARY", 11, "#888888", "Bold");
  label.letterSpacing = { value: 3, unit: "PIXELS" };
  y = append(section, label, PAD, y) + 16;
  const summary = createText(synthesis.executive_summary, 16, "#C8C0B0", "Regular");
  summary.resize(width - PAD * 2, summary.height);
  summary.lineHeight = { value: 160, unit: "PERCENT" };
  summary.textAutoResize = "HEIGHT";
  y = append(section, summary, PAD, y) + PAD;
  section.resize(width, y);
  return startY + y;
}
function buildTopPriorities(parent, synthesis, width, startY) {
  const PAD = 32;
  let y = PAD;
  const section = createSection(width, "#111111");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const label = createText("TOP PRIORITIES", 11, "#888888", "Bold");
  label.letterSpacing = { value: 3, unit: "PIXELS" };
  y = append(section, label, PAD, y) + 20;
  for (const priority of synthesis.top_priorities) {
    const rowStartY = y;
    const num = createText(String(priority.priority), 24, "#333333", "Bold");
    append(section, num, PAD, y);
    const textX = PAD + 40;
    const textW = width - textX - PAD;
    const titleNode = createText(priority.title, 16, "#E8E0D0", "Bold");
    titleNode.resize(textW, titleNode.height);
    titleNode.textAutoResize = "HEIGHT";
    const afterTitle = append(section, titleNode, textX, y) + 4;
    const impactNode = createText(priority.impact, 13, "#888888", "Regular");
    impactNode.resize(textW, impactNode.height);
    impactNode.textAutoResize = "HEIGHT";
    y = append(section, impactNode, textX, afterTitle);
    if (priority.quick_win) {
      const badge = createText("QUICK WIN", 10, "#44AA88", "Bold");
      badge.letterSpacing = { value: 1, unit: "PIXELS" };
      y = append(section, badge, textX, y + 4) + 4;
    }
    y += 20;
  }
  y += PAD - 20;
  section.resize(width, y);
  return startY + y;
}
function buildFindings(parent, synthesis, width, startY) {
  const PAD = 32;
  const SEVERITIES = ["critical", "high", "medium", "low"];
  let y = PAD;
  const section = createSection(width, "#0F0F0F");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const label = createText("FINDINGS", 11, "#888888", "Bold");
  label.letterSpacing = { value: 3, unit: "PIXELS" };
  y = append(section, label, PAD, y) + 20;
  for (const severity of SEVERITIES) {
    const findings = synthesis.merged_findings.filter((f) => f.severity === severity);
    if (!findings.length)
      continue;
    const sColor = severityColor(severity);
    const bar = createRect(width - PAD * 2, 1, sColor);
    bar.opacity = 0.3;
    append(section, bar, PAD, y);
    const sevLabel = createText(severity.toUpperCase(), 10, sColor, "Bold");
    sevLabel.letterSpacing = { value: 2, unit: "PIXELS" };
    y = append(section, sevLabel, PAD, y + 8) + 16;
    for (const finding of findings) {
      const cardPad = 16;
      const cardW = width - PAD * 2;
      let cardY = cardPad;
      const card = figma.createFrame();
      card.resize(cardW, 10);
      card.fills = [{ type: "SOLID", color: hexToRgb("#1A1A1A") }];
      card.cornerRadius = 8;
      card.clipsContent = false;
      const dot = createText("●", 10, sColor, "Regular");
      card.appendChild(dot);
      dot.x = cardPad;
      dot.y = cardY;
      const titleNode = createText(finding.title, 14, "#E8E0D0", "Bold");
      titleNode.resize(cardW - cardPad * 2 - 16, titleNode.height);
      titleNode.textAutoResize = "HEIGHT";
      card.appendChild(titleNode);
      titleNode.x = cardPad + 16;
      titleNode.y = cardY;
      cardY += titleNode.height + 6;
      const sources = finding.sources.map(getAgentName).join(", ");
      const sourceNode = createText(sources, 11, "#888888", "Regular");
      sourceNode.resize(cardW - cardPad * 2, sourceNode.height);
      card.appendChild(sourceNode);
      sourceNode.x = cardPad;
      sourceNode.y = cardY;
      cardY += sourceNode.height + 10;
      const descNode = createText(finding.description, 13, "#AAAAAA", "Regular");
      descNode.resize(cardW - cardPad * 2, descNode.height);
      descNode.textAutoResize = "HEIGHT";
      descNode.lineHeight = { value: 150, unit: "PERCENT" };
      card.appendChild(descNode);
      descNode.x = cardPad;
      descNode.y = cardY;
      cardY += descNode.height + 10;
      const fixLabel = createText("FIX  ", 13, "#44AA88", "Medium");
      card.appendChild(fixLabel);
      fixLabel.x = cardPad;
      fixLabel.y = cardY;
      const fixText = createText(finding.recommendation, 13, "#44AA88", "Regular");
      fixText.resize(cardW - cardPad * 2 - 32, fixText.height);
      fixText.textAutoResize = "HEIGHT";
      fixText.lineHeight = { value: 150, unit: "PERCENT" };
      card.appendChild(fixText);
      fixText.x = cardPad + 32;
      fixText.y = cardY;
      cardY += Math.max(fixLabel.height, fixText.height) + cardPad;
      card.resize(cardW, cardY);
      parent.appendChild(card);
      card.x = PAD;
      card.y = startY + y;
      section.appendChild(card);
      card.x = PAD;
      card.y = y;
      y += cardY + 12;
    }
    y += 8;
  }
  y += PAD - 8;
  section.resize(width, y);
  return startY + y;
}
function buildStrengths(parent, synthesis, width, startY) {
  if (!synthesis.strengths.length)
    return startY;
  const PAD = 32;
  let y = PAD;
  const section = createSection(width, "#0F1A0F");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const label = createText("STRENGTHS", 11, "#44AA44", "Bold");
  label.letterSpacing = { value: 3, unit: "PIXELS" };
  y = append(section, label, PAD, y) + 16;
  for (const strength of synthesis.strengths) {
    const item = createText(`✓  ${strength}`, 14, "#88CC88", "Regular");
    item.resize(width - PAD * 2, item.height);
    item.textAutoResize = "HEIGHT";
    item.lineHeight = { value: 150, unit: "PERCENT" };
    y = append(section, item, PAD, y) + 10;
  }
  y += PAD - 10;
  section.resize(width, y);
  return startY + y;
}
function buildFooter(parent, width, startY) {
  const PAD = 24;
  let y = PAD;
  const section = createSection(width, "#0F0F0F");
  parent.appendChild(section);
  section.x = 0;
  section.y = startY;
  const footer = createText("Generated by UX Audit Plugin", 11, "#333333", "Regular");
  y = append(section, footer, PAD, y) + PAD;
  section.resize(width, y);
  return startY + y;
}

// src/agents.ts
var AGENTS = [
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
var SYNTHESIS_PROMPT = (results) => `You are Synthesis Oracle, a principal UX strategist. You receive audit results from specialist agents and create a unified, deduplicated, actionable report.

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

// src/code.ts
var MODEL = "claude-sonnet-4-20250514";
var API_HEADERS = {
  "Content-Type": "application/json",
  "anthropic-version": "2023-06-01"
};
function parseJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match)
    throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}
function buildContextBlock(context) {
  const lines = [];
  if (context.productType)
    lines.push(`- Product type: ${context.productType}`);
  if (context.targetAudience)
    lines.push(`- Target audience: ${context.targetAudience}`);
  if (context.userGoal)
    lines.push(`- User's goal on this screen: ${context.userGoal}`);
  if (context.projectStage)
    lines.push(`- Project stage: ${context.projectStage}`);
  if (context.additionalNotes)
    lines.push(`- Additional context: ${context.additionalNotes}`);
  if (!lines.length)
    return "";
  return `

DESIGN CONTEXT (take this into account during your analysis):
${lines.join(`
`)}
`;
}
async function callClaude(apiKey, systemPrompt, imageBase64) {
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
          { type: "text", text: "Analyze this UI design thoroughly according to your expertise. Be specific and actionable. Return max 5 findings to keep response concise." }
        ]
      }]
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }
  const data = await response.json();
  const text = data.content.map((i) => i.text ?? "").join("");
  return parseJSON(text);
}
async function callClaudeSynthesis(apiKey, results) {
  if (!apiKey.trim()) {
    throw new Error("API key is empty");
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { ...API_HEADERS, "x-api-key": apiKey },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3500,
      messages: [{ role: "user", content: SYNTHESIS_PROMPT(results) }]
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
  }
  const data = await response.json();
  const text = data.content.map((i) => i.text ?? "").join("");
  return parseJSON(text);
}
figma.showUI(__html__, { width: 480, height: 640 });
figma.clientStorage.getAsync("ux-audit-api-key").then((apiKey) => {
  figma.ui.postMessage({ type: "api-key", apiKey: apiKey !== undefined ? apiKey : "" });
});
figma.ui.onmessage = async (msg) => {
  if (msg.type === "save-api-key") {
    await figma.clientStorage.setAsync("ux-audit-api-key", msg.apiKey);
    return;
  }
  if (msg.type === "request-export") {
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      figma.ui.postMessage({ type: "no-selection" });
      return;
    }
    const imageData = await selection.exportAsync({
      format: "PNG",
      scale: 2,
      constraint: { type: "SCALE", value: 2 }
    });
    figma.ui.postMessage({
      type: "export-ready",
      imageData,
      frameName: selection.name,
      frameWidth: selection.width,
      frameHeight: selection.height
    });
  }
  if (msg.type === "build-report") {
    try {
      await buildReportFrame(msg.synthesis, msg.agentResults, msg.frameName, msg.context);
      figma.ui.postMessage({ type: "report-built" });
    } catch (e) {
      figma.ui.postMessage({
        type: "report-error",
        message: e instanceof Error ? e.message : String(e)
      });
    }
  }
  if (msg.type === "run-audit") {
    try {
      figma.ui.postMessage({ type: "audit-started" });
      const { apiKey, agentIds, imageBase64, context } = msg;
      const results = [];
      const activeAgents = AGENTS.filter((a) => agentIds.includes(a.id));
      for (let i = 0;i < activeAgents.length; i += 2) {
        const batch = activeAgents.slice(i, i + 2);
        const batchPromises = batch.map(async (agent) => {
          try {
            const contextBlock = buildContextBlock(context);
            const result = await callClaude(apiKey, agent.persona + contextBlock, imageBase64);
            figma.ui.postMessage({ type: "agent-result", agentId: agent.id, result });
            return result;
          } catch (err) {
            const errResult = {
              agent: agent.id,
              persona: agent.name,
              score: 0,
              summary: `Failed: ${err.message}`,
              findings: [],
              error: err.message
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
      try {
        const synthResult = await callClaudeSynthesis(apiKey, results);
        figma.ui.postMessage({ type: "synthesis-result", result: synthResult });
      } catch (err) {
        figma.ui.postMessage({
          type: "audit-error",
          message: `Synthesis failed: ${err.message}`
        });
      }
    } catch (err) {
      figma.ui.postMessage({
        type: "audit-error",
        message: err.message
      });
    }
  }
};
