import api from "./client";
import type { User } from "../types";

export const login = (username: string, password: string) =>
  api.post<{ access: string; refresh: string; user: User }>("/auth/login/", {
    username,
    password,
  });

export const register = (data: Partial<User> & { password: string }) =>
  api.post<User>("/auth/register/", data);

export const getMe = () => api.get<User>("/auth/me/");

export const getAgents = () => api.get<User[]>("/auth/agents/");
