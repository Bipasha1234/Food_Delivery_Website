import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/afterLoginHomePageHeader";
import Footer from "../../../components/footer";
import StripeCheckoutForm from "../../../components/stripCheckoutForm";
const stripePromise = loadStripe("pk_test_51RglMjQoydzmt3nRQHggo8gshMucKHcpUL6WWhMLy6s6SNCJSs9f7e9tlGI0EejvVYfTE5JSkeNTZ4PAKeYsZeWM00rTF5Dp9D");

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
const { restaurantId } = useParams();


const { offerId  } = location.state || {};

const [restaurantName, setRestaurantName] = useState("");


  const [savedAddress, setSavedAddress] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("now");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
const [addressError, setAddressError] = useState("");

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [offerPercentage, setOfferPercentage] = useState(0);
const [basket, setBasket] = useState([]);
const [currentSubTotal, setCurrentSubTotal] = useState(0);
const [currentTotal, setCurrentTotal] = useState(0);
const [currentOfferDeduction, setCurrentOfferDeduction] = useState(0);
const [deliveryFee, setDeliveryFee] = useState(50);

useEffect(() => {
  const fetchBasket = async () => {
    if (!restaurantId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/orders/basket?restaurantId=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

    if (res.status === 200) {
  const {
    items = [],
    offerPercentage = 0,
    subTotal = 0,
    offerDeduction = 0,
    deliveryFee = 50,
    total = 0
  } = res.data;

  setBasket(items);
  setOfferPercentage(offerPercentage);
  setCurrentSubTotal(subTotal);
  setCurrentOfferDeduction(offerDeduction);
  setDeliveryFee(deliveryFee);
  setCurrentTotal(total);
}

    } catch (error) {
      console.error("Error loading basket from backend:", error);
    }
  };

  fetchBasket();
}, [restaurantId]);
useEffect(() => {
  if (basket && basket.length) {
    updateTotals(basket);
  } else {
    setCurrentSubTotal(0);
    setCurrentOfferDeduction(0);
    setCurrentTotal(deliveryFee || 0);
  }
}, [basket, offerPercentage, deliveryFee]);


