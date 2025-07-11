import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaHeart, FaLock, FaSearch, FaTimes } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import img from "../../../assets/images/loginImage.png";
import Header1 from '../../../components/afterLoginHomePageHeader';
import Footer from '../../../components/footer';
import GuestHeader from "../../../components/header";
const socket = io('http://localhost:5000');

export default function Restaurant() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || "";

  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [savedKeywords, setSavedKeywords] = useState(() => {
    try {
      const stored = localStorage.getItem('savedSearchKeywords');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeFilterKeywords, setActiveFilterKeywords] = useState(() =>
    initialSearchTerm.trim() ? initialSearchTerm.trim().split(/\s+/) : []
  );
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    const fetchAcceptedRestaurants = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/restaurant/restaurants');
        setRestaurants(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setLoading(false);
      }
    };
    fetchAcceptedRestaurants();
  }, []);

  useEffect(() => {
    if (activeFilterKeywords.length === 0) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const terms = activeFilterKeywords.map(k => k.toLowerCase().trim());

    const filtered = restaurants.filter(r =>
      terms.every(term =>
        r.restaurantName.toLowerCase().includes(term) ||
        (r.city && r.city.toLowerCase().includes(term))
      )
    );

    const sorted = filtered.sort((a, b) => {
      const score = (r) => {
        let s = 0;
        for (const term of terms) {
          const name = r.restaurantName.toLowerCase();
          const city = r.city?.toLowerCase() || "";
          if (name.startsWith(term)) s += 3;
          else if (city.startsWith(term)) s += 2;
          else if (name.includes(term) || city.includes(term)) s += 1;
        }
        return s;
      };
      return score(b) - score(a);
    });

    setFilteredRestaurants(sorted);
  }, [activeFilterKeywords, restaurants]);

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
  navigate(`/certain-restaurant/${restaurant._id}`);
};


  const clearSearchInput = () => {
    setSearchInput("");
  };

  const removeKeyword = (keyword) => {
    const updated = savedKeywords.filter(k => k !== keyword);
    setSavedKeywords(updated);
    localStorage.setItem('savedSearchKeywords', JSON.stringify(updated));

    setActiveFilterKeywords(prev => prev.filter(k => k !== keyword));
    if (activeFilterKeywords.length === 1 && activeFilterKeywords[0] === keyword) {
      setFilteredRestaurants(restaurants);
    }
  };

  const useKeyword = (keyword) => {
    setSearchInput(keyword);
    setActiveFilterKeywords([keyword]);
    navigate(`/delivo-eats/all-restaurant?search=${encodeURIComponent(keyword)}`);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();

    if (trimmedInput === "") {
      setActiveFilterKeywords([]);
      navigate('/delivo-eats/all-restaurant');
      return;
    }

    const newKeywords = trimmedInput.split(/\s+/).filter(k => k !== "");

    setSavedKeywords(prev => {
      const mergedKeywords = Array.from(new Set([...prev, ...newKeywords]));
      localStorage.setItem('savedSearchKeywords', JSON.stringify(mergedKeywords));
      return mergedKeywords;
    });

    setActiveFilterKeywords(newKeywords);
    navigate(`/delivo-eats/all-restaurant?search=${encodeURIComponent(trimmedInput)}`);
  };

 useEffect(() => {
  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") return;

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
}, []);



const toggleFavorite = async (e, restaurantId) => {
  e.stopPropagation(); // prevent card navigation on icon click

  const token = localStorage.getItem('token');
 if (!token || token === "undefined") {
  navigate("/login", {
    state: { from: location.pathname + location.search },
  });
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


const token = localStorage.getItem("token");
const isLoggedIn = token && token.trim() !== "" && token !== "undefined";

  return (
    <>
  {isLoggedIn ? <Header1 /> : <GuestHeader />}


      {/* Styled Search Bar */}
      <div className="mt-28 mb-4 px-4 w-full flex justify-center">
        <form onSubmit={submitSearch} className="w-full max-w-2xl">
          <div className={`flex items-center bg-white/95 backdrop-blur-md border-2 ${searchFocused ? 'border-orange-200 shadow-2xl' : 'border-white/30 shadow-xl'} rounded-full overflow-hidden transition-all duration-500 transform h-12 ${searchFocused ? 'scale-105' : ''}`}>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search restaurants or locations of the restaurants..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full px-6 py-4 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearchInput}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
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
      </div>

      {/* Saved Keywords */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
        {savedKeywords.length === 0 ? (
          <span className="text-gray-400 italic text-sm">No saved search keywords</span>
        ) : (
          savedKeywords.map((keyword, idx) => (
            <div
              key={idx}
              className="flex items-center bg-orange-100 text-gray-600 px-3 py-1 rounded text-sm font-medium shadow cursor-pointer hover:bg-orange-300"
              onClick={() => useKeyword(keyword)}
              title="Click to search this keyword"
            >
              <span>{keyword}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeKeyword(keyword);
                }}
                className="ml-2 text-orange-600 hover:text-red-600 focus:outline-none"
                aria-label={`Remove keyword ${keyword}`}
                type="button"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mt-6 max-w-6xl mx-auto">
        {loading ? (
          <p className="text-gray-500 text-center col-span-full">Loading restaurants...</p>
        ) : filteredRestaurants.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">No restaurants found.</p>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              onClick={() => handleCardClick(restaurant)}
              className="p-4 bg-white rounded hover:shadow-lg cursor-pointer transition"
            >
              <div className="relative mb-3">
  <img
    src={restaurant.logoImage || img}
    alt={restaurant.restaurantName}
    className="w-full h-48 object-cover rounded"
  />
 <button
  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white shadow"
  onClick={(e) => toggleFavorite(e, restaurant._id)}
  title={favoriteIds.includes(restaurant._id) ? "Remove from Favorites" : "Add to Favorites"}
>
  {favoriteIds.includes(restaurant._id) ? (
    <FaHeart className="text-red-600 fill-red-600" /> // filled heart
  ) : (
    <FaHeart className="text-gray-600 hover:text-red-500" /> // outlined heart
  )}
</button>

</div>

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
          ))
        )}
      </div>

      <Footer />
    </>
  );
}
