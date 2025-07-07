import { FaTimes } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useNotification } from "../../../context/notificationContext";

export default function NotificationPanel() {
  const {
    isOpen,
    setIsOpen,
    notifications,
  } = useNotification();

  const location = useLocation();
  const token = localStorage.getItem("token");

  const authRoutes = ["/login", "/forgot-password"];
  const isAuthPage = authRoutes.some((path) => location.pathname.includes(path));

  if (!isOpen || !token || isAuthPage) return null;

  return (
    <div className="fixed top-20 right-6 w-80 max-w-sm z-[1000]">
      <div className="bg-white border border-gray-200 shadow-2xl rounded p-5 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          aria-label="Close notifications"
        >
          <FaTimes size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-800">Notifications</h3>
          <p className="text-xs text-gray-500">Latest updates for your account</p>
        </div>

        <ul className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {notifications.length === 0 ? (
            <li className="text-center text-sm text-gray-400 py-4">
              No notifications available.
            </li>
          ) : (
            notifications.map((note) => (
              <li
                key={note._id}
                className={`bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-shadow shadow-sm ${
                  !note.read ? "font-semibold" : "font-normal"
                }`}
              >
                {note.message.toLowerCase().includes("rejected") ? (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    {note.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-800">{note.message}</p>
                )}
                <p className="text-gray-500 font-extralight text-right mt-1 text-[10px]">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
