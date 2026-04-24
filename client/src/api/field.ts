import api from "./client";
import type { Field, FieldUpdate, DashboardData } from "../types";

export const getFields = (params?: Record<string, string>) =>
  api.get<Field[]>("/fields/", { params });

export const getField = (id: number) => api.get<Field>(`/fields/${id}/`);

export const createField = (data: Partial<Field>) =>
  api.post<Field>("/fields/", data);

export const updateField = (id: number, data: Partial<Field>) =>
  api.patch<Field>(`/fields/${id}/`, data);

export const deleteField = (id: number) => api.delete(`/fields/${id}/`);

export const getFieldUpdates = (fieldId: number) =>
  api.get<FieldUpdate[]>(`/fields/${fieldId}/updates/`);

export const createFieldUpdate = (
  fieldId: number,
  data: { stage: string; notes: string },
) => api.post<FieldUpdate>(`/fields/${fieldId}/updates/`, data);

export const getDashboard = () => api.get<DashboardData>("/dashboard/");
