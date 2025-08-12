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
  image_url?: string;
  product_url?: string;
  deliver_from?: string;
  destination: string | null;
  wait_time: string | null;

  custom_products: Product[];

  setTravelerId: (id: string | null) => void;

  setOrderDetails: (data: Partial<TravelerOrderState>) => void;

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
  product_url: '',

  deliver_from: null,
  destination: null,
  wait_time: null,

  custom_products: [],

  setTravelerId: (id) => {
    const cleanId = id && id.trim() !== '' ? id : null;
    console.log('Setting travelerId:', cleanId);
    set({ travelerId: cleanId });
  },

  setOrderDetails: (data) => {
    set((state) => ({
      ...state,
      ...data,
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
      product_url: '',
      deliver_from: null,
      destination: null,
      wait_time: null,
      custom_products: [],
    });
  },
}));
