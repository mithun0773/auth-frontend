import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import {
  FiActivity,
  FiCheckCircle,
  FiList,
  FiFileText,
  FiStar,
} from "react-icons/fi";

// Upgraded single-file Dashboard with embedded small components
// Replace your existing Dashboard.jsx with this file (or split into components as you like)

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalNotes: 0,
    pinnedNotes: 0,
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [weekly, setWeekly] = useState([]); // last 7 days summary {date, tasks, notes}
  const [heatmap, setHeatmap] = useState([]); // last 30 days [{date,count}]
  const [loading, setLoading] = useState(true);

  // Fetch all data in parallel
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [tasksRes, notesRes, heatRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/notes"),
          API.get("/tasks/activity/heatmap").catch(() => ({ data: [] })),
        ]);

        const tasks = tasksRes.data || [];
        const notes = notesRes.data || [];
        const heat = heatRes.data || [];

        // stats
        const completed = tasks.filter((t) => t.completed).length;
        const pending = tasks.length - completed;

        setStats({
          totalTasks: tasks.length,
          completedTasks: completed,
          pendingTasks: pending,
          totalNotes: notes.length,
          pinnedNotes: notes.filter((n) => n.pinned).length,
        });

        // recent lists
        const recentNotesSorted = [...notes]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        const recentTasksSorted = [...tasks]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentNotes(recentNotesSorted);
        setRecentTasks(recentTasksSorted);

        // weekly summary (last 7 days)
        const days = 7;
        const today = new Date();
        const dates = [...Array(days)].map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (days - 1 - i));
          return d;
        });

        const weeklyData = dates.map((d) => {
          const key = d.toISOString().split("T")[0];
          const tasksCount = tasks.filter(
            (t) => new Date(t.createdAt).toISOString().split("T")[0] === key
          ).length;
          const notesCount = notes.filter(
            (n) => new Date(n.createdAt).toISOString().split("T")[0] === key
          ).length;
          return { date: key, tasks: tasksCount, notes: notesCount };
        });

        setWeekly(weeklyData);
        setHeatmap(heat.length ? heat : makeHeatmapFromTasks(tasks));
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback local heatmap builder if backend route missing
  function makeHeatmapFromTasks(tasks) {
    const days = 30;
    const today = new Date();
    const dates = [...Array(days)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    });

    return dates.reverse().map((date) => ({
      date,
      count: tasks.filter(
        (t) => new Date(t.createdAt).toISOString().split("T")[0] === date
      ).length,
    }));
  }

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's a quick overview of your workspace
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Member since</div>
          <div className="text-sm font-medium">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "-"}
          </div>
        </div>
      </header>

      {/* STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Tasks"
          value={stats.totalTasks}
          icon={<FiList />}
          accent="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={<FiCheckCircle />}
          accent="bg-gradient-to-br from-green-500 to-green-700"
        />
        <StatCard
          title="Pending"
          value={stats.pendingTasks}
          icon={<FiActivity />}
          accent="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />
        <StatCard
          title="Notes"
          value={stats.totalNotes}
          icon={<FiFileText />}
          accent="bg-gradient-to-br from-pink-400 to-pink-600"
        />
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Charts + Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2">Task Completion</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    Completed vs Pending
                  </div>
                  <div className="mt-2 w-full h-24 flex items-end gap-1">
                    {/* simple bars */}
                    <MiniBar
                      label="Completed"
                      value={stats.completedTasks}
                      color="#10B981"
                    />
                    <MiniBar
                      label="Pending"
                      value={stats.pendingTasks}
                      color="#F97316"
                    />
                  </div>
                </div>
                <div className="w-28 h-28 flex items-center justify-center">
                  <Donut
                    percent={
                      stats.totalTasks
                        ? Math.round(
                            (stats.completedTasks / stats.totalTasks) * 100
                          )
                        : 0
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2">Weekly Summary</h3>
              <WeeklyBars data={weekly} />
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">Activity (Last 30 days)</h3>
            <HeatmapGrid data={heatmap} />
          </div>
        </div>

        {/* Right column: Recent notes, recent tasks, timeline */}
        <aside className="space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Notes</h3>
              <span className="text-xs text-gray-500">
                {recentNotes.length} shown
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {recentNotes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet.</p>
              ) : (
                recentNotes.map((n) => <NotePreview key={n._id} note={n} />)
              )}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Tasks</h3>
              <span className="text-xs text-gray-500">
                {recentTasks.length} shown
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {recentTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks yet.</p>
              ) : (
                recentTasks.map((t) => <TaskPreview key={t._id} task={t} />)
              )}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold">Activity Timeline</h3>
            <ActivityTimeline
              tasks={recentTasks}
              notes={recentNotes}
              user={user}
            />
          </div>
        </aside>
      </section>

      {loading && (
        <div className="text-sm text-gray-500">Loading dashboard...</div>
      )}
    </div>
  );
}

