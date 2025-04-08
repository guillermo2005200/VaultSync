import { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const RutaContext = createContext();

// Proveedor del contexto
export function RutaProvider({ children }) {
    // Recuperar ruta desde localStorage si existe
    const storedRuta = localStorage.getItem('ruta') || "";

    const [ruta, setRuta] = useState(storedRuta);

    // Guardar en localStorage cada vez que `ruta` cambie
    useEffect(() => {
        localStorage.setItem('ruta', ruta);
    }, [ruta]);

    return (
        <RutaContext.Provider value={{ ruta, setRuta }}>
            {children}
        </RutaContext.Provider>
    );
}
