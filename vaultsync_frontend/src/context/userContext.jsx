import { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const ContactContext = createContext();

// Proveedor del contexto
export function ContactProvider({ children }) {
    // Recuperar datos de localStorage si existen
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        email: '',
        contrasena: '',
    };

    const [userInfo, setUserInfo] = useState(storedUserInfo);

    // Guardar en localStorage cada vez que `userInfo` cambie
    useEffect(() => {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }, [userInfo]);

    return (
        <ContactContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </ContactContext.Provider>
    );
}