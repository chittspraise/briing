import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import * as Notifications from 'expo-notifications';
import { useAuth } from './authProvider';

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
  const { session } = useAuth();
  const user = session?.user;

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:product_orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'product_orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Change received!', payload);
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          const itemName = payload.new.item_name;

          if (oldStatus !== newStatus) {
            let message = '';
            if (newStatus === 'confirmed') {
              message = `Your order for "${itemName}" has been confirmed!`;
            } else if (newStatus === 'shipped') {
              message = `Your order for "${itemName}" is on its way!`;
            } else if (newStatus === 'delivered') {
              message = `Your order for "${itemName}" has been delivered!`;
            }

            if (message) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "Order Status Updated",
                  body: message,
                },
                trigger: null, // Immediately
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
