import { createContext, useContext, useState } from "react";

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);
  const [offerPercentage, setOfferPercentage] = useState(0);
  const deliveryFee = 90;

  const addToBasket = (item, isOffer = false) => {
    if (isOffer && item.discount) {
      const discountValue = parseInt(item.discount.replace(/[-%]/g, ""));
      setOfferPercentage(discountValue);
      return;
    }

    setBasket(prev => {
      const existing = prev.find(i => i.id === item.id);
      return existing
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromBasket = id => {
    setBasket(prev => prev.filter(item => item.id !== id));
  };

  const subTotal = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountedTotal = subTotal - (subTotal * (offerPercentage / 100));
  const total = discountedTotal + (basket.length > 0 ? deliveryFee : 0);

  return (
    <BasketContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        offerPercentage,
        subTotal,
        total,
        deliveryFee
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);
