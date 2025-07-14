import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of your order
type Order = {
  item_name: string;
  price: string;
  quantity: string;
  details: string;
  with_box: boolean;
  image_url: string | null;
  deliver_from: string;
  destination: string;
  wait_time: string;
  store?: string | null; // ✅ Store added and marked optional

};

// Define the shape of the context
type OrderContextType = {
  order: Partial<Order>;
  setOrder: Dispatch<SetStateAction<Partial<Order>>>;
  clearOrder: () => void;
};

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Create the provider component
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [order, setOrder] = useState<Partial<Order>>({});

  const clearOrder = () => {
    setOrder({});
  };

  return (
    <OrderContext.Provider value={{ order, setOrder, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use the order context
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
