import api from "./client";
import { type User } from "../types";

export const login = (username: string, password: string) =>
  api("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  }) as Promise<{ access: string; refresh: string; user: User }>;

export const register = (data: Partial<User> & { password: string }) =>
  api("/auth/register/", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<User>;

export const getMe = () => api("/auth/me/") as Promise<User>;

export const getAgents = () => api("/auth/agents/") as Promise<User[]>;
