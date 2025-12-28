import { useState } from "react";
import API from "../api";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirm) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await API.patch("/auth/change-password", { oldPassword, newPassword });
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-md p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
      <h1 className="text-2xl font-semibold mb-4 text-[var(--text)]">
        Change Password
      </h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="p-3 border rounded bg-[var(--bg)] text-[var(--text)]"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="p-3 border rounded bg-[var(--bg)] text-[var(--text)]"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="p-3 border rounded bg-[var(--bg)] text-[var(--text)]"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
