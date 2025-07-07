import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useState } from "react";

export default function StripeCheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError(null);

    // Get the card elements
    const cardNumber = elements.getElement(CardNumberElement);
    const cardExpiry = elements.getElement(CardExpiryElement);
    const cardCvc = elements.getElement(CardCvcElement);
    

    // Check if all elements are complete
    if (!cardNumber._complete || !cardExpiry._complete || !cardCvc._complete) {
      setError("Please fill in all card details correctly.");
      return;
    }

    setProcessing(true);

    try {
      const { data } = await axios.post("http://localhost:5000/create-payment-intent", {
         amount: Math.round(amount),
      });
      

      const clientSecret = data.clientSecret;

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
      } else if (paymentResult.paymentIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 gap-2 rounded text-sm flex justify-center items-center">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <label className="text-xs">
          Card Number
          <CardNumberElement className="border p-2 rounded w-full" />
        </label>

        <label className="text-xs">
          Expiration Date
          <CardExpiryElement className="border p-2 rounded w-full" />
        </label>

        <label className="text-xs">
          CVC
          <CardCvcElement className="border p-2 rounded w-full" />
        </label>
      </div>

      <div className="flex items-center justify-center">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
        >
          {processing ? "Processing..." : `Pay Rs. ${amount.toFixed(0)}`}
        </button>
      </div>
    </form>
  );
}
