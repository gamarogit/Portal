import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
}

interface ThemeContextType {
    theme: ThemeConfig | null;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeConfig | null>(null);

    const loadFont = (fontFamily: string) => {
        const linkId = 'dynamic-font-link';
        let link = document.getElementById(linkId) as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        // Map font names to Google Fonts URLs
        const fontMap: Record<string, string> = {
            'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap',
            'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
            'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
            'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
            'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        };

        const fontUrl = fontMap[fontFamily];
        if (fontUrl) {
            link.href = fontUrl;
        }
    };

    const applyTheme = (config: ThemeConfig) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', config.primaryColor);
        root.style.setProperty('--color-secondary', config.secondaryColor);
        root.style.setProperty('--color-accent', config.accentColor);
        root.style.setProperty('--color-background', config.backgroundColor);

        if (config.fontFamily) {
            root.style.setProperty('--font-family', `"${config.fontFamily}", sans-serif`);
            loadFont(config.fontFamily);
            document.body.style.fontFamily = `"${config.fontFamily}", sans-serif`;
        }
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
