import { useState, useEffect } from "react";
import { type Field } from "../types";
import { getAgents } from "../api/auth";
import {type  User } from "../types";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { createField, updateField } from "../api/field";

interface Props {
  field?: Field;
  onClose: () => void;
  onSaved: () => void;
}

export default function FieldFormModal({ field, onClose, onSaved }: Props) {
  const [agents, setAgents] = useState<User[]>([]);
  const [form, setForm] = useState({
    name: field?.name || "",
    crop_type: field?.crop_type || "",
    planting_date: field?.planting_date || "",
    current_stage: field?.current_stage || "planted",
    location: field?.location || "",
    size_hectares: field?.size_hectares?.toString() || "",
    assigned_agent: field?.assigned_agent?.toString() || "",
    expected_harvest_date: field?.expected_harvest_date || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAgents()
      .then((r) => setAgents(r.data))
      .catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const payload: Partial<Field> = {
      name: form.name,
      crop_type: form.crop_type,
      planting_date: form.planting_date,
      current_stage: form.current_stage as Field["current_stage"],
      location: form.location || undefined,
      size_hectares: form.size_hectares
        ? parseFloat(form.size_hectares)
        : undefined,
      assigned_agent: form.assigned_agent
        ? parseInt(form.assigned_agent)
        : undefined,
      expected_harvest_date: form.expected_harvest_date || undefined,
    };
    try {
      if (field) {
        await updateField(field.id, payload);
        toast.success("Field updated!");
      } else {
        await createField(payload);
        toast.success("Field created!");
      }
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to save field";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-display text-lg font-semibold text-stone-800">
            {field ? "Edit Field" : "New Field"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Field Name *</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. North Farm A"
              />
            </div>
            <div>
              <label className="label">Crop Type *</label>
              <input
                className="input"
                required
                value={form.crop_type}
                onChange={(e) => set("crop_type", e.target.value)}
                placeholder="e.g. Maize"
              />
            </div>
            <div>
              <label className="label">Stage</label>
              <select
                className="input"
                value={form.current_stage}
                onChange={(e) => set("current_stage", e.target.value)}
              >
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="ready">Ready</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>
            <div>
              <label className="label">Planting Date *</label>
              <input
                className="input"
                type="date"
                required
                value={form.planting_date}
                onChange={(e) => set("planting_date", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Expected Harvest</label>
              <input
                className="input"
                type="date"
                value={form.expected_harvest_date}
                onChange={(e) => set("expected_harvest_date", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Size (hectares)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                value={form.size_hectares}
                onChange={(e) => set("size_hectares", e.target.value)}
                placeholder="e.g. 2.5"
              />
            </div>
            <div>
              <label className="label">Assign Agent</label>
              <select
                className="input"
                value={form.assigned_agent}
                onChange={(e) => set("assigned_agent", e.target.value)}
              >
                <option value="">— Unassigned —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {`${a.first_name} ${a.last_name}`.trim() || a.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Location</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Block A, North Wing"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? "Saving…" : field ? "Save Changes" : "Create Field"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
