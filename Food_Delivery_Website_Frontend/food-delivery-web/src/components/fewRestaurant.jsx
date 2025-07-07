import axios from 'axios';
import { useEffect, useState } from 'react';
import { BiArrowToRight } from 'react-icons/bi';
import { FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import img from "../assets/images/loginImage.png";

const socket = io('http://localhost:5000'); 

export default function Restaurant({ searchTerm = "" }) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/restaurant/restaurants');
        setRestaurants(res.data);
        setFilteredRestaurants(res.data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAcceptedRestaurants();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredRestaurants(
        restaurants.filter(r =>
          (r.restaurantName && r.restaurantName.toLowerCase().includes(lower)) ||
          (r.city && r.city.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, restaurants]);
  useEffect(() => {
    socket.on('restaurantStatusUpdate', ({ restaurantId, isOnline }) => {
      setRestaurants(prev =>
        prev.map(r =>
          r._id === restaurantId ? { ...r, isOnline } : r
        )
      );
    });

    return () => {
      socket.off('restaurantStatusUpdate');
    };
  }, []);

  const handleCardClick = (restaurant) => {
    // const token = localStorage.getItem("token");
    // if (!token || token.trim() === "" || token === "undefined") {
    //   navigate("/login");
    // } else {
      navigate(`/certain-restaurant/${restaurant._id}`);
    // }
  };

  if (loading) {
    return <p className="text-gray-500 mt-8 text-center">Loading restaurants...</p>;
  }

  if (filteredRestaurants.length === 0) {
    return <p className="text-gray-500 mt-8 text-center">No restaurants found.</p>;
  }

  return (
    <>
     <div className="flex justify-between items-center mb-2">
             <h1 className='text-base font-semibold'>Restaurants</h1>
             <button
               onClick={() => navigate("/delivo-eats/all-restaurant")}
               className="flex items-center gap-1 text-sm font-normal text-black hover:underline"
             >
               View All <BiArrowToRight className="text-base" />
             </button>
               </div>  

      <div className="grid grid-cols-4  gap-4 mt-2">
        {filteredRestaurants.slice(0, 8).map((restaurant) => (
          <div
            key={restaurant._id}
            onClick={() => handleCardClick(restaurant)}
            className="p-4 bg-white rounded hover:shadow-lg cursor-pointer transition"
          >
            <img
              src={restaurant.logoImage || img}
              alt={restaurant.restaurantName}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <h3 className="text-base font-semibold mb-1 flex items-center justify-between">
              {restaurant.restaurantName}
              {!restaurant.isOnline && (
                 <span className="flex items-center text-xs text-red-500 font-medium ml-2">
                                        <FaLock className="w-3 h-3 mr-1" />
                                        Closed
                                      </span>
              )}
            </h3>
            <p className="text-gray-600 text-xs">
              {restaurant.city || "Location not available"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
