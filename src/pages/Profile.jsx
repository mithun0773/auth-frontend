import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-10 text-[var(--text)]">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
        My Profile
      </h1>

      <div className="mt-6 bg-[var(--card-bg)] text-[var(--text)] border border-theme shadow-md p-6 rounded-xl max-w-md">
        <p className="text-lg">
          <strong>Name:</strong> {user?.name}
        </p>

        <p className="text-lg mt-2">
          <strong>Email:</strong> {user?.email}
        </p>

        <Link
          to="/auth/edit-profile"
          className="mt-6 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
