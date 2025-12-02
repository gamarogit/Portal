
import { useEffect, useState } from 'react';

function App() {
    const [theme, setTheme] = useState({
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        backgroundColor: '#ffffff',
        fontFamily: 'Montserrat'
    });

    const loadFont = (fontFamily: string) => {
        const linkId = 'dynamic-font-link';
        let link = document.getElementById(linkId) as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

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

    useEffect(() => {
        fetch('/api/portal/theme')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setTheme(data);
                    if (data.fontFamily) {
                        loadFont(data.fontFamily);
                    }
                }
            })
            .catch(err => console.error('Error loading theme:', err));
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: theme.fontFamily ? `"${theme.fontFamily}", sans-serif` : 'sans-serif', backgroundColor: theme.backgroundColor, minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: theme.primaryColor }}>🎓 Módulo de Entrenamiento</h1>
                <button
                    onClick={() => window.location.href = `http://${window.location.hostname}:5174`}
                    style={{
                        backgroundColor: theme.primaryColor,
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        fontFamily: 'inherit'
                    }}
                >
                    🏠 Portal Empresarial
                </button>
            </div>
            <p>Bienvenido al sistema de gestión de entrenamiento.</p>
        </div>
    );
}

export default App;
