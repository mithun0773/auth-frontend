import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function Header() {
  const { dark, toggle } = useContext(ThemeContext);

  return (
    <header
      className="
        sticky top-0 
        bg-[var(--card-bg)]
        border-b border-theme
        px-6 py-3
        flex justify-between items-center
      "
    >
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <button
        onClick={toggle}
        className="p-2 rounded-lg hover:bg-[var(--border)] transition"
      >
        {dark ? <FiSun className="text-yellow-400" /> : <FiMoon />}
      </button>
    </header>
  );
}
