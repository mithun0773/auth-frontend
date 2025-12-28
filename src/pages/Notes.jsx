import { useState, useEffect } from "react";
import API from "../api";
import { FiPlus, FiTrash2, FiEdit3, FiStar, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");

  const [newCatName, setNewCatName] = useState("");
  const colors = ["#ffffff", "#fff5c4", "#ffd6d6", "#d6ffe1", "#d6e9ff"];

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("fetch categories", err);
      toast.error("Failed to load categories");
    }
  };

  const fetchNotes = async (categoryId = null) => {
    try {
      const url = categoryId ? `/notes?categoryId=${categoryId}` : "/notes";
      const res = await API.get(url);
      // res.data is array of notes
      setNotes(res.data);
    } catch (err) {
      console.error("fetchNotes error", err);
      toast.error("Failed to fetch notes");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchNotes();
  }, []);

  // when filter changes
  useEffect(() => {
    fetchNotes(selectedCategoryId);
  }, [selectedCategoryId]);

  const createCategory = async () => {
    const name = newCatName?.trim();
    if (!name) return;
    try {
      const res = await API.post("/categories", { name });
      setCategories((c) => [res.data, ...c]);
      setNewCatName("");
      toast.success("Category created");
    } catch (err) {
      console.error("create category", err);
      toast.error(err.response?.data?.message || "Failed to create");
    }
  };

  const openCreate = () => {
    setEdit(null);
    setTitle("");
    setContent("");
    setColor("#ffffff");
    setOpen(true);
  };

  const startEdit = (n) => {
    setEdit(n);
    setTitle(n.title);
    setContent(n.content);
    setColor(n.color || "#ffffff");
    setOpen(true);
  };

  const saveNote = async () => {
    try {
      if (edit) {
        await API.patch(`/notes/${edit._id}`, {
          title,
          content,
          color,
          categoryId: selectedCategoryId || edit.category?._id || null,
        });
        toast.success("Note updated");
      } else {
        const res = await API.post("/notes", {
          title,
          content,
          color,
          categoryId: selectedCategoryId || null,
        });
        toast.success("Note added");
      }
      setOpen(false);
      fetchNotes(selectedCategoryId);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const deleteNote = async (id) => {
    if (!confirm("Delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      toast.success("Note deleted");
      fetchNotes(selectedCategoryId);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const togglePin = async (note) => {
    try {
      await API.patch(`/notes/${note._id}`, { pinned: !note.pinned });
      fetchNotes(selectedCategoryId);
    } catch (err) {
      console.error(err);
      toast.error("Pin failed");
    }
  };

  return (
    <div className="p-6 text-[var(--text)]">
      <div className="flex items-center gap-4">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg"
        >
          <FiPlus /> Add Note
        </button>

        <div>
          <label className="text-sm opacity-80 mr-2">Filter</label>
          <select
            value={selectedCategoryId || ""}
            onChange={(e) => setSelectedCategoryId(e.target.value || null)}
            className="p-2 border rounded"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <input
            placeholder="New category"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={createCategory}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="w-full max-w-lg p-6 rounded-xl shadow-lg bg-[var(--card-bg)] border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {edit ? "Edit Note" : "New Note"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-[var(--border)]"
              >
                <FiX />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 border border-[var(--border)] rounded mb-2 bg-[var(--bg)] text-[var(--text)]"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              rows={6}
              className="w-full p-2 border border-[var(--border)] rounded mb-3 bg-[var(--bg)] text-[var(--text)]"
            />

            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm opacity-80">Category:</label>
              <select
                className="p-2 border rounded"
                value={edit?.category?._id || selectedCategoryId || ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  // set selected category (used for new note)
                  setSelectedCategoryId(v);
                }}
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border ${
                    color === c ? "ring-2 ring-black" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 rounded bg-[var(--accent)] text-white"
              >
                {edit ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {notes.map((note) => (
          <motion.div
            key={note._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            style={{ background: note.color || "#fff" }}
            className="p-4 rounded-xl shadow border border-[var(--border)] relative"
          >
            <button
              onClick={() => togglePin(note)}
              className="absolute right-3 top-3 text-xl"
              title={note.pinned ? "Unpin" : "Pin"}
            >
              {note.pinned ? (
                <FiStar className="text-yellow-500" />
              ) : (
                <FiStar />
              )}
            </button>

            <h4 className="font-semibold text-[var(--text)]">{note.title}</h4>
            <div className="text-xs opacity-70 mb-2">{note.category?.name}</div>
            <p className="text-sm mt-2 text-[var(--text)]">{note.content}</p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(note)}
                  className="p-1 rounded hover:bg-[var(--border)]"
                >
                  <FiEdit3 />
                </button>
                <button
                  onClick={() => deleteNote(note._id)}
                  className="p-1 rounded hover:bg-[var(--border)] text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="text-xs opacity-70">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
