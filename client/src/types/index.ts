export type Role = "admin" | "agent";
export type Stage = "planted" | "growing" | "ready" | "harvested";
export type FieldStatus = "active" | "at_risk" | "completed";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone?: string;
}

export interface FieldUpdate {
  id: number;
  field: number;
  agent: number;
  agent_name: string;
  stage: Stage;
  notes: string;
  created_at: string;
}

export interface Field {
  id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  current_stage: Stage;
  status: FieldStatus;
  location?: string;
  size_hectares?: number;
  assigned_agent?: number;
  assigned_agent_detail?: User;
  created_by?: number;
  created_by_detail?: User;
  created_at: string;
  updated_at: string;
  expected_harvest_date?: string;
  last_update_at?: string;
  recent_updates: FieldUpdate[];
  days_since_planting: number;
}

export interface AgentSummary {
  agent_id: number;
  agent_name: string;
  total: number;
  at_risk: number;
}

export interface DashboardData {
  total_fields: number;
  active_count: number;
  at_risk_count: number;
  completed_count: number;
  stage_breakdown: Record<Stage, number>;
  recent_updates: FieldUpdate[];
  agent_summary: AgentSummary[];
}
