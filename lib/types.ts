export type AppRole = "admin" | "organizer" | "judge" | "viewer";

export type CompetitionStatus =
  | "draft"
  | "scoring_open"
  | "scoring_closed"
  | "published";

export type AggregationRule =
  | "simple_average"
  | "drop_high_low"
  | "weighted_average";

export type ParticipantType = "individual" | "team";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export interface EvaluationTemplate {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface TemplateCriterion {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  max_points: number;
  weight_percent: number;
  order_index: number;
}

export interface Competition {
  id: string;
  org_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  status: CompetitionStatus;
  aggregation_rule: AggregationRule;
  aggregation_config: Record<string, unknown>;
  starts_at: string | null;
  ends_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Criterion {
  id: string;
  competition_id: string;
  name: string;
  description: string | null;
  max_points: number;
  weight_percent: number;
  order_index: number;
  source_template_criterion_id: string | null;
}

export interface Participant {
  id: string;
  competition_id: string;
  type: ParticipantType;
  name: string;
  number: number | null;
  extra: Record<string, unknown>;
  created_at: string;
}

export interface JudgeAssignment {
  id: string;
  competition_id: string;
  judge_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface JudgeInvitation {
  id: string;
  competition_id: string;
  email: string;
  invited_name: string | null;
  token: string;
  invited_by: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface Score {
  id: string;
  competition_id: string;
  judge_id: string;
  participant_id: string;
  criterion_id: string;
  points: number;
  is_locked: boolean;
  submitted_at: string;
  updated_at: string;
}

export interface ScoreEditRequest {
  id: string;
  competition_id: string;
  judge_id: string;
  participant_id: string;
  reason: string | null;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}
