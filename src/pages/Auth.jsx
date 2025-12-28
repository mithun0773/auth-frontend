import { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // <-- FIXED
import toast from "react-hot-toast";

export default function Auth() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate(); // <-- FIXED

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "register") {
        const res = await API.post("/auth/register", { name, email, password });
        loginUser(res.data.token, res.data.user);
        toast.success("Account created successfully!");
        navigate("/auth"); // <-- FIXED
      } else {
        const res = await API.post("/auth/login", { email, password });
        loginUser(res.data.token, res.data.user);
        toast.success("Logged in successfully!");
        navigate("/auth"); // <-- FIXED
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-center mb-6 text-blue-600">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-l-lg border ${
              mode === "login"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className={`px-4 py-2 rounded-r-lg border ${
              mode === "register"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
