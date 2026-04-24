import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Field } from "../types";
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getFields } from "../api/field";
import { StageBadge, StatusBadge } from "../components/status-badge";
import FieldFormModal from "../components/field-form-modal";

export default function FieldsPage() {
  const { isAdmin } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchFields = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (stageFilter) params.stage = stageFilter;
    getFields(params)
      .then((res) => setFields(res.data)) 
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFields();
  }, [stageFilter]);

  const filtered = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.crop_type.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-800">
            Fields
          </h2>
          <p className="text-stone-500 text-sm">
            {filtered.length} field{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> New Field
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            className="input pl-9"
            placeholder="Search fields or crops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <select
            className="input pl-9 pr-8 appearance-none"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="ready">Ready</option>
            <option value="harvested">Harvested</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-stone-400">No fields found.</p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus size={16} /> Create your first field
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr>
                  {[
                    "Field",
                    "Crop",
                    "Stage",
                    "Status",
                    "Agent",
                    "Planted",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((field) => (
                  <tr
                    key={field.id}
                    className="hover:bg-stone-50 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-stone-800">
                        {field.name}
                      </div>
                      {field.location && (
                        <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                          <MapPin size={10} />
                          {field.location}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-stone-600">
                      {field.crop_type}
                    </td>
                    <td className="px-4 py-3.5">
                      <StageBadge stage={field.current_stage} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={field.status} />
                    </td>
                    <td className="px-4 py-3.5 text-stone-600">
                      {field.assigned_agent_detail ? (
                        `${field.assigned_agent_detail.first_name} ${field.assigned_agent_detail.last_name}`.trim() ||
                        field.assigned_agent_detail.username
                      ) : (
                        <span className="text-stone-300">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(field.planting_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-stone-400">
                        {field.days_since_planting}d ago
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/fields/${field.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-forest-600 hover:text-forest-700 text-xs font-medium"
                      >
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <FieldFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchFields();
          }}
        />
      )}
    </div>
  );
}
