import { create } from 'zustand';

interface Product {
  name: string;
  price: string;
  quantity: number;
}

interface TravelerOrderState {
  travelerId: string | null;

  item_name: string;
  store: string | null;
  price: string;
  quantity: string;
  details: string;
  with_box: boolean;
  image_url: string;

  deliver_from: string | null;
  destination: string | null;
  wait_time: string | null;

  custom_products: Product[];

  setTravelerId: (id: string | null) => void;

  setOrderDetails: (data: {
    traveler_id?: string | null;
    item_name: string;
    store?: string | null;
    price: string;
    quantity: string;
    details: string;
    with_box: boolean;
    image_url: string;
    custom_products?: Product[];
  }) => void;

  setDeliveryDetails: (data: {
    deliver_from: string;
    destination: string;
    wait_time: string;
  }) => void;

  setCustomProducts: (products: Product[]) => void;

  clearOrder: () => void;
}

export const useTravelerOrderStore = create<TravelerOrderState>((set) => ({
  travelerId: null,

  item_name: '',
  store: null,
  price: '0',
  quantity: '1',
  details: '',
  with_box: false,
  image_url: '',

  deliver_from: null,
  destination: null,
  wait_time: null,

  custom_products: [],

  setTravelerId: (id) => {
    const cleanId = id && id.trim() !== '' ? id : null;
    console.log('Setting travelerId:', cleanId);
    set({ travelerId: cleanId });
  },

  setOrderDetails: ({
    traveler_id,
    item_name,
    store,
    price,
    quantity,
    details,
    with_box,
    image_url,
    custom_products,
  }) => {
    const cleanTravelerId = traveler_id && traveler_id.trim() !== '' ? traveler_id : null;

    console.log('Setting order details:', {
      traveler_id: cleanTravelerId,
      item_name,
      store,
      price,
      quantity,
      details,
      with_box,
      image_url,
      custom_products,
    });

    set((state) => ({
      ...state,
      travelerId: cleanTravelerId,  // <--- update travelerId even if null
      item_name,
      store: store ?? null,
      price,
      quantity,
      details,
      with_box,
      image_url,
      custom_products: custom_products ?? state.custom_products,
    }));
  },

  setDeliveryDetails: ({ deliver_from, destination, wait_time }) => {
    console.log('Setting delivery details:', {
      deliver_from,
      destination,
      wait_time,
    });
    set((state) => ({
      ...state,
      deliver_from,
      destination,
      wait_time,
    }));
  },

  setCustomProducts: (products) => {
    console.log('Setting custom products:', products);
    set({ custom_products: products });
  },

  clearOrder: () => {
    console.log('Clearing order store');
    set({
      travelerId: null,
      item_name: '',
      store: null,
      price: '0',
      quantity: '1',
      details: '',
      with_box: false,
      image_url: '',
      deliver_from: null,
      destination: null,
      wait_time: null,
      custom_products: [],
    });
  },
}));
