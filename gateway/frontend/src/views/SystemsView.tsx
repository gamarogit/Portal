import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { systemsService, PortalSystem } from '../services/api';
import './SystemsView.css';

const SystemsView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [systems, setSystems] = useState<PortalSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    try {
      const data = await systemsService.getAll();
      setSystems(data.filter((s: PortalSystem) => s.enabled).sort((a, b) => a.order - b.order));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los sistemas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemClick = (system: PortalSystem) => {
    const token = localStorage.getItem('token');
    const finalUrl = system.route;

    if (finalUrl.startsWith('http')) {
      try {
        const url = new URL(finalUrl);

        // Fix: Reemplazar localhost con el hostname actual para soportar acceso en red local
        if (url.hostname === 'localhost' && window.location.hostname !== 'localhost') {
          url.hostname = window.location.hostname;
        }

        if (token) {
          url.searchParams.set('token', token);
        }
        window.location.href = url.toString();
      } catch (error) {
        console.error('URL inválida desde el backend:', {
          name: system.name,
          route: system.route,
          error,
        });
      }
    } else {
      // Navegar a la ruta relativa (para rutas internas del gateway)
      navigate(finalUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando sistemas...</p>
      </div>
    );
  }

  return (
    <div className="systems-container">
      <header className="systems-header">
        <div className="header-content">
          <h1>Portal Empresarial</h1>
          <div className="user-info">
            <span className="user-name">👤 {user?.name || user?.email}</span>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/configuration')}
                className="admin-button"
                style={{ marginRight: '10px' }}
              >
                ⚙️ Configuración
              </button>
            )}
            <button onClick={logout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="systems-main">
        <div className="systems-content">
          <h2 className="systems-title">Sistemas Disponibles</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="systems-grid">
            {systems.map((system) => (
              <div
                key={system.id}
                className="system-card"
                onClick={() => handleSystemClick(system)}
                style={{ borderTopColor: system.color }}
              >
                <div className="system-icon" style={{ backgroundColor: system.color }}>
                  {system.icon}
                </div>
                <h3 className="system-name">{system.name}</h3>
                <p className="system-description">{system.description}</p>
                <div className="system-footer">
                  <span className="system-link">Abrir →</span>
                </div>
              </div>
            ))}
          </div>

          {systems.length === 0 && !error && (
            <div className="empty-state">
              <p>No hay sistemas disponibles</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SystemsView;
