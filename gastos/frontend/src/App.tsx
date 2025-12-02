
import { useEffect, useState } from 'react';

function App() {
    const [theme, setTheme] = useState({
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        backgroundColor: '#ffffff'
    });

    useEffect(() => {
        fetch('/api/portal/theme')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setTheme(data);
                }
            })
            .catch(err => console.error('Error loading theme:', err));
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: theme.backgroundColor, minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: theme.primaryColor }}>💰 Módulo de Gastos</h1>
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
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    🏠 Portal Empresarial
                </button>
            </div>
            <p>Bienvenido al sistema de gestión de gastos.</p>
        </div>
    );
}

export default App;
