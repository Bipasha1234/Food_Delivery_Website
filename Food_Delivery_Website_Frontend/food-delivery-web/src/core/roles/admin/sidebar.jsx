import { FaBell, FaFileAlt, FaSignOutAlt, FaUtensils } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import img from '../../../assets/images/logo.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    {
      label: "Dashboard",
      icon: <FaUtensils />,
      path: "/admin",
    },
    {
      label: "Requests",
      icon: <FaFileAlt />,
      path: "/admin/requests",
    },
    {
      label: "Notifications",
      icon: <FaBell />,
      path: "/admin/notifications",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <aside className="w-[200px] bg-white min-h-screen px-6 py-8 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center mb-4">
          <img
            src={img}
            alt="Logo"
            className="h-20 mt-2 w-28 object-contain"
          />
        </div>

        <div className="flex flex-col gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-3 h-10 w-32 px-1 text-sm rounded font-normal ${
                  isActive
                    ? "bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-36 rounded hover:bg-300 transition"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-center">
        <button
          onClick={handleLogout}
          className=" text-white bg-red-500 flex items-center justify-center gap-2 hover:bg-red-600 font-medium text-sm h-10 w-32 rounded  transition"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
      </div>

      
    </aside>
  );
}
