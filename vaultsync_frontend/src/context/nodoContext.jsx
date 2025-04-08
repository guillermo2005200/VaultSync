import { createContext, useState } from 'react';

export const NodoContext = createContext();

export function NodoProvider({ children }) {
  const [nodoActivo, setNodoActivo] = useState(null);

  return (
    <NodoContext.Provider value={{ nodoActivo, setNodoActivo }}>
      {children}
    </NodoContext.Provider>
  );
}
