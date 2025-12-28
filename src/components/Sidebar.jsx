import { useState, useRef, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiEdit3,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const collapseBtnRef = useRef();

  const items = [
    { to: "/auth", label: "Dashboard", icon: <FiHome /> },
    { to: "/auth/tasks", label: "Tasks", icon: <FiEdit3 /> },
    { to: "/auth/notes", label: "Notes", icon: <FiEdit3 /> },
    { to: "/auth/profile", label: "Profile", icon: <FiUser /> },
    { to: "/auth/edit-profile", label: "Edit Profile", icon: <FiEdit3 /> },
    { to: "/auth/change-password", label: "Change Password", icon: <FiLock /> },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[var(--card-bg)] border-r border-theme flex flex-col 
      ${collapsed ? "w-20" : "w-64"} transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            {user?.name?.[0] || "U"}
          </div>

          {!collapsed && (
            <div>
              <div className="text-lg font-semibold text-[var(--text)]">
                AuthPanel
              </div>
              <div className="text-xs opacity-70">{user?.email}</div>
            </div>
          )}
        </div>

        <button
          ref={collapseBtnRef}
          onClick={() => setCollapsed((val) => !val)}
          className="p-2 rounded hover:bg-[var(--border)]"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="px-2 space-y-1">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors 
                  ${
                    isActive
                      ? "bg-blue-200 text-blue-900"
                      : "text-[var(--text)] hover:bg-[var(--border)]"
                  }`
                }
              >
                <span className="text-xl">{it.icon}</span>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.18 }}
                    >
                      {it.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom User + Logout */}
      <div className="p-3 border-t border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center">
            {user?.name?.[0] || "U"}
          </div>

          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs opacity-70">{user?.email}</div>
            </div>
          )}

          <button
            onClick={logoutUser}
            className="p-2 rounded hover:bg-[var(--border)]"
          >
            <FiLogOut className="text-lg text-red-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
