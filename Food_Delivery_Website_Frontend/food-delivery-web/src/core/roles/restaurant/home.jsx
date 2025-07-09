import { useEffect, useRef, useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "./header";

export default function RestaurantHome() {
  const { restaurantId } = useParams();
  const token = localStorage.getItem("restaurantToken");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offersError, setOffersError] = useState("");
  const [orderStatuses, setOrderStatuses] = useState({});
  const [orderReasons, setOrderReasons] = useState({});

  const socketRef = useRef(null);

  useEffect(() => {
    if (!restaurantId || !token) return;

    async function fetchOrders() {
      try {
        setLoadingOrders(true);
        setOrdersError("");
        const res = await fetch(`http://localhost:5000/api/orders/restaurant/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        setOrders(data);
        setLoadingOrders(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError("Failed to load orders.");
        setLoadingOrders(false);
      }
    }

    fetchOrders();

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      socketRef.current.emit("joinRoom", restaurantId);
    });

    // Listen for new orders
    socketRef.current.on("newOrder", (newOrder) => {
      console.log("New order received:", newOrder);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    // Listen for order status updates
    socketRef.current.on("orderStatusUpdated", ({ orderId, status, reason }) => {
      console.log("Order status updated:", { orderId, status });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status, reason } : order
        )
      );
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [restaurantId, token]);

  useEffect(() => {
    async function fetchOffers() {
      try {
        setLoadingOffers(true);
        setOffersError("");
        const res = await fetch(`http://localhost:5000/api/offers/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        setOffers(data);
        setLoadingOffers(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffersError("Failed to load offers.");
        setLoadingOffers(false);
      }
    }
    fetchOffers();
  }, [restaurantId, token]);

  const handleAccept = (orderId) => {
    setOrderStatuses((prev) => ({ ...prev, [orderId]: "accept" }));
    setOrderReasons((prev) => ({ ...prev, [orderId]: "Order placed by user" }));
  };

  const handleReject = (orderId) => {
    setOrderStatuses((prev) => ({ ...prev, [orderId]: "reject" }));
    setOrderReasons((prev) => ({ ...prev, [orderId]: "" }));
  };

  const handleReasonChange = (orderId, value) => {
    setOrderReasons((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleConfirm = async (orderId) => {
    const statusValue = orderStatuses[orderId];
    const reason = orderReasons[orderId] || "";

    if (!statusValue) {
      // alert("Please accept or reject the order first.");
      return;
    }

    const statusMap = { accept: "Accepted", reject: "Rejected" };
    const backendStatus = statusMap[statusValue];

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: backendStatus, reason }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      const updatedData = await res.json();

      // You can either remove the order or keep it updated
    setOrders((prevOrders) =>
  prevOrders.filter((order) => order._id !== orderId)
);

      

      // alert(updatedData.message);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans mt-20">
      <Header active="Home" />

      <Link to="/view-offers" className="block">
        <div className="flex items-center justify-end px-4 py-3 bg-gray-50 rounded shadow-sm text-sm text-gray-700 space-x-2 hover:bg-gray-100 transition">
          <BiSolidOffer size={14} />
          <span className="text-black text-xs font-normal">View Offers/Discounts</span>
        </div>
      </Link>

      <div className="px-6 pt-6 space-y-4">
        {loadingOffers ? (
          <p>Loading offers...</p>
        ) : offersError ? (
          <p className="text-red-600">{offersError}</p>
        ) : offers.length === 0 ? (
          <p>No current offers available.</p>
        ) : (
          offers.slice(0, 1).map((offer) => (
            <div
              key={offer._id}
              className="bg-gradient-to-r from-orange-400 via-orange-200 to-orange-100 rounded p-6 shadow-md text-white relative"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">{offer.title}</p>
                  <h2 className="text-6xl font-bold">{offer.value} %</h2>
                  <p className="text-xl font-semibold ml-28">Off</p>
                </div>
                <div className="bg-white text-black px-4 py-2 rounded font-bold text-sm shadow-md">
                  CODE : {offer.code}
                </div>
              </div>
              <p className="text-xs mt-4 text-black font-medium">{offer.desc}</p>
            </div>
          ))
        )}

        {loadingOrders ? (
          <p className="text-center mt-10">Loading orders...</p>
        ) : ordersError ? (
          <p className="text-center mt-10 text-red-600">{ordersError}</p>
        ) : orders.length === 0 ? (
          <p className="text-center mt-10">No pending orders found.</p>
        ) : (
          orders.map((order, index) => {
            const accepted = orderStatuses[order._id] || null;
            const reason = orderReasons[order._id] || "";

            return (
              <div key={order._id} className="bg-white rounded shadow p-5 text-sm mb-6">
                <div className="flex items-center mb-2">
                  <div className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    {index + 1}
                  </div>
                  <span className="font-semibold">Order Request</span>
                 
                </div>
                   <p className="text-gray-700 text-xs mb-4 ml-7"> {order.createdAt?.slice(0, 10)}</p>
                <div className="text-xs text-gray-600 mb-2">
                  <p>Order ID: {order._id}</p>
                  <p>Order Delivery Date: {order.date || "N/A"} | Time: {order.time || "N/A"} </p>
 
                  {order.reason && <p className="text-red-500">Reason: {order.reason}</p>}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => handleReject(order._id)}
                    className={`text-sm h-10 w-32 rounded border transition ${
                      accepted === "reject" ? "bg-orange-500 hover:bg-orange-600 text-white font-medium " : ""
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(order._id)}
                    className={`text-sm h-10 w-32 rounded border transition ${
                      accepted === "accept" ? "bg-orange-500 hover:bg-orange-600 text-white font-medium " : ""
                    }`}
                  >
                    Accept
                  </button>
                </div>

                {accepted === "reject" ? (
                  <textarea
                    placeholder="Reason for Rejection"
                    value={reason}
                    onChange={(e) => handleReasonChange(order._id, e.target.value)}
                    className="w-full mt-4 border border-gray-300 h-20 rounded p-2 text-sm resize-none bg-white"
                  />
                ) : accepted === "accept" ? (
                  <div className="bg-[#f9f9f9] p-3 rounded border mt-4">
                    {order.basket.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-lg shadow-sm bg-white space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                          <span className="text-sm text-gray-600">
                            Rs. {item.price} × {item.quantity}
                          </span>
                        </div>
                        {item.note?.trim() && (
  <p className="text-xs text-gray-900">📝 {item.note}</p>
)}

                      </div>
                    ))}
                    <p className="text-xs mt-2 text-gray-700">Payment Method: {order.paymentMethod}</p>
                    <p className="text-xs text-gray-700">Deliver To: {order.address}</p>
                    <p className="text-xs text-gray-700">
                      Special Instructions: {order.specialInstructions || "None"}
                    </p>
                    <p className="text-xs text-green-600 mt-3">
                      Offer Applied: {order.offerPercentage || "None"} %
                    </p>
                    <p className="text-xs">Delivery Fee: Rs. {order.deliveryFee?.toFixed(2) ?? "0.00"}</p>
                    <p className="text-sm font-semibold mt-3">
                      Total Price: Rs. {order.total?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                ) : null}

                <div className="flex justify-center mt-6">
                  <button
                    disabled={!accepted}
                    onClick={() => handleConfirm(order._id)}
                    className={`bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition ${
                      !accepted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
