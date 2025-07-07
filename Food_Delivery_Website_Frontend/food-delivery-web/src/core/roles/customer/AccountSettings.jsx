import axios from "axios";
import { useEffect, useState } from "react";
import { FaHeart, FaHistory, FaSignOutAlt, FaTimes, FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from 'react-router-dom';
import Header from "../../../components/afterLoginHomePageHeader";
import Footer from "../../../components/footer";

export default function AccountSettings() {

  const [profile, setProfile] = useState({ fullName: "", mobile: "", email: "" });
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "profile");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchFavorites();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customer/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customer/get/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/customer/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
      setProfile(res.data.customer);
      setMessage("Profile updated successfully");

    } catch (err) {
      console.error("Failed to update profile", err);
      alert('Failed to update profile');
    }
  };
    const handleLogout = () => {
    // Clear user tokens/local storage or auth context
    localStorage.removeItem("token");
    // ... any other cleanup ...

    // Redirect to login page
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6 flex justify-center  flex-col">
            <p className="font-medium">My Profile</p>
           {message && (
             <div className="relative bg-green-100 border border-green-400 text-green-700  py-2 rounded mb-6 text-sm" role="alert">
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="fill-current w-6 h-6 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
                </svg>
                <p className="font-normal">{message}</p>
              </div>
              <button
                onClick={() => setMessage("")}
                className="absolute top-3 right-2 text-green-700 font-bold text-xl leading-none focus:outline-none"
                aria-label="Close alert"
              >
                <FaTimes size={16} />
              </button>
            </div>
            )}

            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-sm">
              <div>
                <label className="font-normal block mb-1 ">Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  className="w-80 border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="font-normal block mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={profile.mobile}
                  onChange={handleProfileChange}
                  className="w-80 border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-normal block mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-80 border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2 flex justify-center space-x-8 mt-2">
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800  font-medium text-sm h-10 w-32 rounded  transition"
                  onClick={fetchProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        );

     case "history":
  const filteredOrders = orders.filter(
    (order) => order.status === "Delivered" || order.status === "Rejected"
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-9/12 space-y-2">
        <h3 className="font-medium">Order History</h3>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className={`cursor-pointer border rounded p-3 text-sm hover:bg-gray-50 ${
                selectedOrder?._id === order._id ? "bg-gray-100 border-gray-300" : ""
              }`}
            >
              <p className="font-semibold">{index + 1}. Order ID: {order._id}</p>
              <p className="text-xs text-gray-700">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="flex gap-1">   <p className="text-xs text-gray-700">Order Status: {order.status}</p>
               <p className="text-xs text-gray-700">{order.reason}</p></div>        
              <p className="text-xs text-gray-700">Restaurant: {order.restaurantName}</p>
            </div>
          ))
        ) : (
          <p>No Delivered or Rejected orders found.</p>
        )}
      </div>

      {selectedOrder && (
        <div className="w-full lg:w-1/2 border rounded p-4 shadow relative h-full">
          <button
            onClick={() => setSelectedOrder(null)}
            className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-red-500"
          >
            <FaTimes size={16} />
          </button>
          <h3 className="font-bold text-sm mb-2">Order ID: {selectedOrder._id}</h3>
          <p className="text-xs">Order Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
          <p className="text-xs">Status: {selectedOrder.status}</p>
          
          <p className="text-xs">Restaurant: {selectedOrder.restaurantName}</p>

          <div className="mt-4 space-y-2 text-sm">
            {selectedOrder.basket?.length > 0 ? (
              selectedOrder.basket.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200">
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
    {item.note?.trim() && (
      <p className="text-xs text-gray-600 mt-1 flex items-center space-x-1">
        <span>📝</span>
        <span>{item.note}</span>
      </p>
    )}
  </div>
  <span className="text-sm font-semibold text-gray-900">Rs. {item.price}</span>
</div>

                
              ))
            ) : (
              <p>No items found in this order.</p>
            )}
          </div>

          <div className="mt-4  pt-3 text-sm">
            
            <div className="flex justify-between font-normal text-xs">
              <span>Sub Total:</span>
              <span>Rs. {selectedOrder.basket.reduce((sum, item) => sum + item.price, 0)}</span>
            </div>
            <div className="flex justify-between font-normal text-xs mt-3 text-green-600">
              <span>Offer Applied:</span>
              <span>{selectedOrder.offerPercentage} %</span>
            </div>
            <div className="flex justify-between font-normal text-xs mt-3">
              <span>Delivery Fee:</span>
              <span>Rs. {selectedOrder.deliveryFee}</span>
            </div>
            <div className="bg-gray-200 mt-4 p-3 rounded text-black font-bold text-base flex justify-between">
              <span>Total to pay</span>
              <span>
                Rs. {selectedOrder.basket.reduce((sum, item) => sum + item.price, 0) + selectedOrder.deliveryFee}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );


      case "favorites":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="pr-6">
              <h3 className="font-medium mb-4">Favorite Restaurants</h3>
              {favorites.length > 0 ? (
                <ul className="space-y-5 text-sm">
                  {favorites.map((restaurant, index) => (
                    <li key={restaurant._id} className="border rounded px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 transition">
                      <Link to={`/certain-restaurant/${restaurant._id}`} className="flex items-center space-x-3 w-full">
                        <img src={restaurant.logoImage} alt={restaurant.restaurantName} className="w-14 h-14 rounded object-cover" />
                        <div>
                          <p className="font-semibold">{index + 1}. {restaurant.restaurantName}</p>
                          <p className="text-gray-600 text-xs">{restaurant.city}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No favorites found.</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <>
      <Header />
      <div className="px-4 py-20 mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] bg-white shadow-md rounded-xl overflow-hidden h-[500px]">
       <aside className="p-6 space-y-4 border-r border-gray-200 overflow-y-auto">
            <h2 className="text-base font-semibold mb-4">Account Settings</h2>
           <button
          className={`flex items-center space-x-2 font-normal text-sm w-36 h-10 text-left p-2 rounded transition ${
            activeTab === "profile"
              ? "bg-orange-500 text-white font-medium"
              : "hover:bg-orange-100"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <FaUserCircle />
          <span>My Profile</span>
        </button>

      <button
        className={`flex items-center space-x-2 font-normal text-sm w-36 h-10 text-left p-2 rounded transition ${
          activeTab === "history"
            ? "bg-orange-500 text-white font-medium"
            : "hover:bg-orange-100"
        }`}
        onClick={() => setActiveTab("history")}
      >
        <FaHistory />
        <span>Order History</span>
      </button>

      <button
        className={`flex items-center space-x-2 font-normal text-sm w-36 h-10 text-left p-2 rounded transition ${
          activeTab === "favorites"
            ? "bg-orange-500 text-white font-medium"
            : "hover:bg-orange-100"
        }`}
        onClick={() => setActiveTab("favorites")}
      >
        <FaHeart />
        <span>Favorites</span>
      </button>

            <div className="mt-6 flex justify-center items-center">
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600  text-white font-medium text-sm h-10 w-32 rounded flex justify-center items-center gap-2 transition">
                <FaSignOutAlt />  
                 <span>Logout</span>
              </button>
            </div>
          </aside>

          <main className="p-8 overflow-y-auto">{renderContent()}</main>
        </div>
      </div>
      <Footer/>
    </>
  );
}
