// Updated: 2025-12-01 - Dynamic menu from configuration
import { useState, useEffect, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

type Props = {
  children: ReactNode;
};

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  visible: boolean;
  order: number;
}

// Menú por defecto en caso de que no exista configuración
const defaultMenuItems: MenuItem[] = [
  { path: '/portal', label: 'Portal Sistemas', icon: '🏠', visible: true, order: 0 },
  { path: '/portal/admin', label: 'Admin Portal', icon: '⚙️', visible: true, order: 1 },
  { path: '/dashboard', label: 'Dashboard', icon: '📊', visible: true, order: 2 },
  { path: '/users', label: 'Usuarios', icon: '👥', visible: true, order: 3 },
  { path: '/roles', label: 'Roles', icon: '📋', visible: true, order: 4 },
  { path: '/assets', label: 'Activos', icon: '📦', visible: true, order: 5 },
  { path: '/movements', label: 'Movimientos', icon: '🔄', visible: true, order: 6 },
  { path: '/maintenance', label: 'Mantenimientos', icon: '🔧', visible: true, order: 7 },
  { path: '/licenses', label: 'Licencias', icon: '💿', visible: true, order: 8 },
  { path: '/vendors', label: 'Proveedores', icon: '🏢', visible: true, order: 9 },
  { path: '/notifications', label: 'Notificaciones', icon: '🔔', visible: true, order: 10 },
  { path: '/reports', label: 'Reportes', icon: '📈', visible: true, order: 11 },
  { path: '/report-builder', label: 'Reporteador', icon: '📝', visible: true, order: 12 },
  { path: '/configuration', label: 'Configuración', icon: '⚙️', visible: true, order: 13 },
  { path: '/integrations', label: 'Integraciones', icon: '🔗', visible: true, order: 14 },
];

export default function MainLayout({ children }: Props) {
  const { token, updateToken } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [menuTitle, setMenuTitle] = useState('Activos TI 2025');
  const [configVersion, setConfigVersion] = useState(0);

  useEffect(() => {
    // Intentar cargar configuración del menú
    const loadMenuConfig = async () => {
      try {
        // Forzar recarga del módulo con timestamp
        const timestamp = new Date().getTime();
        const config = await import(`../.config/index?v=${timestamp}`);
        const mainLayoutConfig = config.formConfigs?.MainLayout;
        
        if (mainLayoutConfig?.menuItems) {
          // Ordenar por el campo order y filtrar visibles
          const orderedItems = [...mainLayoutConfig.menuItems]
            .sort((a, b) => a.order - b.order);
          setMenuItems(orderedItems);
        }
        
        // Cargar título si existe
        if (mainLayoutConfig?.title) {
          setMenuTitle(mainLayoutConfig.title);
        }
      } catch (error) {
        // Si no existe configuración, usar menú por defecto
        console.log('Usando menú por defecto');
      }
    };

    loadMenuConfig();
    
    // Escuchar evento de actualización de configuración
    const handleConfigUpdate = () => {
      setConfigVersion(v => v + 1);
      loadMenuConfig();
    };
    
    window.addEventListener('configurationUpdated', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('configurationUpdated', handleConfigUpdate);
    };
  }, [configVersion]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    updateToken('');
    window.location.reload();
  };

  return (
    <div className="app-shell">
      <aside>
        <h1 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: '600' }}>{menuTitle}</h1>
        <nav>
          {menuItems
            .filter(item => item.visible && !item.parentPath)
            .map((item) => {
              const children = menuItems.filter(child => child.parentPath === item.path && child.visible);
              return (
                <div key={item.path}>
                  <NavLink to={item.path}>
                    {item.icon} {item.label}
                  </NavLink>
                  {children.length > 0 && (
                    <div style={{ paddingLeft: '20px', borderLeft: '2px solid #ddd', marginLeft: '10px' }}>
                      {children.map((child) => (
                        <NavLink key={child.path} to={child.path} style={{ fontSize: '0.9em', padding: '8px 15px' }}>
                          {child.icon} {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '8px 0 0 0', borderTop: '1px solid #333' }}>
          <button onClick={handleLogout} style={{ width: '100%', background: '#dc3545', color: 'white', padding: '8px', fontSize: '0.9rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{ 
          background: 'white', 
          borderBottom: '1px solid #e2e8f0', 
          padding: '12px 24px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          minHeight: '60px'
        }}>
          <button 
            onClick={() => {
              const token = localStorage.getItem('token');
                  const portalUrlString = import.meta.env.VITE_PORTAL_URL || `http://${window.location.hostname}:3101`;
                  console.log('[Activos] Returning to portal with token:', token ? 'YES' : 'NO');
                  const portalUrl = new URL(portalUrlString);              if (token) {
                portalUrl.searchParams.set('token', token);
                console.log('[Activos] Portal URL:', portalUrl.toString().substring(0, 100) + '...');
              }
              window.location.href = portalUrl.toString();
            }}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              padding: '8px 16px', 
              fontSize: '0.9rem', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.2)';
            }}
          >
            🏠 Portal Empresarial
          </button>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>{children}</main>
      </div>
    </div>
  );
}
