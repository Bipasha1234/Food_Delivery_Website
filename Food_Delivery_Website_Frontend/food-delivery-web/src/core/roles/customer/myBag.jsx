import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/afterLoginHomePageHeader";
import Footer from "../../../components/footer";
import GuestHeader from "../../../components/header";

export default function MyBag() {
  const navigate = useNavigate();
  const [allBaskets, setAllBaskets] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [subTotal, setSubTotal] = useState(0);
  const [offerDeduction, setOfferDeduction] = useState(0);
  const [total, setTotal] = useState(0);
  const deliveryFee = 50;
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Load basket data either from API (if logged in) or localStorage (guest)
  useEffect(() => {
    if (token) {
      const fetchBaskets = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/orders/basket/all", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const nonEmptyBaskets = res.data.filter(b => b.items && b.items.length > 0);
          setAllBaskets(nonEmptyBaskets);

          if (nonEmptyBaskets.length > 0) {
            setSelectedRestaurantId(nonEmptyBaskets[0].restaurantId);
          }
        } catch (error) {
          console.error("Error fetching all baskets:", error);
        }
      };

      fetchBaskets();
    } else {
      const guestBasketJSON = localStorage.getItem("guestBasket");
      if (guestBasketJSON) {
        try {
          const guestBasket = JSON.parse(guestBasketJSON)
  .map(basket => ({
    ...basket,
    items: basket.items || []
  }))
  .filter(basket => basket.items.length > 0); 


          setAllBaskets(guestBasket);
          console.log("Guest basket loaded:", guestBasket);


          if (guestBasket.length > 0) {
            setSelectedRestaurantId(guestBasket[0].restaurantId);
          }
        } catch (e) {
          console.error("Failed to parse guest basket:", e);
        }
      }
    }
  }, []);

  // Calculate totals
  useEffect(() => {
    const selected = allBaskets.find(b => b.restaurantId === selectedRestaurantId);
    if (!selected) {
      setSubTotal(0);
      setOfferDeduction(0);
      setTotal(0);
      return;
    }

    const basket = selected.items || [];
    const offerPercentage = selected.offerPercentage || 0;

    const newSubTotal = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const offerDed = (newSubTotal * offerPercentage) / 100;
    const newTotal = newSubTotal - offerDed + (basket.length ? deliveryFee : 0);

    setSubTotal(newSubTotal);
    setOfferDeduction(offerDed);
    setTotal(newTotal);
  }, [selectedRestaurantId, allBaskets]);

  const handleRemoveItem = async (itemId) => {
  if (token) {
    // Logged-in user logic (already implemented)
    try {
      await axios.delete(`http://localhost:5000/api/orders/basket/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = allBaskets
        .map(basket =>
          basket.restaurantId === selectedRestaurantId
            ? { ...basket, items: basket.items.filter(i => i._id !== itemId) }
            : basket
        )
        .filter(basket => basket.items.length > 0);

  setAllBaskets(updated);
if (!token) {
  localStorage.setItem("guestBasket", JSON.stringify(updated));
}


      if (!updated.find(b => b.restaurantId === selectedRestaurantId)) {
        setSelectedRestaurantId(updated.length > 0 ? updated[0].restaurantId : null);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  } else {
    // Guest user logic
    const guestBasketJSON = localStorage.getItem("guestBasket");
    if (!guestBasketJSON) return;

    try {
      const guestBasket = JSON.parse(guestBasketJSON);
      const updated = guestBasket
        .map(basket =>
          basket.restaurantId === selectedRestaurantId
            ? { ...basket, items: basket.items.filter(i => i._id !== itemId) }
            : basket
        )
        .filter(basket => basket.items.length > 0);

      setAllBaskets(updated);
      localStorage.setItem("guestBasket", JSON.stringify(updated));

      if (!updated.find(b => b.restaurantId === selectedRestaurantId)) {
        setSelectedRestaurantId(updated.length > 0 ? updated[0].restaurantId : null);
      }
    } catch (error) {
      console.error("Error handling guest item removal:", error);
    }
  }
};


  // Proceed to checkout
  const handleCheckout = () => {
    if (!token) {
      // alert("Please log in to proceed to checkout.");
      navigate("/login");
      return;
    }

    const selected = allBaskets.find(b => b.restaurantId === selectedRestaurantId);
    if (!selected || selected.items.length === 0) {
      alert("Your basket is empty!");
      return;
    }

    navigate(`/delivo-eats/checkout/${selected.restaurantId}`, {
      state: {
        basket: selected.items,
        offerPercentage: selected.offerPercentage || 0,
        subTotal,
        offerDeduction,
        total,
        deliveryFee,
        restaurantId: selected.restaurantId,
        restaurantName: selected.restaurantName,
      },
    });
  };

 const handleQuantityChange = (itemId, newQty) => {
  setAllBaskets(prevBaskets =>
    prevBaskets.map(basket => {
      if (basket.restaurantId !== selectedRestaurantId) return basket;

      const updatedItems = basket.items.map(item => {
        if (item._id !== itemId) return item;
        return { ...item, quantity: newQty };
      });

      return { ...basket, items: updatedItems };
    })
  );
};

const toggleNoteField = (itemId) => {
  setAllBaskets(prevBaskets =>
    prevBaskets.map(basket => {
      if (basket.restaurantId !== selectedRestaurantId) return basket;

      const updatedItems = basket.items.map(item => {
        if (item._id !== itemId) return item;
        return { ...item, showNote: !item.showNote };
      });

      return { ...basket, items: updatedItems };
    })
  );
};

const updateNoteForItem = (itemId, noteText) => {
  const updatedBaskets = allBaskets.map(basket => {
    if (basket.restaurantId !== selectedRestaurantId) return basket;

    const updatedItems = basket.items.map(item => {
      if (item._id !== itemId) return item;
      return { ...item, note: noteText };
    });

    return { ...basket, items: updatedItems };
  });

  setAllBaskets(updatedBaskets);

  if (!token) {
    localStorage.setItem("guestBasket", JSON.stringify(updatedBaskets));
  }
};



 useEffect(() => {
  if (!token || !selectedBasket || !selectedBasket.items?.length) return;

  const saveBasketWithNotes = async () => {
    try {
      await axios.post("http://localhost:5000/api/orders/basket", {
        items: selectedBasket.items,
        offerPercentage: selectedBasket.offerPercentage || 0,
        restaurantId: selectedBasket.restaurantId,
        restaurantName: selectedBasket.restaurantName,
        city: selectedBasket.city,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to save basket:", err);
    }
  };

  saveBasketWithNotes();
}, [allBaskets, selectedRestaurantId]);



const handleAddMoreItems = () => {
    if (!selectedRestaurantId) return;
    navigate(`/certain-restaurant/${selectedRestaurantId}`);
  };

  const selectedBasket = allBaskets.find(b => b.restaurantId === selectedRestaurantId);

  return (
    <div className="min-h-screen flex flex-col">
      {isLoggedIn ? <Header /> : <GuestHeader />}

      <div className="min-h-screen p-6 mt-20 flex justify-center">
        <div className="max-w-2xl w-full bg-white rounded shadow overflow-hidden">
          {allBaskets.length > 0 && (
            <div className="p-6 border-b">
              <label className="block mb-3 text-base font-semibold">Select Restaurant</label>
              <select
                value={selectedRestaurantId || ""}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm text-gray-700"
              >
                {allBaskets.map((basket, idx) => (
  <option
    key={basket.restaurantId || `${basket.restaurantName}-${idx}`}
    value={basket.restaurantId}
  >
    {basket.restaurantName} ({basket.city})
  </option>
))}

              </select>
            </div>
          )}

{selectedBasket && selectedBasket.items.length > 0 ? (

            <>
             <div className="max-h-[100vh] flex flex-col">
  {/* Fixed Top: Restaurant Info */}
  <div className="p-6">
    <h2 className="text-base font-semibold">{selectedBasket.restaurantName}</h2>
    <p className="text-xs text-gray-500">{selectedBasket.city}</p>
  </div>

  {/* Scrollable Middle: Basket Items + Add More */}
  <div className="flex-1 overflow-y-auto  px-4">
    {selectedBasket.items.map((item, index) => (
      <div key={item._id || `${item.name}-${index}`} className="flex justify-between items-start py-4  border-b">
        <div className="flex items-start space-x-3 ml-4">
          <div className="bg-orange-300 text-black font-bold rounded-full w-7 h-7 flex items-center justify-center text-xs">
            {item.quantity}x
          </div>
          <div className="text-xs">
            <h4 className="text-gray-800 text-sm">{item.name}</h4>
            <p className="text-gray-500 text-xs w-80">{item.shortDescription}</p>
            
          

             <div className="flex items-center space-x-3 mt-2">
                <button
                  onClick={() => handleQuantityChange(item._id, Math.max(item.quantity - 1, 1))}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <p className="text-sm">{item.quantity}</p>
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {!item.showNote ? (
                item.note ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="text-xs text-gray-900">📝 {item.note}</p>
                    <button
                      onClick={() => toggleNoteField(item._id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleNoteField(item._id)}
                    className="text-xs text-blue-600 hover:underline mt-2"
                  >
                    Add Note
                  </button>
                )
              ) : (
                <div className="flex flex-col space-y-1">
                  <textarea
                    value={item.note || ""}
                    onChange={(e) => updateNoteForItem(item._id, e.target.value)}
                    placeholder="Write a note..."
                    rows={2}
                    className="w-full border border-gray-300 rounded p-1 text-xs resize-none"
                  />
                  <button
                    onClick={() => toggleNoteField(item._id)}
                    className="text-[11px] text-gray-600 hover:text-black underline self-start"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
    
        
        </div>
        <div className="text-right flex space-x-12 mr-1 mt-2">
          <p className="text-sm font-bold text-gray-800 mr-14">Rs. {item.price}</p>
          <button
            onClick={() => handleRemoveItem(item._id)}
            className="text-gray-400 hover:text-red-500"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    ))}

    
  </div>
<div className="text-center py-3 flex items-center justify-center">
      <button
        onClick={handleAddMoreItems}
        className="text-xs font-normal text-gray-700 hover:text-black flex justify-center items-center space-x-2"
      >
        <span>Add More Items</span>
        <FaPlus />
      </button>
    </div>
  {/* Fixed Bottom: Price Summary + Checkout */}
  <div className="border-t px-6 py-4 text-sm text-gray-800 bg-white">
    <div className="flex justify-between py-1 font-medium text-gray-700 text-xs">
      <span>Sub Total:</span>
      <span className="font-bold">Rs. {subTotal.toFixed(0)}</span>
    </div>

    {selectedBasket.offerPercentage > 0 && (
      <div className="flex justify-between py-1 font-medium text-xs text-green-600">
        <span>Offer Applied:</span>
        <span className="font-bold">
          - Rs. {offerDeduction.toFixed(0)} ({selectedBasket.offerPercentage}%)
        </span>
      </div>
    )}

    <div className="flex justify-between py-1 font-medium text-gray-700 text-xs">
      <span>Delivery Fee:</span>
      <span className="font-bold">
        Rs. {selectedBasket.items?.length ? deliveryFee : 0}
      </span>
    </div>

    <div className="bg-gray-200 mt-4 p-4 rounded text-black font-bold text-base flex justify-between">
      <span>Total to pay</span>
      <span>Rs. {total.toFixed(0)}</span>
    </div>

    <div className="flex justify-center items-center mt-6">
      <button
        onClick={handleCheckout}
        className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded transition"
      >
        Checkout!
      </button>
    </div>
  </div>
</div>

            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Your bag is empty. Add items first.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
