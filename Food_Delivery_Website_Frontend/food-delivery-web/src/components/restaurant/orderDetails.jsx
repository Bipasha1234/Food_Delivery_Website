import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import Header from "../../core/roles/restaurant/header";

const SOCKET_SERVER_URL = "http://localhost:5000";
export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("restaurantToken");
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Delivered");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const statuses = ["Order Taken", "Preparing", "Handed to Delivery", "Coming to Address","Delivered"];
 const [socket, setSocket] = useState(null);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch order details");

        const data = await res.json();
        setOrder(data);
        setSelectedStatus(data.status);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);
useEffect(() => {
  const newSocket = io(SOCKET_SERVER_URL, {
    auth: { token }
  });
  setSocket(newSocket);

  if (restaurantId) {
    newSocket.emit("joinRoom", restaurantId);
  }

  newSocket.on("orderStatusUpdated", (update) => {
    if (update.orderId === orderId) {
      setOrder((prev) => (prev ? { ...prev, status: update.status } : prev));
      setSelectedStatus(update.status);
    }
  });

  return () => {
    newSocket.disconnect();
  };
}, [orderId, token, restaurantId]);


  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/inside/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      const updatedData = await res.json();

      // navigate back with updated order info
      navigate(`/restaurant/view-order/${restaurantId}`, {
        state: { updatedOrder: updatedData.order }
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading order details...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!order) return <p className="text-center mt-10">Order not found.</p>;

  return (
    <div className="min-h-screen text-black">
      <Header active="View Order" />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6 text-sm mt-20">
        <div className="bg-white rounded shadow p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold">Order ID: {order._id}</h2>
            <span className="text-xs text-gray-500">{order.date} | {order.time}</span>
          </div>

          <div className="pt-4 border-t space-y-1 text-sm">
            <h3 className="font-medium">Order Details</h3>
            {order.basket.map((item, idx) => (
             <div key={idx} className="flex justify-between items-start p-3 bg-white rounded-lg shadow-sm border mb-2">
          <div className="flex-1 pr-4">
            <p className="font-semibold text-sm text-gray-800">{item.name}</p>
            {item.note && (
              <p className="text-xs italic text-gray-500 mt-1">
                📝 {item.note}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1">
            <p className="text-black font-semibold text-sm">x{item.quantity}</p>
            <p className="font-semibold text-sm text-gray-700">Rs. {item.price}</p>
          </div>
        </div>

            ))}

            <div className="flex justify-between pt-2">
              <p className="text-xs font-normal pt-2">Delivery Charge: </p>
              <p className="text-xs font-normal mt-1">Rs. {order.deliveryFee?.toFixed(2)}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-xs text-green-600 font-normal">Offer Applied: </p>
              <p className="text-xs text-green-600 font-normal">{order.offerPercentage}%</p>
            </div>
          </div>

          <hr />

          <div className="space-y-2">
            <p className="text-xs text-gray-700">Payment Method: {order.paymentMethod}</p>
            <h3 className="font-medium text-sm">Deliver To:</h3>
            <p className="font-normal text-xs text-gray-700">{order.address}</p>
            <div className="pt-2 flex justify-between font-bold text-base">
              <span>Total to pay</span>
              <span>Rs. {order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6 space-y-4">
          <h3 className="font-medium">Special Request</h3>
          <p className="text-xs text-gray-700">{order.specialInstructions || "None"}</p>

          <div className="bg-orange-200 rounded-lg px-4 py-4 space-y-2 text-center">
            {statuses.map((status) => (
              <div
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`cursor-pointer py-1 font-normal text-sm hover:bg-[#dad8d4] rounded flex justify-center items-center gap-2 ${
                  selectedStatus === status ? "bg-white" : ""
                }`}
              >
                {status}
                {selectedStatus === status && (
                  <svg
                      className="fill-current w-6 h-6 "
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
                    </svg>
                )}
              </div>
            ))}
          </div>

        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
