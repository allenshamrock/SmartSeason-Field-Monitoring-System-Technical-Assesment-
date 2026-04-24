import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Field, FieldUpdate } from "../types";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Ruler,
  User,
  Pencil,
  Trash2,
  Plus,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import {
  createFieldUpdate,
  deleteField,
  getField,
  getFieldUpdates,
} from "../api/field";
import { StageBadge, StatusBadge } from "../components/status-badge";
import FieldFormModal from "../components/field-form-modal";

const STAGES = ["planted", "growing", "ready", "harvested"] as const;

export default function FieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [field, setField] = useState<Field | null>(null);
  const [updates, setUpdates] = useState<FieldUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ stage: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fieldId = parseInt(id!);

  const fetchData = async () => {
    try {
      const [fieldRes, updatesRes] = await Promise.all([
        getField(fieldId),
        getFieldUpdates(fieldId),
      ]);
      // axios → .data on each response
      setField(fieldRes.data);
      setUpdates(updatesRes.data);
      setUpdateForm((f) => ({ ...f, stage: fieldRes.data.current_stage }));
    } catch {
      toast.error("Failed to load field data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fieldId]);

  const handleDelete = async () => {
    if (!confirm("Delete this field? This cannot be undone.")) return;
    try {
      await deleteField(fieldId);
      toast.success("Field deleted");
      navigate("/fields");
    } catch {
      toast.error("Failed to delete field");
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.notes.trim()) {
      toast.error("Notes are required");
      return;
    }
    setSubmitting(true);
    try {
      await createFieldUpdate(fieldId, {
        stage: updateForm.stage,
        notes: updateForm.notes,
      });
      toast.success("Field updated!");
      setUpdateForm((f) => ({ ...f, notes: "" }));
      setShowUpdateForm(false);
      fetchData();
    } catch {
      toast.error("Failed to submit update");
    } finally {
      setSubmitting(false);
    }
  };

  const canUpdate = isAdmin || field?.assigned_agent === user?.id;

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!field)
    return (
      <div className="text-center py-16 text-stone-400">Field not found</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/fields"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft size={15} /> All fields
      </Link>

      {/* Field header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display text-2xl font-bold text-stone-800">
                {field.name}
              </h1>
              <StageBadge stage={field.current_stage} />
              <StatusBadge status={field.status} />
            </div>
            <p className="text-stone-500">{field.crop_type}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
          {[
            {
              icon: Calendar,
              label: "Planted",
              value: new Date(field.planting_date).toLocaleDateString(),
            },
            {
              icon: Clock,
              label: "Days in field",
              value: `${field.days_since_planting} days`,
            },
            {
              icon: User,
              label: "Agent",
              value: field.assigned_agent_detail
                ? `${field.assigned_agent_detail.first_name} ${field.assigned_agent_detail.last_name}`.trim() ||
                  field.assigned_agent_detail.username
                : "Unassigned",
            },
            {
              icon: Ruler,
              label: "Size",
              value: field.size_hectares ? `${field.size_hectares} ha` : "—",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
                <item.icon size={12} />
                {item.label}
              </div>
              <p className="font-medium text-stone-700 text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        {field.location && (
          <div className="flex items-center gap-1.5 text-stone-500 text-sm mt-4">
            <MapPin size={14} /> {field.location}
          </div>
        )}
      </div>

      {canUpdate && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-stone-700">
              Post Update
            </h3>
            <button
              onClick={() => setShowUpdateForm((p) => !p)}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <Plus size={14} /> {showUpdateForm ? "Cancel" : "Add update"}
            </button>
          </div>
          {showUpdateForm && (
            <div className="space-y-4">
              <div>
                <label className="label">New Stage</label>
                <div className="flex gap-2 flex-wrap">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setUpdateForm((f) => ({ ...f, stage: s }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        updateForm.stage === s
                          ? "bg-forest-600 text-white border-forest-600"
                          : "border-stone-200 text-stone-600 hover:border-forest-400"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Notes / Observations</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Describe what you observed in the field…"
                  value={updateForm.notes}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? "Submitting…" : "Submit Update"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <h3 className="font-display font-semibold text-stone-700 mb-4">
          Update History
        </h3>
        {updates.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">
            No updates yet for this field.
          </p>
        ) : (
          <div className="space-y-0">
            {updates.map((u, i) => (
              <div key={u.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center text-forest-700 text-xs font-semibold flex-shrink-0">
                    {(u.agent_name || "U").charAt(0)}
                  </div>
                  {i < updates.length - 1 && (
                    <div className="w-px flex-1 bg-stone-100 my-1" />
                  )}
                </div>
                <div className="pb-5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-stone-700 text-sm">
                      {u.agent_name}
                    </span>
                    <StageBadge stage={u.stage} />
                    <span className="text-xs text-stone-400">
                      {new Date(u.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 bg-stone-50 rounded-lg px-3 py-2">
                    {u.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <FieldFormModal
          field={field}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
