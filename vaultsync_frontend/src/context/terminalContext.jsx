import { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const TerminalContext = createContext();

// Proveedor del contexto
export function TerminalProvider({ children }) {
    // Recuperar valor desde localStorage si existe
    const storedTerminal = localStorage.getItem('terminal') === 'true';

    const [terminal, setTerminal] = useState(storedTerminal);

    // Guardar en localStorage cada vez que `terminal` cambie
    useEffect(() => {
        localStorage.setItem('terminal', terminal.toString());
    }, [terminal]);

    return (
        <TerminalContext.Provider value={{ terminal, setTerminal }}>
            {children}
        </TerminalContext.Provider>
    );
}
