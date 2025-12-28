import { useState, useEffect } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { FiTrash2, FiEdit3, FiCheck } from "react-icons/fi";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return toast.error("Task title required");

    try {
      const res = await API.post("/tasks", { title, priority });
      setTasks([res.data.task, ...tasks]);
      setTitle("");
      setPriority("low");
      toast.success("Task added!");
    } catch (err) {
      toast.error("Add failed");
    }
  };

  const toggleComplete = async (task) => {
    try {
      const updated = await API.patch(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      setTasks(tasks.map((t) => (t._id === task._id ? updated.data : t)));
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success("Deleted!");
    } catch (err) {
      toast.error("Delete failed");
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      {/* Create Task */}
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow mb-6 flex gap-3">
        <input
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-2 border rounded bg-[var(--bg)]"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="p-2 border rounded bg-[var(--bg)]"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          onClick={addTask}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t._id}
            className="bg-[var(--card-bg)] p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <div
                className={`text-lg font-semibold ${
                  t.completed ? "line-through opacity-50" : ""
                }`}
              >
                {t.title}
              </div>
              <div className="text-sm opacity-60 capitalize">
                Priority: {t.priority}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleComplete(t)}
                className="p-2 rounded bg-green-500 text-white"
              >
                <FiCheck />
              </button>

              <button
                onClick={() => deleteTask(t._id)}
                className="p-2 rounded bg-red-500 text-white"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