useEffect(() => {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  if (!isLoggedIn || !restaurantId) return;

  const mergeGuestCart = async () => {
    try {
      // Load guest baskets from localStorage
      const guestBaskets = JSON.parse(localStorage.getItem("guestBasket") || "[]");
      const guestCart = guestBaskets.find(b => b.restaurantId === restaurantId);

      if (!guestCart || !guestCart.items?.length) {
        return; // No guest cart for this restaurant, nothing to merge
      }

      // Call backend API to merge guest cart into logged-in user's cart
      await axios.post("http://localhost:5000/api/orders/merge-cart", {
        restaurantId: restaurantId,
        items: guestCart.items,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // After merge, fetch updated basket from backend
      const res = await axios.get(`http://localhost:5000/api/orders/basket?restaurantId=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setBasket(res.data.items || []);
        setOfferPercentage(res.data.offerPercentage || 0);
        updateTotals(res.data.items || []);
      }

      // Remove merged guest basket from localStorage
      const filtered = guestBaskets.filter(b => b.restaurantId !== restaurantId);
      localStorage.setItem("guestBasket", JSON.stringify(filtered));
    } catch (error) {
      console.error("Error merging guest cart:", error);
    }
  };

  mergeGuestCart();
}, [restaurantId]);

  useEffect(() => {
    const fetchSavedLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/location", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.address) {
          setSavedAddress(res.data.address);
        }
      } catch (error) {
        console.error("Error fetching saved location:", error);
      }
    };

    fetchSavedLocation();
  }, []);

  const updateTotals = (currentBasket) => {
    let newSubTotal = currentBasket.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let offerDed = (newSubTotal * offerPercentage) / 100;
    let newTotal = newSubTotal - offerDed + (currentBasket.length ? deliveryFee : 0);

    setCurrentSubTotal(newSubTotal);
    setCurrentOfferDeduction(offerDed);
    setCurrentTotal(newTotal);
  };

  const handleRemoveItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/orders/basket/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedBasket = basket.filter(item => item._id.toString() !== id);
      setBasket(updatedBasket);
      updateTotals(updatedBasket);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

 const handlePlaceOrder = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated.");
      return;
    }

    setLoading(true);

    const orderPayload = {
        offerId,
      basket,
      offerPercentage,
      subTotal: currentSubTotal,
      offerDeduction: currentOfferDeduction,
      total: currentTotal,
      deliveryFee,
      restaurantId,
      restaurantName,
      paymentMethod,
      specialInstructions,
      deliveryOption,
      date: deliveryOption === "later" ? date : "Today",
      time: deliveryOption === "later" ? time : "Now",
      address: savedAddress
    };

    const res = await axios.post("http://localhost:5000/api/orders", orderPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 201) {
      console.log("Order placed successfully:", res.data);
      setShowSummary(false);
      setShowConfirmation(true);

   
      await axios.delete(`http://localhost:5000/api/orders/clear?restaurantId=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });


      setBasket([]);
      setOrderPlaced(true);
      setSpecialInstructions("");    
      setDeliveryOption("now");      
      setDate("");
      setTime("");
      setPaymentMethod("cash");      
      setCurrentSubTotal(0);          
      setCurrentOfferDeduction(0);
      setCurrentTotal(0);
    }
  } catch (error) {
    console.error("Error clearing basket:", error.response ? error.response.data : error.message);
    alert("Failed to place order. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleQuantityChange = (itemId, newQty) => {
  setBasket(prev =>
    prev.map(item =>
      item._id === itemId ? { ...item, quantity: newQty } : item
    )
  );
};

const toggleNoteField = (itemId) => {
  setBasket(prev =>
    prev.map(item =>
      item._id === itemId ? { ...item, showNote: !item.showNote } : item
    )
  );
};

const updateNoteForItem = (itemId, noteText) => {
  setBasket(prev =>
    prev.map(item =>
      item._id === itemId ? { ...item, note: noteText } : item
    )
  );
};


  const handleAddMoreItems = () => {
    if (!restaurantId) return;
    navigate(`/certain-restaurant/${restaurantId}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen mt-20 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h3 className="font-bold text-xl mb-2">Checkout</h3>
            {addressError && (
            <div
              className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6 justify-center text-[12px]"
              role="alert"
            >
              ⚠️
              <p className="font-normal text-[12px] ml-2">{addressError}</p>
            </div>
          )}

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-medium text-sm mb-2">Delivery Address</h3>
            <p className="text-xs text-gray-500">{savedAddress || "No saved address found"}</p>
          </div>

          <div className="bg-white rounded shadow p-4 space-y-2">
            <h3 className="font-medium text-sm mb-2">Delivery Date and Time</h3>
            <div className="flex items-center space-x-2">
              <input type="radio" checked={deliveryOption === "now"} onChange={() => setDeliveryOption("now")} />
              <label className="text-xs">Right Now</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" checked={deliveryOption === "later"} onChange={() => setDeliveryOption("later")} />
              <label className="text-xs">Schedule</label>
              <select
                className="border rounded px-2 py-1 text-xs"
                disabled={deliveryOption !== "later"}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              >
                <option value="">Today</option>
                <option value="Tomorrow">Tomorrow</option>
              </select>
              <select
                className="border rounded px-2 py-1 text-xs"
                disabled={deliveryOption !== "later"}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">Select Time</option>
                <option value="10:00">10:00 AM</option>
                <option value="14:00">2:00 PM</option>
                 <option value="10:00">3:00 AM</option>
                <option value="14:00">4:00 PM</option>
                 <option value="10:00">6:00 AM</option>
                <option value="14:00">8:00 PM</option>
                 <option value="10:00">9:00 AM</option>
                <option value="14:00">10:00 PM</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-medium text-sm mb-2">Special Instructions</h3>
            <textarea
              rows="4"
              autoComplete="off"
              className="w-full border rounded p-2 text-xs"
              placeholder="Any delivery instructions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            ></textarea>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-medium text-sm mb-2">Payment Method</h3>
            <div className="flex items-center space-x-4 text-xs">
              <label className="flex items-center space-x-2">
                <input type="radio" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
                <span>Cash on Delivery</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
                <span>Online Payment</span>
              </label>
            </div>
          </div>
          <div className="flex justify-center space-x-8">
            
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800  font-medium text-sm h-10 w-32 rounded transition"
            >
              Go Back
            </button>
               <button
              onClick={() => {
                if (!savedAddress) {
                  setAddressError("Please set your delivery address before proceeding.");
                  return;
                }

                setAddressError(""); // clear error if address is valid

                if (paymentMethod === "online") {
                  setShowPaymentModal(true);
                } else {
                  setShowSummary(true);
                }
              }}

  disabled={orderPlaced || loading || basket.length === 0}
  className={`bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition ${
    (orderPlaced || loading || basket.length === 0) ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  Continue
</button>

          </div>
        </div>

       <aside className="bg-white rounded shadow h-fit mt-12 transition-all duration-300 w-full lg:w-80 flex flex-col max-h-[600px]">
  {/* Fixed Top Header */}
  <div className="bg-orange-300 text-center py-4 rounded-t">
    <h2 className="text-lg font-bold">My Bag</h2>
  </div>

  {/* Scrollable Basket Items */}
  <div className="flex-1 overflow-y-auto max-h-[300px] px-4 py-2">
    {basket.length === 0 ? (
      <p className="text-gray-500 text-sm text-center py-6">No items in basket.</p>
    ) : (
      basket.map((item) => (
        <div key={item._id} className="flex justify-between items-start border-b py-4">
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center space-y-1">
              <p className="bg-orange-300 text-black font-bold rounded-full w-7 h-7 flex items-center justify-center text-xs">
                {item.quantity}x
              </p>
            </div>

            <div className="text-xs space-y-1 w-[10.5rem]">
              <p className="text-xs font-bold text-gray-800">Rs. {item.price}</p>
              <h4 className="font-bold text-black text-sm">{item.name}</h4>
              <p className="text-gray-400 text-xs w-48">{item.shortDescription}</p>
              <div className="flex items-center space-x-3">
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
                  <div className="flex items-center space-x-2">
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
                    className="text-xs text-blue-600 hover:underline"
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

          <button
            onClick={() => handleRemoveItem(item._id)}
            className="text-gray-400 hover:text-red-500"
          >
            <FaTrash />
          </button>
        </div>
      ))
    )}
  </div>
<div className="text-center py-3 flex items-center border-t justify-center">
      <button
        onClick={handleAddMoreItems}
        className="text-xs font-normal text-gray-700 hover:text-black flex justify-center items-center space-x-2"
      >
        <span>Add More Items</span>
        <FaPlus/>
      </button>
    </div>
  {/* Fixed Bottom Summary */}
  <div className="px-4 pb-4 border-t mt-auto">
    {basket.length > 0 && (
      <>
        <div className="text-xs font-medium text-gray-700 pt-4">
          <div className="flex justify-between py-1">
            <span>Sub Total:</span>
            <span>Rs. {currentSubTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-green-600 py-1">
            <span>Offer Applied:</span>
            <span>- Rs. {currentOfferDeduction.toFixed(0)} ({offerPercentage}%)</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Delivery Fee:</span>
            <span>Rs. {deliveryFee}</span>
          </div>
        </div>

        <div className="bg-gray-200 mt-4 p-4 rounded text-black font-bold text-sm flex justify-between">
          <span>Total to pay</span>
          <span>Rs. {currentTotal.toFixed(0)}</span>
        </div>
      </>
    )}
  </div>
</aside>

      </div>

     {showSummary && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white relative rounded shadow-lg p-7 w-full max-w-md space-y-5 max-h-[80vh] flex flex-col">
      <h2 className="text-base font-medium text-center">Your Total Order</h2>

      {/* Scrollable container for order items */}
      <div className="overflow-y-auto max-h-48 space-y-3">
        {basket.map((item) => (
          <div key={item._id} className="flex justify-between items-center border-b py-2">
            <div className="flex items-start space-x-3">
              <div className="bg-orange-300 text-black font-bold rounded-full w-7 h-7 flex items-center justify-center text-xs">
                {item.quantity}x
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold">Rs. {item.price}</p>
                <h4 className="text-sm font-bold">{item.name}</h4>
                <p className="text-xs text-gray-400">{item.shortDescription}</p>
            {item.note?.trim() && (
  <p className="text-xs text-gray-900">📝 {item.note}</p>
)}

              </div>
            </div>
            {/* <button onClick={() => handleRemoveItem(item._id)} className="text-gray-500 hover:text-red-600">
              <FaTrash size={16} />
            </button> */}
          </div>
        ))}
      </div>

      <div className="text-xs font-medium text-gray-800 pt-4 ">
        <div className="flex justify-between py-1 font-normal text-gray-700 text-xs">
          <span>Sub Total:</span>
          <span>Rs. {currentSubTotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-green-600 py-1 font-normal text-xs">
          <span>Offer Applied:</span>
          <span>- Rs. {currentOfferDeduction.toFixed(0)} ({offerPercentage}%)</span>
        </div>

        <div className="flex justify-between py-1 font-normal text-gray-700 text-xs">
          <span>Delivery Fee:</span>
          <span>Rs. {deliveryFee}</span>
        </div>
      </div>

      <div className="bg-gray-200 mt-4 p-4 rounded text-black font-bold text-sm flex justify-between">
        <span>Total to Pay:</span>
        <span>Rs. {currentTotal.toFixed(0)}</span>
      </div>

      <button
        onClick={() => setShowSummary(false)}
        className="absolute top-2 right-3 text-gray-700 hover:text-red-600 text-xl font-bold"
      >
        <FaTimes />
      </button>

      <div className="flex justify-center pt-2">
        {paymentMethod === "online" ? null : (
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className={`bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Confirm Order
          </button>
        )}
      </div>
    </div>
  </div>
)}


      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white relative rounded shadow-lg p-8 w-full max-w-md text-center space-y-4">
            <button onClick={() => setShowConfirmation(false)} className="absolute top-2 right-3 text-gray-700 hover:text-red-600 text-xl font-bold"><FaTimes /></button>
            <h2 className="text-base font-medium text-black underline">Your order is confirmed.</h2>
            <p className="text-sm text-gray-700 ">Track your order –</p>
            <Link to="/delivo-eats/track-order">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition mt-3">
                Track Order
              </button>
            </Link>
            <p className="text-sm text-gray-600">Thank you so much for your order.</p>
          </div>
        </div>
      )}
      {showPaymentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded shadow-lg p-7 w-full max-w-md relative">
      <button
        onClick={() => setShowPaymentModal(false)}
        className="absolute top-2 right-3 text-gray-700 hover:text-red-600 text-xl font-bold"
      >
        <FaTimes />
      </button>

      <h2 className="text-base font-medium mb-4 text-center">Enter Payment Details</h2>

      <Elements stripe={stripePromise}>
        <StripeCheckoutForm
          amount={currentTotal}
          onSuccess={() => {
            setShowPaymentModal(false);
            handlePlaceOrder();  
          }}
        />
      </Elements>
    </div>
  </div>
)}


      <Footer />
    </>
  );
}
