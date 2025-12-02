import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
}

interface ThemeContextType {
    theme: ThemeConfig | null;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeConfig | null>(null);

    const applyTheme = (config: ThemeConfig) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', config.primaryColor);
        root.style.setProperty('--color-secondary', config.secondaryColor);
        root.style.setProperty('--color-accent', config.accentColor);
        root.style.setProperty('--color-background', config.backgroundColor);
    };

    const refreshTheme = async () => {
        try {
            const response = await api.get('/portal/theme');
            const config = response.data;
            setTheme(config);
            applyTheme(config);
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    useEffect(() => {
        refreshTheme();
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, refreshTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
