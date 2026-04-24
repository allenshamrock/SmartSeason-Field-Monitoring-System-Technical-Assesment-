import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type DashboardData } from "../types";

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

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
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

  const displayName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-stone-800">
          Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
          {displayName?.split(" ")[0]} 👋
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          {isAdmin
            ? "Here's your full system overview."
            : "Here's your assigned fields overview."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Fields",
            value: data.total_fields,
            icon: Layers,
            color: "text-stone-600",
            bg: "bg-stone-100",
          },
          {
            label: "Active",
            value: data.active_count,
            icon: TrendingUp,
            color: "text-forest-600",
            bg: "bg-forest-100",
          },
          {
            label: "At Risk",
            value: data.at_risk_count,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Completed",
            value: data.completed_count,
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-stone-700 mb-4">
            Fields by Stage
          </h3>
          {stageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stageChartData} barSize={36}>
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
            <div className="h-44 flex items-center justify-center text-stone-400 text-sm">
              No data yet
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
          <div className="space-y-3">
            {data.recent_updates.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-6">
                No updates yet
              </p>
            )}
            {data.recent_updates.slice(0, 5).map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-3 pb-3 border-b border-stone-50 last:border-0 last:pb-0"
              >
                <div className="w-7 h-7 bg-forest-100 rounded-full flex items-center justify-center text-forest-700 text-xs font-semibold flex-shrink-0 mt-0.5">
                  {(update.agent_name || "U").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-stone-700">
                      {update.agent_name}
                    </span>
                    <StageBadge stage={update.stage} />
                  </div>
                  <p className="text-xs text-stone-400 truncate">
                    {update.notes}
                  </p>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {new Date(update.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent summary (admin only) */}
      {isAdmin && data.agent_summary.length > 0 && (
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
                  <th className="text-left py-2 text-stone-500 font-medium">
                    Agent
                  </th>
                  <th className="text-center py-2 text-stone-500 font-medium">
                    Fields
                  </th>
                  <th className="text-center py-2 text-stone-500 font-medium">
                    At Risk
                  </th>
                  <th className="text-right py-2 text-stone-500 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.agent_summary.map((a) => (
                  <tr
                    key={a.agent_id}
                    className="border-b border-stone-50 last:border-0"
                  >
                    <td className="py-3 font-medium text-stone-700">
                      {a.agent_name}
                    </td>
                    <td className="py-3 text-center text-stone-600">
                      {a.total}
                    </td>
                    <td className="py-3 text-center">
                      {a.at_risk > 0 ? (
                        <span className="badge-risk">{a.at_risk}</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
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
