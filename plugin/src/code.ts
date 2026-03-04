import { buildReportFrame } from "./report-builder";
import type { PluginMessage } from "./types";

figma.showUI(__html__, { width: 480, height: 640 });

figma.ui.onmessage = async (msg: PluginMessage) => {

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
};
