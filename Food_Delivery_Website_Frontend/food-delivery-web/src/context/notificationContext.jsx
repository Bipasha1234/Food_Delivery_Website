import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/admin/notifications/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // Mark all unread notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await axios.post(
        "http://localhost:5000/api/admin/notifications/mark-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // After marking read on backend, re-fetch notifications to sync
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  // Initialize socket connection
useEffect(() => {
  if (!token) return;

  const newSocket = io("http://localhost:5000", {
    auth: { token },
  });

  newSocket.emit("joinRoom", "adminRoom");

  setSocket(newSocket);

  newSocket.on("newNotification", (notification) => {
    console.log("📥 Received new notification:", notification);
    setNotifications((prev) => [notification, ...prev]);
  });

  return () => {
    newSocket.disconnect();
  };
}, [token]);



  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // When notification panel opens, mark unread notifications as read
  useEffect(() => {
    if (isOpen && notifications.some((n) => !n.read)) {
      markAllAsRead();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const toggleNotifications = () => setIsOpen((prev) => !prev);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        isOpen,
        setIsOpen,
        toggleNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
