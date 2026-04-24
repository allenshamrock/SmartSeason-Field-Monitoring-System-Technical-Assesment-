import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DashboardData } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Layers,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getDashboard } from "../api/field";
import { StageBadge, StatusBadge } from "../components/status-badge";

const STAGE_COLORS: Record<string, string> = {
  planted: "#38bdf8",
  growing: "#22c55e",
  ready: "#f59e0b",
  harvested: "#78716c",
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    getDashboard()
      .then((res) => setData(res.data)) 
      .catch((err) =>
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load dashboard",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const displayName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username;

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="card p-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <h3 className="font-display font-semibold text-stone-800 mb-2">
            Couldn't load dashboard
          </h3>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    );

  if (!data) return null;

  const stageChartData = Object.entries(data.stage_breakdown || {}).map(
    ([stage, count]) => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      count,
      stage,
    }),
  );

  const totalFields = data.total_fields ?? 0;
  const activeCount = data.active_count ?? 0;
  const atRiskCount = data.at_risk_count ?? 0;
  const completedCount = data.completed_count ?? 0;
  const recentUpdates = data.recent_updates ?? [];
  const agentSummary = data.agent_summary ?? [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-800">
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
            {displayName?.split(" ")[0]} 
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {isAdmin
              ? "Here's your full system overview."
              : "Here's the overview of your assigned fields."}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Fields",
            value: totalFields,
            icon: Layers,
            color: "text-stone-600",
            bg: "bg-stone-100",
          },
          {
            label: "Active",
            value: activeCount,
            icon: TrendingUp,
            color: "text-forest-600",
            bg: "bg-forest-100",
          },
          {
            label: "At Risk",
            value: atRiskCount,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Completed",
            value: completedCount,
            icon: CheckCircle,
            color: "text-stone-500",
            bg: "bg-stone-100",
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-stone-800">
              {stat.value}
            </p>
            <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent updates */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-stone-700 mb-4">
            Fields by Stage
          </h3>
          {stageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageChartData} barSize={40}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#78716c" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "#f5f5f4" }}
                />
                <Bar dataKey="count" name="Fields" radius={[4, 4, 0, 0]}>
                  {stageChartData.map((entry) => (
                    <Cell
                      key={entry.stage}
                      fill={STAGE_COLORS[entry.stage] || "#86efac"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-stone-400">
              <Layers size={28} className="text-stone-300" />
              <p className="text-sm">No fields yet</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-stone-700">
              Recent Updates
            </h3>
            <Clock size={15} className="text-stone-400" />
          </div>
          {recentUpdates.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-stone-400">
              <Clock size={28} className="text-stone-300" />
              <p className="text-sm">No updates posted yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {recentUpdates.slice(0, 5).map((update, i) => (
                <div
                  key={update.id}
                  className={`flex items-start gap-3 py-3 ${i < Math.min(recentUpdates.length, 5) - 1 ? "border-b border-stone-50" : ""}`}
                >
                  <div className="w-7 h-7 bg-forest-100 rounded-full flex items-center justify-center text-forest-700 text-xs font-semibold flex-shrink-0 mt-0.5">
                    {(update.agent_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-stone-700">
                        {update.agent_name || "Unknown"}
                      </span>
                      <StageBadge stage={update.stage} />
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {update.notes}
                    </p>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {new Date(update.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status progress bars */}
      {totalFields > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-stone-700 mb-4">
            Status Overview
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                label: "Active",
                value: activeCount,
                pct: Math.round((activeCount / totalFields) * 100),
                bar: "bg-forest-400",
              },
              {
                label: "At Risk",
                value: atRiskCount,
                pct: Math.round((atRiskCount / totalFields) * 100),
                bar: "bg-amber-400",
              },
              {
                label: "Completed",
                value: completedCount,
                pct: Math.round((completedCount / totalFields) * 100),
                bar: "bg-stone-400",
              },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-stone-600">{s.label}</span>
                  <span className="text-sm font-semibold text-stone-800">
                    {s.value}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {s.pct}% of fields
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent summary — admin only */}
      {isAdmin && agentSummary.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-stone-500" />
            <h3 className="font-display font-semibold text-stone-700">
              Agent Overview
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left py-2 px-1 text-stone-500 font-medium">
                    Agent
                  </th>
                  <th className="text-center py-2 px-1 text-stone-500 font-medium">
                    Total Fields
                  </th>
                  <th className="text-center py-2 px-1 text-stone-500 font-medium">
                    At Risk
                  </th>
                  <th className="text-right py-2 px-1 text-stone-500 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentSummary.map((a) => (
                  <tr
                    key={a.agent_id}
                    className="border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors"
                  >
                    <td className="py-3 px-1 font-medium text-stone-700">
                      {a.agent_name}
                    </td>
                    <td className="py-3 px-1 text-center text-stone-600">
                      {a.total}
                    </td>
                    <td className="py-3 px-1 text-center">
                      {a.at_risk > 0 ? (
                        <span className="badge-risk">{a.at_risk} at risk</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-1 text-right">
                      <StatusBadge
                        status={a.at_risk > 0 ? "at_risk" : "active"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state for agents with no fields */}
      {!isAdmin && totalFields === 0 && (
        <div className="card p-12 text-center">
          <Layers size={36} className="text-stone-300 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-stone-600 mb-1">
            No fields assigned yet
          </h3>
          <p className="text-stone-400 text-sm">
            Your coordinator will assign fields to you soon.
          </p>
        </div>
      )}

      <div className="text-center">
        <Link
          to="/fields"
          className="btn-secondary text-sm inline-flex items-center gap-2"
        >
          View all fields →
        </Link>
      </div>
    </div>
  );
}
