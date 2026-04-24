import api from "./client";
import { type Field,type FieldUpdate,type DashboardData } from "../types";

// helper to handle query params
const buildQuery = (params?: Record<string, string>) => {
  if (!params) return "";
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : "";
};

export const getFields = (params?: Record<string, string>) =>
  api(`/fields/${buildQuery(params)}`) as Promise<Field[]>;

export const getField = (id: number) =>
  api(`/fields/${id}/`) as Promise<Field>;

export const createField = (data: Partial<Field>) =>
  api("/fields/", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Field>;

export const updateField = (id: number, data: Partial<Field>) =>
  api(`/fields/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }) as Promise<Field>;

export const deleteField = (id: number) =>
  api(`/fields/${id}/`, {
    method: "DELETE",
  }) as Promise<void>;

export const getFieldUpdates = (fieldId: number) =>
  api(`/fields/${fieldId}/updates/`) as Promise<FieldUpdate[]>;

export const createFieldUpdate = (
  fieldId: number,
  data: { stage: string; notes: string },
) =>
  api(`/fields/${fieldId}/updates/`, {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<FieldUpdate>;

export const getDashboard = () =>
  api("/dashboard/") as Promise<DashboardData>;
