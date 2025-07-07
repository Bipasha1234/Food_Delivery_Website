import { FaBell } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import img1 from "../assets/images/logo.png";
import { useNotification } from "../context/notificationContext";
import { useProfile } from "../context/profileContext";

export default function AfterLoginPageHeader() {
  const { toggleNotifications, isOpen, unreadCount } = useNotification();
  const { toggleProfile, isProfileOpen } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomeActive =
    location.pathname === "/delivo-eats" ||
    location.pathname === "/delivo-eats/location";

  const handleProtectedClick = (path) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token.trim() === "") {
      navigate("/login", { state: { from: path } }); 
    } else {
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-20 flex items-center justify-between p-4 shadow-md bg-white">
      <div className="flex items-center space-x-2">
        <Link to="/delivo-eats">
          <img
            src={img1}
            className="h-20 mt-2 w-28 object-contain cursor-pointer"
            alt="DelivoEats Logo"
          />
        </Link>
      </div>

      <nav className="flex space-x-20 text-base">
        <NavLink
          to="/delivo-eats"
          className={`transition ${isHomeActive ? "underline underline-offset-4" : ""}`}
        >
          Home
        </NavLink>

        <NavLink
          to="/delivo-eats/all-restaurant"
          className={({ isActive }) =>
            isActive ? "underline underline-offset-4 transition" : "transition"
          }
        >
          Restaurants
        </NavLink>

        <button
          onClick={() => handleProtectedClick("/delivo-eats/track-order")}
          className={`transition bg-transparent ${
            location.pathname === "/delivo-eats/track-order" ? "underline underline-offset-4" : ""
          }`}
        >
          Track Order
        </button>

        <NavLink
          to="/delivo-eats/mybag"
          className={({ isActive }) =>
            isActive ? "underline underline-offset-4 transition" : "transition"
          }
        >
          My Bag
        </NavLink>
      </nav>

      <div className="flex items-center space-x-9 text-black mr-3 relative">
        <button
          onClick={toggleNotifications}
          className={`text-xl hover:text-orange-500 relative ${
            isOpen ? "text-orange-500" : ""
          }`}
          title="Notifications"
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="absolute top-[-4px] right-[-12px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={toggleProfile}
          className={`hover:text-orange-500 text-xl ${
            isProfileOpen ? "text-orange-500" : ""
          }`}
          title="My Profile"
        >
          <FaUser />
        </button>
      </div>
    </header>
  );
}
