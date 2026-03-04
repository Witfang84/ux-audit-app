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

// src/code.ts
figma.showUI(__html__, { width: 480, height: 640 });
figma.ui.onmessage = async (msg) => {
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
};
