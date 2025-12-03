import { useState, useEffect } from 'react';
import { MovementPayload, movementService, Movement } from '@services/api';
import api from '@services/api';

interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  assetType: { name: string };
  state: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
}

const emptyMovement: MovementPayload = {
  assetId: '',
  movementType: 'ALTA',
};

export default function MovementView() {
  const [data, setData] = useState<MovementPayload>(emptyMovement);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredFromLocations, setFilteredFromLocations] = useState<Location[]>([]);
  const [filteredToLocations, setFilteredToLocations] = useState<Location[]>([]);
  const [fromSearchTerm, setFromSearchTerm] = useState('');
  const [toSearchTerm, setToSearchTerm] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isCreatingFromLocation, setIsCreatingFromLocation] = useState(false);
  const [isCreatingToLocation, setIsCreatingToLocation] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [responsibleSearchTerm, setResponsibleSearchTerm] = useState('');
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  const [responsibleName, setResponsibleName] = useState('');

  const [movements, setMovements] = useState<Movement[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Movement>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const loadMovements = async () => {
    try {
      const movementsData = await movementService.list();
      setMovements(movementsData);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
    }
  };

  const handleSort = (column: keyof Movement) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedMovements = [...movements].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? aValue > bValue ? 1 : -1
      : bValue > aValue ? 1 : -1;
  });

  const generatePDF = (movement: Movement) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Movimiento ${movement.folio}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { text-align: center; color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin: 20px 0; }
          .detail { margin: 10px 0; padding: 10px; background: #f5f7fb; border-left: 4px solid #2563eb; }
          .label { font-weight: bold; color: #666; }
          .signatures { margin-top: 80px; display: flex; justify-content: space-around; }
          .signature-box { text-align: center; }
          .signature-line { border-top: 2px solid #000; margin-top: 60px; padding-top: 5px; width: 250px; }
          .status { padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .status-PENDIENTE { background: #e7f3ff; }
          .status-EN_CURSO { background: #fff3cd; }
          .status-REALIZADO { background: #d4edda; }
          .status-CANCELADO { background: #f8d7da; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>COMPROBANTE DE MOVIMIENTO</h1>
        <div class="header">
          <div><strong>Folio:</strong> ${movement.folio}</div>
          <div><strong>Fecha:</strong> ${new Date(movement.createdAt).toLocaleString('es-MX')}</div>
        </div>
        
        <div class="detail">
          <div class="label">Tipo de Movimiento:</div>
          <div>${movement.movementType}</div>
        </div>
        
        <div class="detail">
          <div class="label">Activo:</div>
          <div>${movement.asset?.name || 'N/A'} ${movement.asset?.serialNumber ? `(S/N: ${movement.asset.serialNumber})` : ''}</div>
        </div>
        
        <div class="detail">
          <div class="label">Desde (Ubicación):</div>
          <div>${movement.fromLocation?.name || 'N/A'}</div>
        </div>
        
        <div class="detail">
          <div class="label">Hasta (Ubicación):</div>
          <div>${movement.toLocation?.name || 'N/A'}</div>
        </div>
        
        <div class="detail">
          <div class="label">Estatus:</div>
          <div><span class="status status-${movement.status}">${movement.status}</span></div>
        </div>
        
        ${movement.notes ? `
        <div class="detail">
          <div class="label">Notas:</div>
          <div>${movement.notes}</div>
        </div>
        ` : ''}
        
        <div class="signatures">
          <div class="signature-box">
            <div class="signature-line">Recibido por</div>
            <div style="margin-top: 10px; font-size: 0.9em;">Fecha y Hora: _________________</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Autorizado por</div>
            <div style="margin-top: 10px; font-size: 0.9em;">Fecha y Hora: _________________</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Imprimir / Guardar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  useEffect(() => {
    // Cargar todos los activos
    api.get('/assets').then(res => {
      const assetsData = res.data.data || res.data || [];
      setAssets(assetsData);
      setFilteredAssets(assetsData);
    }).catch(err => {
      console.error('Error cargando activos:', err);
    });

    // Cargar todas las ubicaciones
    api.get('/dev/locations').then(res => {
      const locationsData = res.data || [];
      setLocations(locationsData);
      setFilteredFromLocations(locationsData);
      setFilteredToLocations(locationsData);
    }).catch(err => {
      console.error('Error cargando ubicaciones:', err);
    });

    // Cargar todos los usuarios
    api.get('/dev/users').then(res => {
      const usersData = res.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    }).catch(err => {
      console.error('Error cargando usuarios:', err);
    });

    loadMovements();
  }, []);

  useEffect(() => {
    // Filtrar activos según el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredAssets(assets);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = assets.filter(asset =>
        asset.name.toLowerCase().includes(term) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(term))
      );
      setFilteredAssets(filtered);
    }
  }, [searchTerm, assets]);

  useEffect(() => {
    // Filtrar ubicaciones "Desde"
    if (fromSearchTerm.trim() === '') {
      setFilteredFromLocations(locations);
    } else {
      const term = fromSearchTerm.toLowerCase();
      const filtered = locations.filter(loc =>
        loc.name.toLowerCase().includes(term)
      );
      setFilteredFromLocations(filtered);
    }
  }, [fromSearchTerm, locations]);

  useEffect(() => {
    // Filtrar ubicaciones "Hasta"
    if (toSearchTerm.trim() === '') {
      setFilteredToLocations(locations);
    } else {
      const term = toSearchTerm.toLowerCase();
      const filtered = locations.filter(loc =>
        loc.name.toLowerCase().includes(term)
      );
      setFilteredToLocations(filtered);
    }
  }, [toSearchTerm, locations]);

  useEffect(() => {
    // Filtrar usuarios
    if (responsibleSearchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = responsibleSearchTerm.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [responsibleSearchTerm, users]);

  const handleSelectAsset = (asset: Asset) => {
    setData({ ...data, assetId: asset.id });
    setSearchTerm(`${asset.name} (${asset.serialNumber || 'Sin serie'})`);
    setShowDropdown(false);
  };

  const handleSelectFromLocation = (location: Location) => {
    setData({ ...data, fromLocationId: location.id });
    setFromSearchTerm(location.name);
    setShowFromDropdown(false);
    setIsCreatingFromLocation(false);
  };

  const handleSelectToLocation = (location: Location) => {
    setData({ ...data, toLocationId: location.id });
    setToSearchTerm(location.name);
    setShowToDropdown(false);
    setIsCreatingToLocation(false);
  };

  const handleSelectResponsible = (user: User) => {
    setResponsibleName(user.name);
    setResponsibleSearchTerm(user.name);
    setShowResponsibleDropdown(false);
  };

  const handleCreateFromLocation = async () => {
    if (!fromSearchTerm.trim()) return;
    try {
      const res = await api.post('/dev/location', { name: fromSearchTerm.trim() });
      const newLocation = res.data;
      setLocations([...locations, newLocation]);
      handleSelectFromLocation(newLocation);
      setStatus('✓ Ubicación creada correctamente');
    } catch (error) {
      setStatus('⚠️ Error al crear ubicación');
    }
  };

  const handleCreateToLocation = async () => {
    if (!toSearchTerm.trim()) return;
    try {
      const res = await api.post('/dev/location', { name: toSearchTerm.trim() });
      const newLocation = res.data;
      setLocations([...locations, newLocation]);
      handleSelectToLocation(newLocation);
      setStatus('✓ Ubicación creada correctamente');
    } catch (error) {
      setStatus('⚠️ Error al crear ubicación');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (data.movementType === 'ALTA' || data.movementType === 'BAJA') {
      const confirmed = window.confirm(
        `⚠️ ADVERTENCIA DE INVENTARIO\n\n` +
        `Estás a punto de registrar una ${data.movementType}.\n` +
        `Esta acción afectará directamente el inventario del activo.\n\n` +
        `¿Deseas continuar con el movimiento?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await movementService.create(data);
      setStatus('✓ Movimiento registrado correctamente');
      setData(emptyMovement);
      setSearchTerm('');
      setFromSearchTerm('');
      setToSearchTerm('');
      setResponsibleSearchTerm('');
      setResponsibleName('');
      await loadMovements();
    } catch (error) {
      setStatus('⚠️ Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <header>
        <h2>Movimientos</h2>
        <p>Registra traslados, altas o bajas y sincroniza con auditoría.</p>
      </header>
      <form onSubmit={submit} className="card" style={{ padding: '1rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <label>
              Activo *
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar por nombre o número de serie..."
                required
              />
            </label>
            {showDropdown && filteredAssets.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                marginTop: '0.25rem'
              }}>
                {filteredAssets.slice(0, 10).map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 600 }}>{asset.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Serie: {asset.serialNumber || 'N/A'} | Tipo: {asset.assetType.name} | Estado: {asset.state}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label>
            Tipo
            <select
              value={data.movementType}
              onChange={(e) => setData({ ...data, movementType: e.target.value as MovementPayload['movementType'] })}
            >
              <option value="ALTA">Alta</option>
              <option value="BAJA">Baja</option>
              <option value="TRASLADO">Traslado</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <label>
              Desde (ubicación)
              <input
                value={fromSearchTerm}
                onChange={(e) => {
                  setFromSearchTerm(e.target.value);
                  setShowFromDropdown(true);
                  setIsCreatingFromLocation(false);
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Buscar o crear ubicación..."
              />
            </label>
            {showFromDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                marginTop: '0.25rem'
              }}>
                {filteredFromLocations.length > 0 ? (
                  filteredFromLocations.slice(0, 10).map(location => (
                    <div
                      key={location.id}
                      onClick={() => handleSelectFromLocation(location)}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ fontWeight: 600 }}>{location.name}</div>
                      {location.description && (
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{location.description}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => {
                      setIsCreatingFromLocation(true);
                      handleCreateFromLocation();
                    }}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#0066cc',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    ➕ Crear nueva ubicación: "{fromSearchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <label>
              Hasta (ubicación)
              <input
                value={toSearchTerm}
                onChange={(e) => {
                  setToSearchTerm(e.target.value);
                  setShowToDropdown(true);
                  setIsCreatingToLocation(false);
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Buscar o crear ubicación..."
              />
            </label>
            {showToDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                marginTop: '0.25rem'
              }}>
                {filteredToLocations.length > 0 ? (
                  filteredToLocations.slice(0, 10).map(location => (
                    <div
                      key={location.id}
                      onClick={() => handleSelectToLocation(location)}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ fontWeight: 600 }}>{location.name}</div>
                      {location.description && (
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{location.description}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => {
                      setIsCreatingToLocation(true);
                      handleCreateToLocation();
                    }}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#0066cc',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    ➕ Crear nueva ubicación: "{toSearchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <label>
              Responsable
              <input
                value={responsibleSearchTerm}
                onChange={(e) => {
                  setResponsibleSearchTerm(e.target.value);
                  setResponsibleName(e.target.value);
                  setShowResponsibleDropdown(true);
                }}
                onFocus={() => setShowResponsibleDropdown(true)}
                placeholder="Buscar usuario o escribir nombre..."
              />
            </label>
            {showResponsibleDropdown && filteredUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                marginTop: '0.25rem'
              }}>
                {filteredUsers.slice(0, 10).map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectResponsible(user)}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    {user.email && (
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <label style={{ gridColumn: '1 / -1' }}>
          Notas
          <textarea value={data.notes ?? ''} onChange={(e) => setData({ ...data, notes: e.target.value || undefined })} rows={2} />
        </label>
        <button type="submit" disabled={loading || !data.assetId} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          {loading ? 'Registrando...' : 'Registrar movimiento'}
        </button>
        {status && <p className="status">{status}</p>}
      </form>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Movimientos Registrados</h3>
        {movements.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No hay movimientos registrados</p>
        ) : (
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => handleSort('folio')}>
                  Folio {sortColumn === 'folio' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => handleSort('assetId')}>
                  Activo {sortColumn === 'assetId' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => handleSort('movementType')}>
                  Tipo {sortColumn === 'movementType' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '0.5rem' }}>Desde</th>
                <th style={{ padding: '0.5rem' }}>Hasta</th>
                <th style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => handleSort('status')}>
                  Estatus {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                  Fecha {sortColumn === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '0.5rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.map((movement) => (
                <tr key={movement.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600, color: '#2563eb' }}>{movement.folio}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {movement.asset?.name || movement.assetId}
                    {movement.asset?.serialNumber && <div style={{ fontSize: '0.75rem', color: '#666' }}>S/N: {movement.asset.serialNumber}</div>}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{movement.movementType}</td>
                  <td style={{ padding: '0.5rem' }}>{movement.fromLocation?.name || '-'}</td>
                  <td style={{ padding: '0.5rem' }}>{movement.toLocation?.name || '-'}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <select
                      value={movement.status}
                      onChange={(e) => {
                        movementService.updateStatus(movement.id, e.target.value as Movement['status'])
                          .then(() => loadMovements())
                          .catch(err => console.error('Error actualizando estatus:', err));
                      }}
                      style={{
                        padding: '0.25rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        background: movement.status === 'REALIZADO' ? '#d4edda' :
                          movement.status === 'EN_CURSO' ? '#fff3cd' :
                            movement.status === 'CANCELADO' ? '#f8d7da' : '#e7f3ff'
                      }}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_CURSO">En Curso</option>
                      <option value="REALIZADO">Realizado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                    {new Date(movement.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => generatePDF(movement)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Imprimir
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este movimiento?')) {
                            // TODO: Implementar eliminación
                          }
                        }}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
