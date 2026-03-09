'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>( {
    theme: 'dark',
    toggleTheme: () => { },
} );

export function useTheme() {
    return useContext( ThemeContext );
}

export function ThemeProvider( { children }: { children: React.ReactNode } ) {
    const [theme, setTheme] = useState<Theme>( 'dark' );

    useEffect( () => {
        const stored = localStorage.getItem( 'melio-theme' ) as Theme | null;
        if ( stored ) setTheme( stored );
    }, [] );

    useEffect( () => {
        document.documentElement.setAttribute( 'data-theme', theme );
        localStorage.setItem( 'melio-theme', theme );
    }, [theme] );

    const toggleTheme = () => setTheme( ( t ) => ( t === 'dark' ? 'light' : 'dark' ) );

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
