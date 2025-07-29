// TravelProvider.tsx

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type Travel = {
  from_country: string;
  to_country: string;
  departure_date: string;
  return_date: string;
  traveler_name: string;
  is_available: boolean;
  notes: string;
  budget: number;
};

type TravelContextType = {
  travel: Partial<Travel>;
  setTravel: Dispatch<SetStateAction<Partial<Travel>>>;
  clearTravel: () => void;
};

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [travel, setTravel] = useState<Partial<Travel>>({});

  const clearTravel = () => setTravel({});

  return (
    <TravelContext.Provider value={{ travel, setTravel, clearTravel }}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = (): TravelContextType => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
