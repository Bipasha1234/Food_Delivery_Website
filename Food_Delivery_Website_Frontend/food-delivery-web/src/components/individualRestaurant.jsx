import axios from 'axios';
import { useNavigate } from "react-router-dom";

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaHeart,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash
} from 'react-icons/fa';
import { useLocation, useParams } from "react-router-dom";
import { io } from 'socket.io-client';
import img6 from "../assets/images/close_sign.png";
import defaultCover from '../assets/images/image3.jpeg';
import defaultCover1 from '../assets/images/loginImage.png';
import img5 from "../assets/images/open_sign.png";
import Header from '../components/afterLoginHomePageHeader';
import Footer from '../components/footer';
import GuestHeader from '../components/header';
import MenuGrid from '../components/menuGrid';
const socket = io("http://localhost:5000");

export default function IndividualRestaurantPage() {
  const { id } = useParams();
  const location = useLocation();
 
  const [usedOffers, setUsedOffers] = useState([]);
  const categoriesBase = ['Offers','Burgers','Fries','Snacks','Salads','Cold drinks','Desserts','Sauces'];
  const [categories, setCategories] = useState(categoriesBase);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const navRef = useRef(null);
const [showNoteField, setShowNoteField] = useState(false);
const [orderNote, setOrderNote] = useState('');
const token = localStorage.getItem('token');
const isLoggedIn = !!token;
  const sectionRefs = useRef({});
const navigate = useNavigate();

  const [offerDeduction, setOfferDeduction] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(50);
 const [searchTerm, setSearchTerm] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [offers, setOffers] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredMenus = useMemo(() => {
    if (!searchTerm.trim()) return menus;

    const lowerSearch = searchTerm.toLowerCase();
    return menus.filter(menu =>
      menu.name.toLowerCase().includes(lowerSearch) ||
      menu.shortDescription.toLowerCase().includes(lowerSearch)
    );
  }, [menus, searchTerm]);
  const filteredOffers = useMemo(() => {
    if (!searchTerm.trim()) return offers;

    const lowerSearch = searchTerm.toLowerCase();
    return offers.filter(offer =>
      offer.title.toLowerCase().includes(lowerSearch) ||
      offer.desc.toLowerCase().includes(lowerSearch)
    );
  }, [offers, searchTerm]);
   const groupedMenus = useMemo(() => {
    return filteredMenus.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [filteredMenus]);

const products = {
  Offers: filteredOffers,
  ...groupedMenus
};


 useEffect(() => {
  const keys = ['All', ...Object.keys(groupedMenus)];
  setCategories(keys);
}, [groupedMenus]);

  useEffect(() => {
  const handleStatusUpdate = ({ restaurantId: updatedId, isOnline: updatedStatus }) => {
    if (updatedId === id) {
      setRestaurant(prev => prev ? { ...prev, isOnline: updatedStatus } : prev);
    }
  };

  socket.on("restaurantStatusUpdate", handleStatusUpdate);

  return () => {
    socket.off("restaurantStatusUpdate", handleStatusUpdate);
  };
}, [id]);


  // Fetch restaurant details
  const fetchRestaurantDetails = async () => {
    try {
      // const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/restaurant/${id}`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data);
    } catch (error) {
      console.error('Failed to fetch restaurant details', error);
    }
  };

  // Fetch menus
  const fetchMenus = async () => {
    try {
     
      const res = await axios.get(`http://localhost:5000/api/menu/by-restaurant/${id}`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data);
    } catch (error) {
      console.error('Failed to fetch menus', error);
    }
  };



  // Fetch offers
  const fetchOffers = async () => {
    try {
 
      const res = await axios.get(`http://localhost:5000/api/offers/${id}`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (error) {
      console.error('Failed to fetch offers', error);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenus();
    fetchOffers();
  }, [id]);


  useEffect(() => {
  const fetchUsedOffers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/orders/used-offers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsedOffers(res.data); // array of offer IDs
      console.log("Frontend received used offers:", res.data);

    } catch (error) {
      console.error("Error fetching used offers", error);
    }
  };

  fetchUsedOffers();
}, []);


  const scrollNav = dir => {
    if (navRef.current) navRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' });
  };

const handleCategoryClick = (cat) => {
  setActiveCategory(cat);
//   if (cat !== 'Offers' && sectionRefs.current[cat]) {
//    const yOffset = -20; // adjust this if you have a fixed header height
// const element = sectionRefs.current[cat];
// const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

// window.scrollTo({ top: y, behavior: 'smooth' });

//   }
};
const updateItemQuantity = (itemId, newQty) => {
  if (newQty < 1) return;

  const updatedBasket = basket.map(item => {
    if (item._id === itemId) {
      return { ...item, quantity: newQty };
    }
    return item;
  });

  setBasket(updatedBasket);
};


const guestItems = JSON.parse(localStorage.getItem('guestBasket') || '[]').find(b => b.restaurantId === id)?.items || [];
const initialBasket = isLoggedIn
  ? []                // logged-in: empty initially, will fetch backend basket soon
  : (location.state?.basket || guestItems || []);  // guest: load from localStorage or passed basket
const [basket, setBasket] = useState(initialBasket);





useEffect(() => {
  if (!isLoggedIn && restaurant?._id) {
    const existingGuestBasket = JSON.parse(localStorage.getItem('guestBasket') || '[]');

    // Remove basket for current restaurant if exists
    const filtered = existingGuestBasket.filter(b => b.restaurantId !== restaurant._id);

    // Add updated basket for current restaurant with restaurant name and city
    filtered.push({
      restaurantId: restaurant._id,
      restaurantName: restaurant.restaurantName || "Unknown Restaurant",
      city: restaurant.city || "Unknown City",
      items: basket,
    });

    localStorage.setItem('guestBasket', JSON.stringify(filtered));
  }
}, [basket, restaurant?._id]);






const toggleFavorite = async () => {
  const token = localStorage.getItem('token');
  if (!token || token === "undefined") {
    navigate("/login");
    return;
  }

  try {
    if (isFavorite) {
      await axios.post('http://localhost:5000/api/customer/favorites/remove', 
        { restaurantId: restaurant._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(false);
    } else {
      await axios.post('http://localhost:5000/api/customer/favorites/add', 
        { restaurantId: restaurant._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(true);
    }
  } catch (error) {
    console.error('Failed to update favorite', error);
  }
};


useEffect(() => {
  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/customer/get/favorites', {
        headers: { Authorization: `Bearer ${token}` }

      });
      const favoriteIds = res.data.map(r => r._id);
      setIsFavorite(favoriteIds.includes(restaurant._id));
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    }
  };

  fetchFavorites();
}, [restaurant]);


  const [currentOffer, setCurrentOffer] = useState(null);

  const applyOffer = (offer) => {
    setCurrentOffer(offer);
    updateTotal(basket, offer);
  };


  useEffect(() => {
  const fetchBasket = async () => {
    if (!restaurant?._id) return;
const token = localStorage.getItem('token');
    try {
     
      const res = await axios.get(`http://localhost:5000/api/orders/basket?restaurantId=${restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  console.log("Basket response:", res.data);
      if (res.status === 200) {
        const loadedItems = res.data.items || [];
        const offerPercent = res.data.offerPercentage || 0;

        setBasket(loadedItems);
        if (offerPercent > 0) {
          setCurrentOffer({ value: offerPercent });
        }
        updateTotal(loadedItems, { value: offerPercent });
      }
    } catch (error) {
      console.error("Error loading basket from backend:", error);
    }
  };

  fetchBasket();
}, [restaurant]); 
useEffect(() => {
  const mergeGuestCart = async () => {
    if (!isLoggedIn || !restaurant?._id) return;

    const guestBaskets = JSON.parse(localStorage.getItem('guestBasket') || '[]');
    const guestCart = guestBaskets.find(b => b.restaurantId === restaurant._id);

    if (!guestCart || !guestCart.items?.length) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post("http://localhost:5000/api/orders/merge-cart", {
        restaurantId: restaurant._id,
        items: guestCart.items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optionally fetch the new cart after merge
      const res = await axios.get(`http://localhost:5000/api/orders/basket?restaurantId=${restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBasket(res.data.items || []);

      // Remove merged guest basket from localStorage
      const filtered = guestBaskets.filter(b => b.restaurantId !== restaurant._id);
      localStorage.setItem('guestBasket', JSON.stringify(filtered));

    } catch (error) {
      console.error("Error merging cart:", error);
    }
  };

  mergeGuestCart();
}, [isLoggedIn, restaurant?._id]);


  useEffect(() => {
    const saveBasket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

           await axios.post("http://localhost:5000/api/orders/basket", {
            items: basket,
            offerPercentage: currentOffer ? parseFloat(currentOffer.value) : 0,
            offerDeduction: currentOffer ? parseFloat(currentOffer.value) : 0,
            restaurantId: restaurant._id   
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

      } catch (error) {
        console.error("Error saving basket to backend:", error);
      }
    };

    if (basket.length) {
      saveBasket();
      updateTotal(basket, currentOffer);
    } else {
      setSubTotal(0);
      setOfferDeduction(0);
      setTotal(deliveryFee);
    }
  }, [basket, currentOffer]);


  const handleAddToBasket = (item) => {
    if (!item._id) {
      console.error("Item missing _id:", item);
      return;
    }

    const newBasket = [...basket];
    const existingIndex = newBasket.findIndex(i => i._id === item._id);

    if (existingIndex !== -1) {
      newBasket[existingIndex].quantity += 1;
    } else {
      newBasket.push({ ...item, quantity: 1 });
    }

    setBasket(newBasket);
  };
const removeFromBasket = async (id) => {
  const token = localStorage.getItem('token');

  if (token) {
    // 🔐 Logged-in user: delete from backend
    try {
      await axios.delete(`http://localhost:5000/api/orders/basket/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const filteredBasket = basket.filter(item => item._id.toString() !== id);
      setBasket(filteredBasket);
    } catch (error) {
      console.error("Error removing basket item from backend:", error);
    }
  } else {
    // 👤 Guest user: remove only one item from guest basket
    try {
      const guestBasketJSON = localStorage.getItem('guestBasket') || '[]';
      const guestBasket = JSON.parse(guestBasketJSON);

      // Find the basket for the current restaurant
      const updatedGuestBasket = guestBasket.map(basketEntry => {
        if (basketEntry.restaurantId === restaurant._id) {
          // Remove only the selected item from this restaurant's basket
          return {
            ...basketEntry,
            items: basketEntry.items.filter(item => item._id !== id)
          };
        }
        return basketEntry; // keep others unchanged
      }).filter(basketEntry => basketEntry.items.length > 0); // remove empty restaurant entries

      // Update localStorage and UI
      localStorage.setItem('guestBasket', JSON.stringify(updatedGuestBasket));

      // Refresh basket state for current restaurant
      const thisRestaurantBasket = updatedGuestBasket.find(b => b.restaurantId === restaurant._id);
      setBasket(thisRestaurantBasket ? thisRestaurantBasket.items : []);
    } catch (error) {
      console.error("Error removing item from guest basket:", error);
    }
  }
};



  const updateTotal = (currentBasket, offer = currentOffer) => {
    let newSubTotal = currentBasket.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let offerDed = 0;
    if (offer) {
      offerDed = (newSubTotal * parseFloat(offer.value)) / 100;
    }
    setOfferDeduction(offerDed);

    let newTotal = newSubTotal - offerDed + deliveryFee;
    setSubTotal(newSubTotal);
    setTotal(newTotal);
  };

  if (!restaurant) {
    return <p className="text-center mt-24 text-gray-500">Loading restaurant details...</p>;
  }
const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
// Toggles whether the note textarea shows for an item
const toggleNoteField = (itemId) => {
  setBasket(prev =>
    prev.map(item =>
      item._id === itemId ? { ...item, showNote: !item.showNote } : item
    )
  );
};

// Updates the note for a specific item in basket
const updateNoteForItem = (itemId, noteText) => {
  setBasket(prev =>
    prev.map(item =>
      item._id === itemId ? { ...item, note: noteText } : item
    )
  );
};


  return (
    <div className="min-h-screen flex flex-col">
     {isLoggedIn ? <Header /> : <GuestHeader />}


      <div className="mt-28 bg-orange-100 p-8 flex justify-between items-center w-[1200px] mx-auto  rounded-lg shadow-md">
        <div className=''>
          <div className="flex items-start space-y-2 flex-col">
         <div className="flex items-center space-x-72">
  <FaHeart
    onClick={toggleFavorite}
    className={`text-4xl cursor-pointer transition ${isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
  />

  {restaurant?.isOnline ? (
  <div className="flex items-center space-x-2">
    <img
      src={img5} 
      alt="Open sign"
      className="w-20 h-auto"
    />
  </div>
) : (
  <div className="flex items-center space-x-2">
    <img
      src={img6}
      alt="Closed sign"
      className="w-20 h-auto"
    />
  </div>
)}


</div>

            <h1 className="text-3xl font-bold ">{restaurant.restaurantName}</h1>
          



          </div>
          <p className="text-gray-700 ">{restaurant.category}<br /> {restaurant.city}</p>
          <span className="inline-flex items-center bg-white px-4 py-2 rounded mt-4 shadow">
            <FaClock className="mr-2 text-gray-600" /> Open Until 10:00 PM
          </span>
        </div>
       <img
          src={restaurant.coverImage || defaultCover}
          alt="Restaurant"
          className="w-2/3 h-72 object-cover rounded ml-8"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultCover;
          }}
        />

      </div>

  <form  className="w-full max-w-2xl mx-auto mt-6 px-8 text-sm">
  <div className={`flex items-center bg-white/95 backdrop-blur-md border-2 ${
      searchFocused ? 'border-orange-200 shadow-2xl' : 'border-white/30 shadow-xl'
    } rounded-full overflow-hidden transition-all duration-500 transform h-12 ${searchFocused ? 'scale-105' : ''}`}>
    
    <div className="flex-1 relative">
      <input
        type="text"
        placeholder="Search from menu..."
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        className="w-full px-6 py-4 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-500"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm('')}
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
      aria-label="Search"
    >
      <span className="relative z-10 flex items-center gap-2">
        <FaSearch />
        <span className="hidden sm:inline">Search</span>
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
    </button>
  </div>
</form>


      <div className="flex justify-center mt-6 px-8">
        <div className="flex items-center justify-between bg-orange-200 rounded px-2 py-1 w-full space-x-6">
          <button onClick={() => scrollNav(-1)} className="p-2 text-gray-600 hover:text-black"><FaChevronLeft/></button>
          <div ref={navRef} className="flex overflow-x-auto no-scrollbar px-2 space-x-11">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 whitespace-nowrap rounded font-medium ${activeCategory === cat ? 'bg-black text-white font-medium text-sm h-10 w-32 rounded transition' : 'text-gray-800 hover:bg-gray-200 h-10 w-32 '}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button onClick={() => scrollNav(1)} className="p-2 text-gray-600 hover:text-black"><FaChevronRight/></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row px-8 mt-6  ">
        <div className="flex-1">
         {activeCategory === 'Offers' && (
  <div 
    className="grid grid-cols-4 gap-4 p-2"
    style={{ overflowX: 'visible' }} 
  >
   {products.Offers.map(item => (
  <div key={item._id} className="flex justify-between items-start border-b py-4">
    <div className="flex items-start space-x-3">
      <div className="space-y-1">
        <h4 className="text-sm font-bold">{item.name}</h4>
        <p className="text-gray-400 text-xs w-48">{item.shortDescription}</p>
        <p className="text-xs font-semibold">Rs. {item.price}</p>

        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center"
            disabled={item.quantity <= 1}
          >
            −
          </button>
          <span className="text-sm font-semibold">{item.quantity}</span>
          <button
            onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </div>
    <button onClick={() => removeFromBasket(item._id)} className="text-gray-500 hover:text-red-600">
      <FaTrash size={16} />
    </button>
  </div>
))}

        </div>
      )}
          <div>
          </div>

          {!restaurant?.isOnline && (
        <div className="bg-red-100 text-red-700 text-center py-3 font-semibold mb-2">
          This restaurant is currently <span className="font-bold">Offline</span>. You cannot add items to your basket.
        </div>
      )}
         
         <div className="flex flex-col lg:flex-row px-2 gap-6">

        <div className="w-full lg:w-9/12">
        {activeCategory === 'All' ? (
  <div className="">
    {/* Show Offers */}
    {filteredOffers.length > 0 && (
      <>
        <h2 className="text-lg font-semibold mb-3">Offers</h2>
        <div className="grid grid-cols-3 gap-4 p-2">
          {filteredOffers.map(item => (
            <div key={item._id} className="relative h-60 rounded overflow-hidden shadow-lg">
              <div className="absolute bottom-52 right-2 bg-[#0D0C22] text-white text-sm font-bold px-1 py-1 rounded z-10 ">
                {item.value % 1 === 0 ? `${item.value} %` : '-%'}
              </div>
              <img
                src={item.offerImage ? `http://localhost:5000/uploads/menu_images/${item.offerImage}` : defaultCover1}
                alt="Offer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-black gap-2 bg-gradient-to-t from-white/50 to-transparent">
                {/* <p className="text-xs">{item.desc}</p> */}
                <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
              </div>
              <button
                  onClick={() => {
                    if (
                      !restaurant?.isOnline ||
                      (currentOffer && currentOffer._id === item._id) ||
                usedOffers.includes(item._id.toString())

                    ) {
                      return; // prevent action
                    }
                    applyOffer(item);
                  }}
                  disabled={
                    !restaurant?.isOnline ||
                    (currentOffer && currentOffer._id === item._id) ||
                  usedOffers.includes(item._id.toString())

                  }
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition ${
                    !restaurant?.isOnline ||
                    (currentOffer && currentOffer._id === item._id) ||
                usedOffers.includes(item._id.toString())

                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-black text-white hover:bg-orange-400 hover:text-black"
                  }`}
                >
                  <FaPlus />
                </button>

                {usedOffers.includes(item._id.toString()) && (
                  <p className="text-red-500 text-xs mt-1">You’ve already used this offer</p>
                )}



            </div>
          ))}
        </div>
      </>
    )}

    {/* Show Menu Items grouped by type */}
    {Object.entries(groupedMenus).map(([type, items]) => (
      <div key={type} className="mt-10">
        <h2 className="text-lg font-semibold mb-1">{type}</h2>
        <MenuGrid
          products={items}
          onAdd={handleAddToBasket}
          isDisabled={!restaurant?.isOnline}
        />
      </div>
    ))}
  </div>
) : (
  activeCategory !== 'Offers' && (
    <div className="mt-2">
      <h2 className="text-lg font-semibold mb-4">{activeCategory}</h2>
      <MenuGrid
        products={products[activeCategory]}
        onAdd={handleAddToBasket}
        isDisabled={!restaurant?.isOnline}
      />
    </div>
  )
)}



    {/* {!showAll && activeCategory === "All" && (
  <div className="flex justify-end items-center space-x-2 mt-4 pr-4">
    <p onClick={() => setShowAll(true)} className="cursor-pointer text-gray-600 text-sm font-bold hover:text-black transition">
      Show More Categories
    </p>
    <button onClick={() => setShowAll(true)} className="text-gray-600 hover:text-black transition">
      <FaChevronRight />
    </button>
  </div>
)} */}

  </div>

 <aside className="w-full lg:w-3/12 rounded shadow transition-all duration-300 mt-8 lg:mt-0 flex flex-col max-h-[90vh]">
  {/* Fixed Top */}
  <div className="bg-orange-300 text-center py-4 rounded-t">
    <h2 className="text-lg font-bold">My Bag</h2>
  </div>

  {/* Scrollable Middle Section */}
  <div className="flex-1 overflow-y-auto bg-white px-4 py-2">
    {basket.length === 0 ? (
      <p className="text-gray-500 text-center py-6">No items in basket.</p>
    ) : (
      basket.map(i => (
        <div key={i._id} className="flex justify-between items-start border-b py-4 space-x-1">
          <div className="bg-orange-300 text-black font-bold rounded-full w-7 h-7 p-2 flex items-center justify-center text-sm mr-2">
            {i.quantity}x
          </div>

          <div className="flex flex-col space-y-2 w-full">
            <h4 className="text-sm font-bold">{i.name}</h4>
            <p className="text-xs font-semibold">Rs. {i.price}</p>
            <p className="text-gray-400 text-xs w-48">{i.shortDescription}</p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateItemQuantity(i._id, i.quantity - 1)}
                disabled={i.quantity <= 1}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <p className='text-sm'>{i.quantity}</p>
              <button
                onClick={() => updateItemQuantity(i._id, i.quantity + 1)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="mt-2">
              {!i.showNote ? (
                i.note ? (
                  <div className="text-xs text-gray-600 flex items-center space-x-2">
                    {i.note?.trim() && (
                      <p className="text-xs text-gray-900">📝 {i.note}</p>
                    )}
                    <button
                      onClick={() => toggleNoteField(i._id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleNoteField(i._id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Add Note
                  </button>
                )
              ) : (
                <div className="flex flex-col space-y-1">
                  <textarea
                    autoFocus
                    value={i.note || ''}
                    onChange={(e) => updateNoteForItem(i._id, e.target.value)}
                    placeholder="Add special instructions..."
                    className="mt-1 w-40 max-w-xs border border-gray-300 rounded-md p-1 text-xs resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={() => toggleNoteField(i._id)}
                    className="text-xs text-gray-500 hover:text-black underline self-start"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1 ml-4">
            <button onClick={() => removeFromBasket(i._id)} className="text-gray-500 hover:text-red-600">
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      ))
    )}
  </div>

  {/* Fixed Bottom Summary & Checkout */}
  <div className="bg-white px-4 py-4 border-t">
    {basket.length > 0 && (
      <>
        <div className="flex justify-between py-1 font-medium text-gray-700 text-xs">
          <span>Sub Total:</span>
          <span>Rs. {subTotal.toFixed(0)}</span>
        </div>
        {currentOffer && (
          <div className="flex justify-between py-1 font-medium text-green-600 text-xs">
            <span>Offer Applied:</span>
            <span>- Rs. {offerDeduction.toFixed(0)} ({parseFloat(currentOffer.value)}%)</span>
          </div>
        )}
        <div className="flex justify-between py-1 font-medium text-gray-700 text-xs">
          <span>Delivery Fee:</span>
          <span>Rs. {basket.length ? deliveryFee : 0}</span>
        </div>
        <div className="bg-gray-200 mt-4 p-4 rounded text-black font-bold text-sm flex justify-between">
          <span>Total to pay</span>
          <span>Rs. {total.toFixed(0)}</span>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded"
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token || token === "undefined") {
                navigate("/login", {
                  state: { from: `/delivo-eats/checkout/${restaurant._id}` }
                });
              } else {
               navigate(`/delivo-eats/checkout/${restaurant._id}`, {
  state: {
    offerId: currentOffer?._id || null,
  }
});

              }
            }}
          >
            Checkout!
          </button>
        </div>
      </>
    )}
  </div>
</aside>

      </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}