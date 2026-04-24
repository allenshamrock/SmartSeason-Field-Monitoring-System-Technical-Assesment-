import { type FieldStatus, type Stage } from "../types";
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  Leaf,
  TrendingUp,
  Star,
  Archive,
} from "lucide-react";

export function StatusBadge({ status }: { status: FieldStatus }) {
  if (status === "active")
    return (
      <span className="badge-active">
        <Activity size={10} />
        Active
      </span>
    );
  if (status === "at_risk")
    return (
      <span className="badge-risk">
        <AlertTriangle size={10} />
        At Risk
      </span>
    );
  return (
    <span className="badge-completed">
      <CheckCircle size={10} />
      Completed
    </span>
  );
}

const stageConfig: Record<
  Stage,
  { label: string; color: string; icon: typeof Leaf }
> = {
  planted: { label: "Planted", color: "bg-sky-100 text-sky-700", icon: Leaf },
  growing: {
    label: "Growing",
    color: "bg-forest-100 text-forest-700",
    icon: TrendingUp,
  },
  ready: { label: "Ready", color: "bg-soil-100 text-soil-700", icon: Star },
  harvested: {
    label: "Harvested",
    color: "bg-stone-100 text-stone-600",
    icon: Archive,
  },
};

export function StageBadge({ stage }: { stage: Stage }) {
  const cfg = stageConfig[stage] || stageConfig.planted;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.color}`}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}
