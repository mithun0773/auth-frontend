import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Checking session...
      </div>
    );

  if (!user) return <Navigate to="/" replace/>;

  return children;
}
