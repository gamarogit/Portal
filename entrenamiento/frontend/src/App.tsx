import React from 'react';

function App() {
    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: 'sans-serif',
            backgroundColor: '#f0f2f5',
            color: '#333'
        }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={`${window.location.protocol}//${window.location.hostname}:5174`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#0f3d56',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>🏠</span>
                    Portal Empresarial
                </a>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 100px)'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓 Entrenamiento</h1>
                <p style={{ fontSize: '1.5rem' }}>Este módulo está en construcción.</p>
                <p>Pronto podrás gestionar tus capacitaciones aquí.</p>
            </div>
        </div>
    );
}

export default App;
