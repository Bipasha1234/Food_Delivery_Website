import axios from "axios";
import { useEffect, useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import img from "../../../assets/images/logo.png";
// Connect once outside the component
const socket = io("http://localhost:5000");

export default function Header({ active = "Home" }) {
  const { restaurantId: urlRestaurantId } = useParams();
  const restaurantId = urlRestaurantId || localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  const [isOnline, setIsOnline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const restaurantToken = localStorage.getItem("restaurantToken");
  const adminToken = localStorage.getItem("adminToken");

  // Fetch online status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/restaurant/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${restaurantToken}`,
            },
          }
        );
        setIsOnline(res.data.isOnline || false);
      } catch (err) {
        console.error("Error fetching online status:", err);
      }
    };

    if (restaurantId && restaurantToken) {
      fetchStatus();
    }
  }, [restaurantId, restaurantToken]);

  // Socket: listen for restaurant status update
  useEffect(() => {
    const handleStatusUpdate = ({ restaurantId: updatedId, isOnline: updatedStatus }) => {
      if (updatedId === restaurantId) {
        setIsOnline(updatedStatus);
      }
    };

    socket.on("restaurantStatusUpdate", handleStatusUpdate);
    return () => socket.off("restaurantStatusUpdate", handleStatusUpdate);
  }, [restaurantId]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/notifications/get",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
      if (!token) return;
    try {
      await axios.post(
        "http://localhost:5000/api/admin/notifications/mark-read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  // Fetch & listen to notifications
  useEffect(() => {
    fetchNotifications();

    const socketNotif = io("http://localhost:5000", {
      auth: { token: adminToken },
    });

    socketNotif.emit("joinRoom", "adminRoom");

    socketNotif.on("newNotification", (notification) => {
      console.log("📥 New notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => socketNotif.disconnect();
  }, [adminToken]);

  // When dropdown opens, mark as read
  useEffect(() => {
    if (showNotification && unreadCount > 0) {
      markAllAsRead();
    }
  }, [showNotification]);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    try {
      await axios.put(
        `http://localhost:5000/api/restaurant/status/${restaurantId}`,
        { isOnline: newStatus },
        {
          headers: {
            Authorization: `Bearer ${restaurantToken}`,
          },
        }
      );
      setIsOnline(newStatus);
      socket.emit("updateRestaurantStatus", { restaurantId, isOnline: newStatus });
    } catch (err) {
      console.error("Failed to update online status:", err);
    }
  };

  const navTabs = [
    {img:img},
    { label: "Home", path: `/restaurant/home/${restaurantId}` },
    { label: "View Order", path: `/restaurant/view-order/${restaurantId}` },
    { label: "Menu", path: "/restaurant/menu" },
    { label: "Profile", path: "/restaurant/profile" },
    { icon: <FaBell size={18} />, label: "Notifications", path: "#" },
  ];
//icon and notifications bell need now-
  return (
    <header className="bg-white shadow z-20 relative h-20">
      
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-5 space-y-3 md:space-y-0">
        
        <nav className="w-full md:w-auto flex justify-around md:justify-start md:space-x-40 text-sm items-center font-normal text-black">
          
          {navTabs.map((tab, idx) =>
    tab.img ? (
      <img
        key={idx}
        src={tab.img}
        alt="Logo"
        className="h-12 w-auto  cursor-pointer"
        onClick={() => navigate(`/restaurant/home/${restaurantId}`)}
      />
    ) : (
            <button
              key={tab.label}
              onClick={() =>
                tab.label === "Notifications"
                  ? setShowNotification(!showNotification)
                  : navigate(tab.path)
              }
             className={`relative transition-all duration-150 flex items-center justify-center ${
          tab.label === active ? "border-b-[2px] border-black font-semibold" : ""
        }`}
        style={tab.icon ? { width: 36, height: 36 } : {}}
      >
        {tab.icon ? (
          <>
            {tab.icon}
            {tab.label === "Notifications" && unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-2 py-[1px]">
                {unreadCount}
              </span>
            )}
          </>
        ) : (
          tab.label
        )}
      </button>
    )
  )}
</nav>

        <div className="flex items-center gap-1 text-xs">
          <span className={`font-medium ${isOnline ? "text-green-700" : "text-red-600"}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
          <div
            onClick={handleToggleOnline}
            className={`w-12 h-6 flex items-center bg-white border rounded cursor-pointer px-1 ${
              isOnline ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full transition ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotification && (
        <div className="absolute right-5 top-12 w-80 bg-white shadow-lg rounded border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800 text-base">Notifications</h2>
            <FaTimes
              className="text-gray-500 cursor-pointer"
              onClick={() => setShowNotification(false)}
            />
          </div>

       
          <div className="max-h-96 overflow-y-auto divide-y">
            {notifications.length > 0 ? (
              notifications.map((note, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-600 mt-1">{note.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1 text-end">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">No notifications found.</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
