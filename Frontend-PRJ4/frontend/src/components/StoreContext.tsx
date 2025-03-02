import React, { createContext, useContext, useState, ReactNode } from "react";

type StoreStatusType = {
  [key: string]: boolean;
};

interface StoreContextProps {
  storeStatus: StoreStatusType;
  toggleStore: (store: string) => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

//change when data added
export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storeStatus, setStoreStatus] = useState<StoreStatusType>({
    Bilka: true,
    Netto: true,
    Foetex: true,
  });

  const toggleStore = (store: string) => {
    setStoreStatus((prevStatus) => ({
      ...prevStatus,
      [store]: !prevStatus[store],
    }));
  };

  return (
    <StoreContext.Provider value={{ storeStatus, toggleStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = (): StoreContextProps => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
};
