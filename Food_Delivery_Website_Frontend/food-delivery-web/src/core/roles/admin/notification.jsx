import axios from "axios";
import { useState } from "react";
import Sidebar from "./sidebar";

export default function Notifications() {
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    if (message.trim() === "") {
      setErrorMsg("Please enter a message.");
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:5000/api/admin/notifications/send',
        { message },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMsg("Notification sent successfully.");
      setMessage(""); 
    } catch (error) {
      console.error("Error sending notification:", error);
      setErrorMsg("Failed to send notification.");
    }
  };

  return (
    <div className="flex bg-[#F7F6FB] min-h-screen">
      <Sidebar />

      <div className="flex-1 px-8 py-10">
        <div className="flex justify-end pr-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hello, Admin</span>
          </div>
        </div>

        <h2 className="text-base font-semibold mb-6">Notifications</h2>

        <div className="bg-white p-6 rounded-xl shadow max-w-5xl">
          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm mb-4 flex justify-center items-center">
               <svg
              className="fill-current w-6 h-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
            </svg>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4 flex justify-center items-center">
              ⚠️ {errorMsg}
            </div>
          )}

          <label className="block mb-2 font-medium text-sm text-gray-700">
            Write notification:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Type your message here..."
            className="w-full border border-gray-300 rounded px-4 py-2 resize-none text-sm focus:outline-none "
          />

          <div className="text-center mt-6">
            <button
              onClick={handleSend}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
