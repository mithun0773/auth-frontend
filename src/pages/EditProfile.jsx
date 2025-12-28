import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function EditProfile() {
  const { user, loginUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await API.patch("/auth/update", { name, email });
      loginUser(localStorage.getItem("token"), res.data.user);
      toast.success("Profile Updated!");
      navigate("/auth/profile");
    } catch (err) {
      console.log("FRONTEND ERROR:", err.response?.data || err.message);
      toast.error("Update failed!");
    }
  };

  return (
    <div className="p-10 text-[var(--text)]">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
        Edit Profile
      </h1>

      <form
        onSubmit={handleUpdate}
        className="mt-6 bg-[var(--card-bg)] border border-[var(--border)] shadow-md p-6 rounded-xl max-w-md flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Full Name"
          className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="bg-[var(--accent)] text-white py-2 rounded-xl hover:bg-[var(--accent-hover)] transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
