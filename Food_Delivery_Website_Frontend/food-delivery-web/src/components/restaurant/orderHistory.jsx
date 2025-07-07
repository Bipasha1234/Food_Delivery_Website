import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function OrderHistory() {
  const { restaurantId } = useParams();
  const token = localStorage.getItem("restaurantToken");
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!restaurantId || !token) return;

    const fetchHistoryOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/restaurant2/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch order history");
        const data = await res.json();
        const filteredOrders = data.filter(order =>
          order.status === "Delivered" || order.status === "Rejected"
        );

        setHistoryOrders(filteredOrders);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order history:", err);
        setError("Failed to load order history.");
        setLoading(false);
      }
    };

    fetchHistoryOrders();
  }, [restaurantId, token]);

  return (
    <div className="min-h-screen text-black">
      <div className="max-w-5xl mx-auto p-4">
        {loading ? (
          <p>Loading order history...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : historyOrders.length === 0 ? (
          <p>No history orders found.</p>
        ) : (
          <div className="space-y-4">
            {historyOrders.map((order, i) => (
              <div
                key={order._id}
                className="bg-white shadow-sm p-4 rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-semibold">Order ID: {order._id}</div>
                  <div className="text-xs text-gray-500">
                      {order.createdAt?.slice(0, 10)}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div
                    className={`font-semibold mb-1 ${
                      order.status === "Delivered" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {order.status}
                  </div>
                  <div className="text-xs text-gray-500">Rs. {order.total?.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
