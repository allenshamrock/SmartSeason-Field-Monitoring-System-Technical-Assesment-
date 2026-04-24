import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import {
  LayoutDashboard,
  Map,
  LogOut,
  Menu,
  X,
  Sprout,
  User,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/fields", icon: Map, label: "Fields" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : "";

  return (
    <div className="min-h-screen flex bg-stone-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-forest-900 transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-forest-800">
          <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center">
            <Sprout size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">
              SmartSeason
            </p>
            <p className="text-forest-400 text-xs">Field Monitor</p>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-forest-800">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? "bg-soil-600 text-soil-100" : "bg-forest-700 text-forest-200"}`}
          >
            {isAdmin ? "⬡ Coordinator" : "◎ Field Agent"}
          </span>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest-700 text-white"
                    : "text-forest-300 hover:bg-forest-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-forest-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {displayName}
              </p>
              <p className="text-forest-400 text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-forest-400 hover:text-white transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-stone-100 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-stone-500 hover:text-stone-700"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-display font-semibold text-stone-800 capitalize text-sm">
            {location.pathname.split("/")[1] || "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800"
              >
                <User size={16} />
                <span className="hidden sm:block">{displayName}</span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-8 bg-white border border-stone-100 rounded-lg shadow-lg py-1 w-40 z-50">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