/* -------------------- Small subcomponents -------------------- */
function StatCard({ title, value, icon, accent }) {
  return (
    <div
      className="p-4 rounded-xl shadow-sm flex items-center gap-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
      }}
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${accent}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, color = "#4F46E5" }) {
  const height = Math.min(120, Math.max(6, value * 8)); // scaled
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full h-full flex items-end">
        <div
          style={{ height, background: color, width: "60%", borderRadius: 6 }}
          className="mx-auto"
        />
      </div>
      <div className="text-xs mt-2 text-gray-600">{label}</div>
    </div>
  );
}

function Donut({ percent = 0 }) {
  const stroke = 10;
  const size = 72;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e6e6e6"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#4F46E5"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="6"
        fontSize="14"
        fill="var(--text)"
      >
        {percent}%
      </text>
    </svg>
  );
}

function WeeklyBars({ data = [] }) {
  if (!data || data.length === 0)
    return <div className="text-sm text-gray-500">No weekly data</div>;
  const max = Math.max(...data.map((d) => Math.max(d.tasks, d.notes)), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center">
          <div className="w-full h-full flex items-end gap-0.5">
            <div
              style={{ height: `${(d.tasks / max) * 100}%` }}
              className="w-full bg-indigo-500 rounded-t"
            ></div>
          </div>
          <div className="text-xs mt-2 text-gray-500">{d.date.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function HeatmapGrid({ data = [] }) {
  // data = [{date:'YYYY-MM-DD', count}]
  if (!data || data.length === 0)
    return <div className="text-sm text-gray-500">No activity</div>;

  // Build 7 columns (weeks) layout similar to GitHub but here horizontal days
  // We'll render as 6 rows x 7 cols to cover ~30 days
  const days = data;
  const cols = 7;
  const rows = Math.ceil(days.length / cols);
  const grid = Array.from({ length: rows }, (_, r) =>
    days.slice(r * cols, r * cols + cols)
  );

  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-rows-6 gap-1">
        {grid.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date} — ${cell.count}`}
                className="w-8 h-8 rounded"
                style={{ background: colorForCount(cell.count, max) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        More saturated = more activity
      </div>
    </div>
  );
}

function colorForCount(count, max) {
  if (!count) return "#e6eef2";
  const ratio = count / max;
  if (ratio <= 0.25) return "#bbf7d0";
  if (ratio <= 0.5) return "#86efac";
  if (ratio <= 0.75) return "#34d399";
  return "#059669";
}

function NotePreview({ note }) {
  return (
    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-[var(--text)]">
            {note.title || "Untitled"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-sm text-yellow-500">
          {note.pinned ? <FiStar /> : null}
        </div>
      </div>
      <div className="text-sm mt-2 text-[var(--text)] opacity-90">
        {(note.content || "").slice(0, 120)}
        {(note.content || "").length > 120 ? "..." : ""}
      </div>
    </div>
  );
}

function TaskPreview({ task }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
      <div>
        <div className="font-medium text-[var(--text)]">{task.title}</div>
        <div className="text-xs text-gray-500">
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            task.priority === "high"
              ? "bg-red-100 text-red-600"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {task.priority}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            task.completed
              ? "bg-green-600 text-white"
              : "bg-gray-400 text-white"
          }`}
        >
          {task.completed ? "Done" : "Pending"}
        </span>
      </div>
    </div>
  );
}

function ActivityTimeline({ tasks = [], notes = [], user }) {
  // Build simple combined list of events
  const items = [];
  tasks.forEach((t) =>
    items.push({
      type: "task",
      when: t.createdAt,
      text: `Created task: ${t.title}`,
    })
  );
  notes.forEach((n) =>
    items.push({
      type: "note",
      when: n.createdAt,
      text: `Added note: ${n.title || "Untitled"}`,
    })
  );
  items.sort((a, b) => new Date(b.when) - new Date(a.when));
  const slice = items.slice(0, 6);

  return (
    <div className="space-y-2 text-sm">
      {slice.length === 0 && (
        <div className="text-gray-500">No recent activity</div>
      )}
      {slice.map((it, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full mt-2 bg-indigo-500" />
          <div>
            <div className="text-[var(--text)]">{it.text}</div>
            <div className="text-xs text-gray-500">
              {new Date(it.when).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
