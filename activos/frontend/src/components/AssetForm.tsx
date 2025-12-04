import { FormEvent, useState, useEffect, useMemo } from 'react';
import { assetService, devService, AssetSummary, AssetType, Location, UserCatalog } from '@services/api';



type Props = {
  onCreated: () => void;
  assetToEdit?: AssetSummary | null;
  onUpdated?: () => void;
  onCancel?: () => void;
};

import { useTheme } from '@contexts/ThemeContext';

// Definición de atributos específicos por tipo de activo
const ASSET_SPECS_CONFIG: Record<string, { label: string; key: string; type: 'text' | 'number' | 'select'; options?: string[] }[]> = {
  'Computadora': [
    { label: 'Procesador', key: 'processor', type: 'text' },
    { label: 'RAM', key: 'ram', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { label: 'Almacenamiento', key: 'storage', type: 'text' },
    { label: 'Hostname', key: 'hostname', type: 'text' },
    { label: 'Dirección MAC', key: 'macAddress', type: 'text' },
  ],
  'Laptop': [
    { label: 'Procesador', key: 'processor', type: 'text' },
    { label: 'RAM', key: 'ram', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { label: 'Almacenamiento', key: 'storage', type: 'text' },
    { label: 'Hostname', key: 'hostname', type: 'text' },
    { label: 'Dirección MAC', key: 'macAddress', type: 'text' },
    { label: 'Cargador', key: 'chargerIncluded', type: 'select', options: ['Sí', 'No'] },
    { label: 'Serie Cargador', key: 'chargerSerialNumber', type: 'text' },
  ],
  'Celular': [
    { label: 'IMEI', key: 'imei', type: 'text' },
    { label: 'Número SIM', key: 'simNumber', type: 'text' },
    { label: 'Operador', key: 'carrier', type: 'select', options: ['Telcel', 'Movistar', 'AT&T', 'Otro'] },
    { label: 'Cargador', key: 'chargerIncluded', type: 'select', options: ['Sí', 'No'] },
    { label: 'Serie Cargador', key: 'chargerSerialNumber', type: 'text' },
  ],
  'Tablet': [
    { label: 'IMEI', key: 'imei', type: 'text' },
    { label: 'Almacenamiento', key: 'storage', type: 'text' },
    { label: 'Cargador', key: 'chargerIncluded', type: 'select', options: ['Sí', 'No'] },
    { label: 'Serie Cargador', key: 'chargerSerialNumber', type: 'text' },
  ],
  'Monitor': [
    { label: 'Pulgadas', key: 'inches', type: 'number' },
    { label: 'Resolución', key: 'resolution', type: 'text' },
    { label: 'Puertos', key: 'ports', type: 'text' },
    { label: 'Cargador', key: 'chargerIncluded', type: 'select', options: ['Sí', 'No'] },
    { label: 'Serie Cargador', key: 'chargerSerialNumber', type: 'text' },
  ],
  'Impresora': [
    { label: 'Tipo', key: 'type', type: 'select', options: ['Láser', 'Inyección', 'Matriz', 'Térmica'] },
    { label: 'Dirección IP', key: 'ipAddress', type: 'text' },
    { label: 'Color', key: 'color', type: 'select', options: ['Sí', 'No'] },
  ],
  'Router': [
    { label: 'IP Gestión', key: 'managementIp', type: 'text' },
    { label: 'MAC Address', key: 'macAddress', type: 'text' },
    { label: 'Puertos', key: 'ports', type: 'number' },
    { label: 'Firmware', key: 'firmware', type: 'text' },
  ],
  'Switch': [
    { label: 'IP Gestión', key: 'managementIp', type: 'text' },
    { label: 'MAC Address', key: 'macAddress', type: 'text' },
    { label: 'Puertos', key: 'ports', type: 'number' },
    { label: 'PoE', key: 'poe', type: 'select', options: ['Sí', 'No'] },
  ],
  'Access Point': [
    { label: 'IP Gestión', key: 'managementIp', type: 'text' },
    { label: 'MAC Address', key: 'macAddress', type: 'text' },
    { label: 'SSID', key: 'ssid', type: 'text' },
    { label: 'Modelo', key: 'model', type: 'text' },
  ],
  'Firewall': [
    { label: 'IP WAN', key: 'wanIp', type: 'text' },
    { label: 'IP LAN', key: 'lanIp', type: 'text' },
    { label: 'Throughput', key: 'throughput', type: 'text' },
    { label: 'Licencia Hasta', key: 'licenseExpiration', type: 'text' },
  ],
  'Proyector': [
    { label: 'Resolución', key: 'resolution', type: 'text' },
    { label: 'Lúmenes', key: 'lumens', type: 'number' },
    { label: 'Entradas', key: 'inputs', type: 'text' },
  ],
  'Pantalla': [
    { label: 'Pulgadas', key: 'inches', type: 'number' },
    { label: 'Resolución', key: 'resolution', type: 'text' },
    { label: 'Smart TV', key: 'smartTv', type: 'select', options: ['Sí', 'No'] },
  ],
  'Videoconferencia': [
    { label: 'Plataforma', key: 'platform', type: 'select', options: ['Zoom', 'Teams', 'Cisco', 'Polycom'] },
    { label: 'IP', key: 'ipAddress', type: 'text' },
    { label: 'Codec', key: 'codec', type: 'text' },
  ],
  'Silla': [
    { label: 'Material', key: 'material', type: 'text' },
    { label: 'Color', key: 'color', type: 'text' },
    { label: 'Ergonómica', key: 'ergonomic', type: 'select', options: ['Sí', 'No'] },
  ],
  'Escritorio': [
    { label: 'Dimensiones', key: 'dimensions', type: 'text' },
    { label: 'Material', key: 'material', type: 'text' },
    { label: 'Color', key: 'color', type: 'text' },
  ],
  'Automóvil': [
    { label: 'Placa', key: 'plate', type: 'text' },
    { label: 'VIN (Serie)', key: 'vin', type: 'text' },
    { label: 'Marca', key: 'brand', type: 'text' },
    { label: 'Modelo', key: 'model', type: 'text' },
    { label: 'Año', key: 'year', type: 'number' },
    { label: 'Póliza Seguro', key: 'insurancePolicy', type: 'text' },
  ],
  'VPN': [
    { label: 'Endpoint (URL/IP)', key: 'endpoint', type: 'text' },
    { label: 'Protocolo', key: 'protocol', type: 'select', options: ['IPsec', 'SSL/TLS', 'L2TP', 'WireGuard'] },
    { label: 'Usuario VPN', key: 'vpnUser', type: 'text' },
    { label: 'Grupo Acceso', key: 'accessGroup', type: 'text' },
  ],
  'Licencia': [
    { label: 'Versión', key: 'version', type: 'text' },
    { label: 'Usuarios/Seats', key: 'seats', type: 'number' },
    { label: 'Tipo de Licencia', key: 'licenseType', type: 'select', options: ['Perpetua', 'Suscripción', 'Trial', 'OEM'] },
    { label: 'Soporte', key: 'supportContact', type: 'text' },
  ],
};

export default function AssetForm({ onCreated, assetToEdit, onUpdated, onCancel }: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    assetTypeId: '',
    responsibleId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    operatingSystem: '',
    cost: '',
    purchaseDate: '',
    warrantyUntil: '',
    notes: '',
    state: 'ACTIVO',
  });

  // Estado para atributos dinámicos
  const [specs, setSpecs] = useState<Record<string, any>>({});

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Catálogos
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserCatalog[]>([]);

  // Configuración de formulario
  const [formConfig, setFormConfig] = useState<any>(null);

  // Cargar catálogos (Configuración desactivada manualmente por solicitud)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      devService.listAssetTypes(),
      devService.listLocations(),
      devService.listUsers(),
      // getFormConfig('AssetForm'), // DESACTIVADO: Usar orden manual en código
    ])
      .then(([types, locs, usrs]) => {
        setAssetTypes(types);
        setLocations(locs);
        setUsers(usrs);
        // setFormConfig(config); 
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AssetForm] Error al cargar:', err);
        setStatus('Error al cargar catálogos');
        setLoading(false);
      });
  }, []);

  // Cargar datos del activo cuando se está editando
  useEffect(() => {
    if (assetToEdit) {
      assetService.getOne(assetToEdit.id).then((asset) => {
        setForm({
          name: asset.name || '',
          assetTypeId: asset.assetTypeId || '',
          locationId: asset.locationId || '',
          responsibleId: asset.responsibleId || '',
          serialNumber: asset.serialNumber || '',
          manufacturer: asset.manufacturer || '',
          model: asset.model || '',
          operatingSystem: asset.operatingSystem || '',
          cost: asset.cost ? String(asset.cost) : '',
          purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
          warrantyUntil: asset.warrantyUntil ? asset.warrantyUntil.split('T')[0] : '',
          notes: asset.notes || '',
          state: asset.state || 'ACTIVO',
        });
        // Cargar specs si existen
        if (asset.specs) {
          setSpecs(asset.specs as Record<string, any>);
        } else {
          setSpecs({});
        }
      }).catch(() => {
        setStatus('Error al cargar el activo');
      });
    } else {
      setForm({
        name: '',
        assetTypeId: '',
        locationId: '',
        responsibleId: '',
        serialNumber: '',
        manufacturer: '',
        model: '',
        operatingSystem: '',
        cost: '',
        purchaseDate: '',
        warrantyUntil: '',
        notes: '',
        state: 'ACTIVO',
      });
      setSpecs({});
    }
  }, [assetToEdit]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Si cambia el tipo de activo, limpiar specs irrelevantes (opcional, por ahora mantenemos simple)
  };

  const handleSpecChange = (key: string, value: any) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  // Determinar qué campos dinámicos mostrar basado en el tipo de activo seleccionado
  const currentSpecsConfig = useMemo(() => {
    if (!form.assetTypeId) return [];
    const selectedType = assetTypes.find(t => t.id === form.assetTypeId);
    if (!selectedType) return [];

    // Buscar coincidencia parcial o exacta en el nombre del tipo
    const typeName = selectedType.name;
    const configKey = Object.keys(ASSET_SPECS_CONFIG).find(k => typeName.includes(k));

    return configKey ? ASSET_SPECS_CONFIG[configKey] : [];
  }, [form.assetTypeId, assetTypes]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setStatus('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        specs: specs, // Incluir specs en el payload
      };

      // Solo agregar campos con valores válidos
      if (form.assetTypeId && form.assetTypeId.trim()) payload.assetTypeId = form.assetTypeId.trim();
      if (form.locationId && form.locationId.trim()) payload.locationId = form.locationId.trim();
      if (form.responsibleId && form.responsibleId.trim()) payload.responsibleId = form.responsibleId.trim();
      else if (assetToEdit && form.responsibleId === '') payload.responsibleId = null;

      if (form.serialNumber && form.serialNumber.trim()) payload.serialNumber = form.serialNumber.trim();
      if (form.manufacturer && form.manufacturer.trim()) payload.manufacturer = form.manufacturer.trim();
      if (form.model && form.model.trim()) payload.model = form.model.trim();
      if (form.operatingSystem && form.operatingSystem.trim()) payload.operatingSystem = form.operatingSystem.trim();
      if (form.cost && form.cost.trim()) payload.cost = Number(form.cost);
      if (form.purchaseDate && form.purchaseDate.trim()) payload.purchaseDate = form.purchaseDate.trim();
      if (form.warrantyUntil && form.warrantyUntil.trim()) payload.warrantyUntil = form.warrantyUntil.trim();
      if (form.notes && form.notes.trim()) payload.notes = form.notes.trim();
      if (form.state && form.state.trim()) payload.state = form.state.trim();

      if (assetToEdit) {
        await assetService.update(assetToEdit.id, payload);
        setStatus('✓ Activo actualizado correctamente');
        if (onUpdated) onUpdated();
      } else {
        await assetService.create(payload);
        setStatus('✓ Activo creado correctamente');
        onCreated();
      }

      if (!assetToEdit) {
        setForm(prev => ({ ...prev, name: '', serialNumber: '', cost: '', notes: '' }));
        setSpecs({});
      }
      onCreated();
    } catch (error: unknown) {
      let message = 'Error al guardar';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        message = axiosError.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  // Detectar si es licencia para cambiar etiquetas
  const isLicense = useMemo(() => {
    const type = assetTypes.find(t => t.id === form.assetTypeId);
    return type?.name === 'Licencia';
  }, [form.assetTypeId, assetTypes]);

  // Definición de campos disponibles (ORDEN MANUAL DEFINIDO AQUÍ)
  const allFields = [
    {
      name: 'assetTypeId',
      label: 'Tipo de Activo',
      render: () => (
        <div key="assetTypeId" className="form-group">
          <label>Tipo de Activo</label>
          <select
            name="assetTypeId"
            value={form.assetTypeId}
            onChange={(e) => handleChange('assetTypeId', e.target.value)}
            required
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          >
            <option value="">Seleccione un tipo</option>
            {assetTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      )
    },
    {
      name: 'manufacturer',
      label: isLicense ? 'Fabricante / Vendor' : 'Fabricante',
      render: () => (
        <div key="manufacturer" className="form-group">
          <label>{isLicense ? 'Fabricante / Vendor' : 'Fabricante'}</label>
          <input
            type="text"
            name="manufacturer"
            value={form.manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'name',
      label: 'Nombre',
      render: () => (
        <div key="name" className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'model',
      label: 'Modelo',
      render: () => (
        <div key="model" className="form-group">
          <label>Modelo</label>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={(e) => handleChange('model', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'serialNumber',
      label: isLicense ? 'Clave de Licencia / Serial' : 'Número de Serie',
      render: () => (
        <div key="serialNumber" className="form-group">
          <label>{isLicense ? 'Clave de Licencia / Serial' : 'Número de Serie'}</label>
          <input
            type="text"
            name="serialNumber"
            value={form.serialNumber}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'locationId',
      label: 'Ubicación',
      render: () => (
        <div key="locationId" className="form-group">
          <label>Ubicación</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              name="locationId"
              value={form.locationId}
              onChange={(e) => handleChange('locationId', e.target.value)}
              style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem', flex: 1 }}
            >
              <option value="">Seleccione una ubicación</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={async () => {
                const name = prompt('Nombre de la nueva ubicación:');
                if (name) {
                  try {
                    setLoading(true);
                    const newLoc = await devService.createLocation(name);
                    setLocations(prev => [...prev, newLoc]);
                    handleChange('locationId', newLoc.id);
                    setLoading(false);
                  } catch (e) {
                    console.error(e);
                    setStatus('Error al crear ubicación'); // Reemplazar alert con setStatus
                    setLoading(false);
                  }
                }
              }}
              style={{ padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
              title="Crear nueva ubicación"
            >
              +
            </button>
          </div>
        </div>
      )
    },
    {
      name: 'responsibleId',
      label: 'Responsable',
      render: () => (
        <div key="responsibleId" className="form-group">
          <label>Responsable</label>
          <select
            name="responsibleId"
            value={form.responsibleId || ''}
            onChange={(e) => handleChange('responsibleId', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          >
            <option value="">Seleccione un responsable</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      )
    },
    {
      name: 'state',
      label: 'Estado',
      render: () => (
        <div key="state" className="form-group">
          <label>Estado</label>
          <select
            name="state"
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          >
            <option value="NUEVO">Nuevo</option>
            <option value="USADO">Usado</option>
            <option value="DAÑADO">Dañado</option>
            <option value="EN_REPARACION">En Reparación</option>
            <option value="OBSOLETO">Obsoleto</option>
            <option value="PERDIDO">Perdido</option>
          </select>
        </div>
      )
    },
    {
      name: 'cost',
      label: 'Costo',
      render: () => (
        <div key="cost" className="form-group">
          <label>Costo</label>
          <input
            type="number"
            name="cost"
            value={form.cost || ''}
            onChange={(e) => handleChange('cost', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'purchaseDate',
      label: 'Fecha de Compra',
      render: () => (
        <div key="purchaseDate" className="form-group">
          <label>Fecha de Compra</label>
          <input
            type="date"
            name="purchaseDate"
            value={form.purchaseDate ? new Date(form.purchaseDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'warrantyUntil',
      label: isLicense ? 'Vence / Expiración' : 'Garantía Hasta',
      render: () => (
        <div key="warrantyUntil" className="form-group">
          <label>{isLicense ? 'Vence / Expiración' : 'Garantía Hasta'}</label>
          <input
            type="date"
            name="warrantyUntil"
            value={form.warrantyUntil ? new Date(form.warrantyUntil).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('warrantyUntil', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
    {
      name: 'operatingSystem',
      label: 'Sistema Operativo',
      render: () => (
        <div key="operatingSystem" className="form-group">
          <label>Sistema Operativo</label>
          <input
            type="text"
            name="operatingSystem"
            value={form.operatingSystem || ''}
            onChange={(e) => handleChange('operatingSystem', e.target.value)}
            style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
          />
        </div>
      )
    },
  ];



  // Aplicar orden personalizado si existe configuración
  // Calcular SOLO el orden de los nombres (strings), no los objetos completos con render functions
  const orderedFieldNames = useMemo(() => {
    // ORDEN MANUAL: Modificar el orden en el array 'allFields' arriba para cambiarlo.
    // Aquí forzamos a usar siempre ese orden, ignorando cualquier config remota.
    console.log('[AssetForm] Usando orden manual definido en código (allFields)');
    return allFields.map(f => f.name);
  }, [allFields]);

  // Combinar el orden calculado con los campos frescos (con estado actualizado)
  const orderedFieldsForRender = orderedFieldNames
    .map(name => allFields.find(f => f.name === name))
    .filter(f => f !== undefined) as typeof allFields;

  // Estado para modal de reordenamiento


  return (
    <div className="card">
      <form onSubmit={submit}>


        {status && (
          <div className={`alert ${status.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem' }}>
            {status}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
          {orderedFieldsForRender.map(field => field.render())}

          {/* Renderizado de campos dinámicos (Specs) */}
          {currentSpecsConfig.length > 0 && (
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
              <h4>Especificaciones Técnicas</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {currentSpecsConfig.map(spec => (
                  <div key={spec.key} className="form-group">
                    <label>{spec.label}</label>
                    {spec.type === 'select' ? (
                      <select
                        value={specs?.[spec.key] || ''}
                        onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                        style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
                      >
                        <option value="">Seleccione...</option>
                        {spec.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={spec.type}
                        value={specs?.[spec.key] || ''}
                        onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                        style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : (assetToEdit ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>


    </div>
  );
}
