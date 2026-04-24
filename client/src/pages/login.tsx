import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../api/auth";
import { useAuth } from "../context/auth-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.username, form.password);
      const { access, refresh, user } = res;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setUser(user);

      toast.success(`Welcome back, ${user.first_name || user.username}!`);
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-forest-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-forest-500 rounded-xl flex items-center justify-center">
            <Sprout size={22} className="text-white" />
          </div>
          <span className="font-display text-white text-xl font-semibold">
            SmartSeason
          </span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Monitor your fields,
            <br />
            <span className="text-forest-400">season by season.</span>
          </h1>
          <p className="text-forest-300 text-lg leading-relaxed">
            Track crop progress, coordinate field agents, and stay on top of
            every harvest cycle — all in one place.
          </p>
        </div>
        <div className="flex gap-6 text-forest-400 text-sm">
          <div>
            <p className="text-2xl font-display font-bold text-white mb-1">4</p>
            <p>Crop Stages</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-white mb-1">
              Real-time
            </p>
            <p>Field Updates</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-white mb-1">
              Smart
            </p>
            <p>Status Logic</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Sprout size={20} className="text-forest-600" />
            <span className="font-display font-semibold text-forest-800">
              SmartSeason
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-stone-800 mb-1">
            Sign in
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            Access your field monitoring dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="e.g. admin"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-stone-50 rounded-xl border border-stone-100">
            <p className="text-xs font-medium text-stone-500 mb-2">
              Demo credentials
            </p>
            <div className="space-y-1">
              {[
                { role: "Admin", user: "admin", pw: "admin123" },
                { role: "Agent", user: "john_agent", pw: "agent123" },
              ].map((c) => (
                <button
                  key={c.user}
                  onClick={() => setForm({ username: c.user, password: c.pw })}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors font-mono text-stone-600 flex justify-between"
                >
                  <span className="text-forest-600 font-medium">{c.role}</span>
                  <span>
                    {c.user} / {c.pw}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
