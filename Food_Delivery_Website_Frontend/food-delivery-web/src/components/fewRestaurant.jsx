import axios from 'axios';
import { useEffect, useState } from 'react';
import { BiArrowToRight } from 'react-icons/bi';
import { FaHeart, FaLock } from 'react-icons/fa'; // Added FaHeart for favorites
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import img from "../assets/images/loginImage.png";

const socket = io('http://localhost:5000'); 

export default function Restaurant({ searchTerm = "" }) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const token = localStorage.getItem("token");
  const isLoggedIn = token && token.trim() !== "" && token !== "undefined";

  // Fetch restaurants
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

  // Fetch favorites if logged in
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;

      try {
        const res = await axios.get('http://localhost:5000/api/customer/get/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ids = res.data.map(r => r._id);
        setFavoriteIds(ids);
      } catch (error) {
        console.error('Failed to fetch favorites', error);
      }
    };
    fetchFavorites();
  }, [isLoggedIn, token]);

  // Filter restaurants based on searchTerm
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

  // Socket.io update for restaurant status
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

  // Toggle favorite function
  const toggleFavorite = async (e, restaurantId) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const isFav = favoriteIds.includes(restaurantId);

    try {
      if (isFav) {
        await axios.post('http://localhost:5000/api/customer/favorites/remove',
          { restaurantId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteIds(prev => prev.filter(id => id !== restaurantId));
      } else {
        await axios.post('http://localhost:5000/api/customer/favorites/add',
          { restaurantId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteIds(prev => [...prev, restaurantId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCardClick = (restaurant) => {
    navigate(`/certain-restaurant/${restaurant._id}`);
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

      <div className="grid grid-cols-4 gap-4 mt-2">
        {filteredRestaurants.slice(0, 8).map((restaurant) => {
          const isFavorite = favoriteIds.includes(restaurant._id);
          return (
            <div
              key={restaurant._id}
              onClick={() => handleCardClick(restaurant)}
              className="p-4 bg-white rounded hover:shadow-lg cursor-pointer transition relative"
            >
              <img
                src={restaurant.logoImage || img}
                alt={restaurant.restaurantName}
                className="w-full h-40 object-cover rounded mb-3"
              />

              {/* Favorite toggle button */}
              <button
                className="absolute top-5 right-5 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white shadow"
                onClick={(e) => toggleFavorite(e, restaurant._id)}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <FaHeart
                  className={isFavorite ? "text-red-600 fill-red-600" : "text-gray-600 hover:text-red-500"}
                />
              </button>

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
          );
        })}
      </div>
    </>
  );
}
