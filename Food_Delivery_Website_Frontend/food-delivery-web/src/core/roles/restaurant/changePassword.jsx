import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

export default function ResChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleChangePassword = async () => {
    setError("");
    setSuccessMsg("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill out all the fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/restaurant/forgot-password/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail1: email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");

      setSuccessMsg("Password changed!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm space-y-4">
        <img src={logo} alt="Delivo Eats" className="mx-auto h-20" />
        <h2 className="font-bold text-lg text-center">Change Password</h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-[12px] flex items-center justify-center"
            role="alert"
          >
            <span className="text-base mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-[12px] flex items-center justify-center mr-2"
            role="alert"
          >
            <svg
            className="fill-current w-6 h-6 "
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>
            <span className="flex items-center ml-2 ">
              {successMsg}
              <button
                onClick={() => navigate("/restaurant/login")}
                className="underline text-blue-800 hover:text-blue-900 inline ml-2"
              >
               Login now
              </button>
            </span>
          </div>
        )}

        <div className="space-y-4 text-left text-sm font-normal">
          <div>
            <label className="mb-1 block text-black">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>
          <div>
            <label className="mb-1 block text-black">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition "
          >
            {loading ? "Changing..." : "Change"}
          </button>
        </div>
      </div>
    </div>
  );
}
