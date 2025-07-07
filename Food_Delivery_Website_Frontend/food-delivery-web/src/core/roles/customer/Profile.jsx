import { useEffect, useState } from "react";
import { FaHeart, FaHistory, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../../../context/notificationContext";
import { useProfile } from "../../../context/profileContext";

export default function ProfilePanel() {
  const { isProfileOpen, setIsProfileOpen } = useProfile();
  const { setIsOpen } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("Loading...");

  const token = localStorage.getItem("token");

  const authRoutes = ["/login", "/forgot-password"];
  const isAuthPage = authRoutes.some((path) => location.pathname.includes(path));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/customer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user profile");

        const data = await res.json();
        setUserName(data.fullName);
      } catch (err) {
        console.error(err);
        setUserName("Guest");
      }
    };

    if (isProfileOpen && token && !isAuthPage) {
      fetchUserProfile();
    }
  }, [isProfileOpen, token, isAuthPage]);
  if (!isProfileOpen || !token || isAuthPage) return null;

  const goToSettings = () => {
    setIsProfileOpen(false);
    navigate("/delivo-eats/account");
  };

  const goToAccountTab = (tab) => {
  setIsProfileOpen(false);
  navigate("/delivo-eats/account", { state: { tab } });
};

   const handleLogout = () => {
    // Clear user tokens/local storage or auth context
    localStorage.removeItem("token");
    // ... any other cleanup ...

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="fixed top-20 right-6 w-80 max-w-sm z-[1000]">
      <div className="bg-white shadow-xl rounded px-6 py-5 relative border border-gray-200">
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
        >
          <FaTimes size={16} />
        </button>
        <h3 className="text-base font-semibold text-start mb-4">My Profile</h3>

        <div className="flex flex-row items-center space-x-6 justify-center">
          <p className="font-normal text-sm">{userName}</p>
          <button
            onClick={goToSettings}
            className="text-sm font-bold underline hover:text-black text-gray-700 transition"
          >
            Edit
          </button>
        </div>

        <div className="mt-6 space-y-4">
              <button
  onClick={() => goToAccountTab("history")}
  className="flex items-center space-x-3 hover:text-black text-gray-700"
>
  <FaHistory className="text-lg" />
  <span className="text-sm font-normal">Order History</span>
</button>

<button
  onClick={() => goToAccountTab("favorites")}
  className="flex items-center space-x-3 hover:text-black text-gray-700"
>
  <FaHeart className="text-lg" />
  <span className="text-sm font-normal">Favorites</span>
</button>

        </div>

        <div className="mt-6 flex justify-center items-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm h-10 w-32 rounded transition flex justify-center items-center gap-2"
          >
              <FaSignOutAlt />
              
          <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
