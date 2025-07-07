import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaShoppingBag,
  FaStore,
  FaWallet,
} from "react-icons/fa";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer
} from "recharts";
import Sidebar from "./sidebar";

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerStats, setCustomerStats] = useState({ totalCustomers: 0, customerGrowth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
    fetchRequests();
    fetchOrders();
    fetchCustomerStats();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/restaurants", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurants(res.data);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/get-listed", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/orders/all-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/customer/admin/customers/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerStats(res.data);
    } catch (err) {
      console.error("Failed to fetch customer stats:", err);
    }
  };

  const statsData = [
    { name: "Total Customers", value: customerStats.totalCustomers || 0, color: "#F87171" },
    { name: "Customer Growth", value: customerStats.customerGrowth  || 0, color: "#34D399" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F6FB] text-black">
      <Sidebar />

      <div className="flex-1 px-6 py-8">
        <div className="flex justify-end pr-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hello, Admin</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<FaStore />} label="Total Restaurants" value={restaurants.length} />
          <StatCard icon={<FaClipboardList />} label="Total Orders" value={orders.length} />
          <StatCard icon={<FaShoppingBag />} label="Orders Delivered" value={orders.filter(o => o.status === 'Delivered').length} />
          <StatCard icon={<FaWallet />} label="New Requests" value={pendingRequests.length} />
        </div>

        {/* Pie Charts */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-base font-semibold mb-4">Customer Stats</h2>
          <div className="flex justify-around flex-wrap gap-4">
           {statsData.map((item, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={[item]}
                dataKey="value"
                nameKey="name"
                innerRadius={30}
                outerRadius={40}
                startAngle={90}
                endAngle={-270}
              >
                <Cell key={`cell-${i}`} fill={item.color} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="text-sm mt-1">{item.name}</span>
          <span className="text-md font-bold">{item.value}%</span>

          {item.name === "Customer Growth" && (
            <span className="text-[11px] text-gray-500">vs. last month</span>
          )}
        </div>
      ))}

          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-base font-semibold mb-4">Restaurant Lists</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading restaurants...</p>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((r) => (
                <div
                  key={r._id}
                  className="bg-[#fafafa] rounded shadow-md p-4 border border-gray-200"
                >
                  <h3 className="text-sm font-medium text-[#333] mb-1">
                    {r.restaurantName}
                  </h3>
                  <p className="text-xs text-gray-600">
                    <strong className="font-normal text-xs">Contact:</strong> {r.phone}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong className="font-normal text-xs">Email:</strong> {r.ownerEmail1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No accepted restaurants found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center gap-4">
      <div className="bg-orange-400 p-2 rounded-full text-white text-xl">{icon}</div>
      <div>
        <h4 className="text-sm font-medium text-gray-600">{label}</h4>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;
