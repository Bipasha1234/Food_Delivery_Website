import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import HomeImage3 from "../../../assets/images/image3.jpeg";
import HomeImage5 from "../../../assets/images/image4.jpeg";
import HomeImage2 from "../../../assets/images/image5.png";
import HomeImage4 from "../../../assets/images/image6.png";

import Header from "../../../components/afterLoginHomePageHeader";
import Footer from "../../../components/footer";
import GetListedModal from "../../../components/getListedModal";
import GuestHeader from "../../../components/header";
import Restaurants from "../../../components/restaurants";
export default function Home() {
  const navigate = useNavigate();
const location = useLocation();
  const images = [HomeImage4, HomeImage2, HomeImage3, HomeImage5];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleProtectedClick = (path) => {
  const token = localStorage.getItem("token");
  if (!token || token.trim() === "" || token === "undefined") {
    navigate("/login", { state: { from: path || location.pathname } });
  } else {
    navigate(path);
  }
};

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const onSearchChange = (e) => setSearchTerm(e.target.value);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/delivo-eats/all-restaurant?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
const token = localStorage.getItem("token");
const isLoggedIn = token && token.trim() !== "" && token !== "undefined";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    {isLoggedIn ? <Header /> : <GuestHeader />}

      {/* Location Button */}
      <div className="w-full px-4 mb-4 flex justify-end pt-24">
        <div
          onClick={() => handleProtectedClick("/delivo-eats/location")}
          className="flex items-center bg-white rounded px-4 py-2 hover:shadow-md transition cursor-pointer"
        >
          <FaMapMarkerAlt className="text-orange-500 mr-2 text-sm" />
          <div className="text-sm text-gray-700">
            
            <span className="font-medium truncate">Set your location</span>
          </div>
        </div>
      </div>

      {/* Image Slider + Search Bar */}
      <div className="relative w-full px-4 flex items-center justify-center">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          className="absolute left-8 z-20 bg-white/95 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/30 hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 group"
          aria-label="Previous Image"
        >
          <FaChevronLeft className="text-gray-700 group-hover:text-orange-500 transition-colors duration-300" />
        </button>

        {/* Slider Image */}
        <div className="relative w-full max-w-8xl overflow-hidden rounded shadow-2xl">
          <img
            src={images[currentImageIndex]}
            alt={`Slide ${currentImageIndex + 1}`}
            className="w-full h-screen object-cover transition-transform duration-1000 ease-in-out scale-105"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10" />

          {/* Hero Text */}
          <div className="absolute top-1/4 mt-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent drop-shadow-lg">
              DelivoEats
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90 drop-shadow-md">
              Your favorite food, delivered fresh
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={onSearchSubmit}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
          >
            <div
              className={`flex items-center bg-white/95 backdrop-blur-md border-2 ${
                searchFocused ? "border-orange-200 shadow-2xl" : "border-white/30 shadow-xl"
              } rounded-full overflow-hidden transition-all duration-500 transform h-12 ${
                searchFocused ? "scale-105" : ""
              }`}
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search restaurants, or locations of the restaurants..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full px-6 py-4 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FaSearch />
                  <span className="hidden sm:inline">Search</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </form>

          {/* Slider Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-3 rounded-full transition-all duration-500 ${
                  idx === currentImageIndex
                    ? "w-10 bg-white shadow-lg"
                    : "w-3 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Floating blurred circles */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-8 z-20 bg-white/95 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/30 hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-rotate-12 group"
          aria-label="Next Image"
        >
          <FaChevronRight className="text-gray-700 group-hover:text-orange-500 transition-colors duration-300" />
        </button>
      </div>

      {/* Restaurants */}
      <div className="mt-16 px-4">
        <Restaurants searchTerm={searchTerm} />
      </div>

      {/* About Us Section */}
      <div className="px-8 py-12 mt-16 text-gray-800 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 w-11/12 mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400"></div>
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <span className="text-white font-bold text-2xl">🍽️</span>
            </div>
          </div>
          <h2 className="text-xl text-center font-bold mb-6 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent">
            About Us
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
            DelivoEats is a food delivery company that connects you to a wide range of local restaurants.
            It allows you to browse menus and order your favorite meals with ease. Whether you're craving something
            quick or planning a feast, DelivoEats brings food right to your doorstep with unmatched quality and speed.
          </p>
        </div>
      </div>

      {/* List Your Restaurant */}
      <div className="px-8 py-12 mt-16 text-gray-800 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 w-11/12 mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-100 to-orange-500"></div>
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-gradient-to-r from-teal-500/15 to-green-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-300 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-white font-bold text-3xl">🏪</span>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent">
            List Your Restaurant
          </h2>
          <p className="text-xs text-gray-600 mb-10 mx-auto max-w-lg leading-relaxed">
            Do you own a restaurant and want to reach more customers? Partner with DelivoEats and get your dishes
            delivered to food lovers all around the city. Join our website network today!
          </p>
          {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center p-4 bg-gray-200/50 rounded-2xl">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-semibold text-gray-800">Increase Sales</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-200/50 rounded-2xl">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-sm font-semibold text-gray-800">Fast Growth</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-200/50 rounded-2xl">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm font-semibold text-gray-800">Reach More Customers</div>
              </div>
            </div>
              <div></div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
          >
            Send Request
          </button>
        </div>
      </div>

      <Footer />

      {showModal && <GetListedModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
