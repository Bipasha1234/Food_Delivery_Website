import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import OrderHistory from "../../../components/restaurant/orderHistory";
import Header from "../../../core/roles/restaurant/header";

export default function ViewOrder() {
  const [activeTab, setActiveTab] = useState("Accepted");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { restaurantId } = useParams();
  const token = localStorage.getItem("restaurantToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!restaurantId || !token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/restaurant2/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [restaurantId, token]);

  const calculateCountdown = (acceptedTime) => {
    const prepTimeMinutes = 30;
    const targetTime = new Date(acceptedTime).getTime() + prepTimeMinutes * 60000;
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) return "0 min";
    const minutes = Math.ceil(diff / 60000);
    return `${minutes} min`;
  };

  const handleStatusClick = (orderId) => {
    navigate(`/restaurant/order/${orderId}`);
  };

  const activeStatuses = ["Accepted", "Order Taken", "Preparing", "Coming to Address","Handed to Delivery"];

  return (
    <div className="min-h-screen text-black">
      <Header active="View Order" />

      <div className="max-w-5xl mx-auto px-6 py-10 mt-20">
        <div className="flex gap-4 mb-6 justify-center items-center">
          <button
            onClick={() => setActiveTab("Accepted")}
            className={` ${
              activeTab === "Accepted" ? "bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition" : "text-gray-500 text-sm  rounded border transition h-10 w-32 font-normal"
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setActiveTab("History")}
            className={` ${
              activeTab === "History" ? "bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition" : "text-gray-500 text-sm  rounded border transition h-10 w-32 font-normal"
            }`}
          >
            History
          </button>
        </div>

        {activeTab === "Accepted" ? (
          loading ? (
            <p>Loading accepted orders...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="space-y-4">
              {orders
                .filter(order => activeStatuses.includes(order.status))
                .map((order) => (
                  <div
                    key={order._id}
                    className="bg-white shadow-sm p-4 rounded-md flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm font-semibold">Order ID: {order._id}</div>
                      <div className="text-xs text-gray-500">
                         {order.createdAt?.slice(0, 10)} &nbsp;&nbsp;|&nbsp;&nbsp; {order.date} &nbsp;&nbsp;|&nbsp;&nbsp; {order.time} 
                      </div>
                      
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleStatusClick(order._id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium  h-10 w-32 rounded hover:bg-300 transition text-[12px]"
                      >
                        {order.status}
                      </button>

                      <div className="flex items-center text-xs text-gray-500 gap-1 mt-10">
                        <FaClock size={12} />
                        <span>{calculateCountdown(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )
        ) : (
          <OrderHistory />
        )}
      </div>
    </div>
  );
}
