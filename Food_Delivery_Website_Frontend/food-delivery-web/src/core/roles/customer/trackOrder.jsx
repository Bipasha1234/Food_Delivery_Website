import axios from "axios";
import { useEffect, useState } from "react";
import io from "socket.io-client";


import Header1 from "../../../components/afterLoginHomePageHeader";
import Footer from "../../../components/footer";
import GuestHeader from "../../../components/header";

const SOCKET_SERVER_URL = "http://localhost:5000";
export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSelectedManually, setUserSelectedManually] = useState(false);
 const [socket, setSocket] = useState(null);
  const stages = [
    "Order Taken",
    "Preparing",
    "Handed to Delivery",
    "Coming to Address",
    "Delivered",
  ];

  const currentIndex = selectedOrder ? stages.indexOf(selectedOrder.status) : -1;

  const getStatusTag = (stage) => {
    if (stages.indexOf(stage) < currentIndex) {
      return (
        <div className="text-red-500 text-xs px-2 py-0.5 font-semibold rounded ">
          Done
        </div>
      );
    }
    if (selectedOrder?.status === stage && stage !== "Delivered") {
      return (
        <div className="text-emerald-600 text-xs px-2 py-0.5 font-semibold rounded ">
          Ongoing
        </div>
      );
    }
    return null;
  };

  const renderBox = (label) => (
    <div
      className="flex flex-col items-center text-center space-y-1 w-[130px] whitespace-nowrap"
      key={label}
    >
      <div className="bg-white shadow px-4 py-2 rounded font-medium text-sm text-gray-800">
        {label}
      </div>
      {getStatusTag(label)}
    </div>
  );

  const fetchOngoingOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data && Array.isArray(res.data)) {
       const activeOrders = res.data.filter(
            (o) => o.status !== "Delivered" && o.status !== "Rejected"
          );


        setOrders(activeOrders);

        if (userSelectedManually && selectedOrder) {
          const updated = activeOrders.find((o) => o._id === selectedOrder._id);
          if (updated) setSelectedOrder(updated);
        } else {
          setSelectedOrder(activeOrders[0] || null);
        }
      } else {
        setOrders([]);
        setSelectedOrder(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching ongoing orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingOrders();
    // const interval = setInterval(fetchOngoingOrders, 5000);
    // return () => clearInterval(interval);
  }, []);
const token = localStorage.getItem("token");
const isLoggedIn = token && token.trim() !== "" && token !== "undefined";

useEffect(() => {
  const newSocket = io(SOCKET_SERVER_URL, {
    auth: { token: localStorage.getItem("token") },
  });
  setSocket(newSocket);

  const userId = localStorage.getItem("userId"); // make sure it's stored at login

  if (userId) {
    newSocket.emit("joinRoom", userId);
    console.log("Joined user room:", userId);
  }

  newSocket.on("orderStatusUpdated", (update) => {
    console.log("Received update:", update);

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === update.orderId ? { ...order, status: update.status } : order
      )
    );

    setSelectedOrder((prevSelected) =>
      prevSelected && prevSelected._id === update.orderId
        ? { ...prevSelected, status: update.status }
        : prevSelected
    );
  });

  return () => {
    newSocket.disconnect();
  };
}, []);

  return (
    <>
      {isLoggedIn ? <Header1 /> : <GuestHeader />}
      <main className="min-h-screen px-6 py-12 mt-20 max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg px-6 py-8">
          <h1 className="text-base font-semibold mb-3 text-start text-gray-900">
            Track Your Orders
          </h1>

          {loading ? (
            <div className="text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-600 text-lg mt-6">
              No ongoing orders to track.
            </div>
          ) : (
            <>
              <select
                className="mb-10 w-full rounded px-3 py-2 text-gray-700 text-sm focus:outline-none border"
                value={selectedOrder?._id || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const order = orders.find((o) => o._id === selectedId);
                  setUserSelectedManually(true);
                  setSelectedOrder(order);
                }}
              >
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    Order #{order.orderNumber || order._id} -{" "}
                    {order.restaurantName || "Restaurant"} - Status: {order.status}
                  </option>
                ))}
              </select>

              {selectedOrder && (
                <>
                  <div className="flex justify-center items-center space-x-6 sm:space-x-12 flex-wrap sm:flex-nowrap">
                    {stages.slice(0, 3).map((stage, idx) => (
                      <div key={stage} className="flex items-center space-x-6 sm:space-x-8">
                        {renderBox(stage)}
                        {idx < 2 && (
                          <div
                            className={`h-1 ${
                              currentIndex > idx ? "bg-orange-400" : "bg-gray-300"
                            } w-10 sm:w-20 mt-4 rounded`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center items-center space-x-6 sm:space-x-12 mt-16 flex-wrap sm:flex-nowrap">
                    {renderBox("Coming to Address")}
                    <div
                      className={`h-1 ${
                        currentIndex > 3 ? "bg-orange-400" : "bg-gray-300"
                      } w-10 sm:w-20 mt-4 rounded`}
                    />
                    {renderBox("Delivered")}
                  </div>

                  <p className="text-xs text-gray-600 text-center mt-12 max-w-lg mx-auto">
                    Your order will be updated in real-time by restaurants. Please
                    contact the restaurant if any problem arises with your order.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
