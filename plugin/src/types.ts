export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  title: string;
  heuristic: string;
  severity: Severity;
  description: string;
  recommendation: string;
}

export interface AgentResult {
  agent: string;
  persona: string;
  score: number;
  summary: string;
  findings: Finding[];
  error?: string;
}

export interface MergedFinding {
  title: string;
  severity: Severity;
  sources: string[];
  description: string;
  recommendation: string;
}

export interface SynthesisResult {
  overall_score: number;
  grade: string;
  executive_summary: string;
  top_priorities: Array<{
    priority: number;
    title: string;
    from_agents: string[];
    impact: string;
    quick_win: boolean;
  }>;
  merged_findings: MergedFinding[];
  strengths: string[];
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export interface AuditContext {
  productType: string;
  targetAudience: string;
  userGoal: string;
  projectStage: string;
  additionalNotes: string;
}

export interface AgentPlanInstructions {
  priority: "high" | "normal" | "low";
  focus_areas: string[];
  skip_notes?: string;
}

export interface AuditPlan {
  screen_classification: {
    view_type: string;
    platform: string;
    domain: string;
    complexity: "low" | "medium" | "high";
  };
  audit_strategy: {
    overall_approach: string;
    stage_constraints: string;
    critical_path: string;
  };
  agent_instructions: {
    heuristics: AgentPlanInstructions;
    darkpatterns: AgentPlanInstructions;
    accessibility: AgentPlanInstructions;
    designflaws: AgentPlanInstructions;
  };
  risk_areas: {
    area: string;
    reason: string;
    primary_agent: string;
  }[];
}

// Messages between code.ts and ui.tsx via postMessage
export type PluginMessage =
  | { type: "export-ready"; imageData: Uint8Array; frameName: string; frameWidth: number; frameHeight: number }
  | { type: "no-selection" }
  | { type: "request-export" }
  | { type: "build-report"; synthesis: SynthesisResult; agentResults: AgentResult[]; frameName: string; context: AuditContext }
  | { type: "report-built" }
  | { type: "report-error"; message: string }
  | { type: "save-api-key"; apiKey: string }
  | { type: "api-key"; apiKey: string }
  | { type: "run-audit"; apiKey: string; agentIds: string[]; imageBase64: string; context: AuditContext }
  | { type: "audit-started" }
  | { type: "planning-result"; plan: AuditPlan | null }
  | { type: "agent-result"; agentId: string; result: AgentResult }
  | { type: "synthesis-result"; result: SynthesisResult }
  | { type: "audit-error"; message: string };
