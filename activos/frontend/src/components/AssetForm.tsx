import { FormEvent, useState, useEffect, useMemo } from 'react';
import { assetService, devService, AssetSummary, AssetType, Location, UserCatalog } from '@services/api';
import { getFormConfig } from '@services/formConfig';

type Props = {
  onCreated: () => void;
  assetToEdit?: AssetSummary | null;
  onUpdated?: () => void;
  onCancel?: () => void;
};

import { useTheme } from '@contexts/ThemeContext';

export default function AssetForm({ onCreated, assetToEdit, onUpdated, onCancel }: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDevHelpers, setShowDevHelpers] = useState(false);

  // Catálogos
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserCatalog[]>([]);

  // Configuración de formulario
  const [formConfig, setFormConfig] = useState<any>(null);
  const [formTitle, setFormTitle] = useState('Formulario de Activo');

  useEffect(() => {
    if (formConfig) {
      // Cargar título si existe
      if (formConfig.title) {
        setFormTitle(formConfig.title);
      }
    }
  }, [formConfig]);

  // Cargar catálogos y configuración al montar
  useEffect(() => {
    Promise.all([
      devService.listAssetTypes(),
      devService.listLocations(),
      devService.listUsers(),
      getFormConfig('AssetForm'),
    ])
      .then(([types, locs, usrs, config]) => {
        setAssetTypes(types);
        setLocations(locs);
        setUsers(usrs);
        if (config) {
          console.log('[AssetForm] Configuración cargada:', config);
          setFormConfig(config);
        } else {
          console.log('[AssetForm] No hay configuración personalizada');
        }
      })
      .catch((err) => {
        console.error('[AssetForm] Error al cargar:', err);
        setStatus('Error al cargar catálogos');
      });
  }, []);

  // Cargar datos del activo cuando se está editando
  useEffect(() => {
    if (assetToEdit) {
      // Cargar datos completos al editar
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
    }
  }, [assetToEdit]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [helper, setHelper] = useState({ assetType: '', location: '', user: '' });
  const [helperStatus, setHelperStatus] = useState<string | null>(null);
  const enableDevHelpers =
    import.meta.env.VITE_ENABLE_DEV_HELPERS === '1' || import.meta.env.DEV === true;
  const [showExamples, setShowExamples] = useState(false);

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
      };

      // Solo agregar campos con valores válidos
      if (form.assetTypeId && form.assetTypeId.trim()) {
        payload.assetTypeId = form.assetTypeId.trim();
      }
      if (form.locationId && form.locationId.trim()) {
        payload.locationId = form.locationId.trim();
      }
      if (form.responsibleId && form.responsibleId.trim()) {
        payload.responsibleId = form.responsibleId.trim();
      } else if (assetToEdit && form.responsibleId === '') {
        payload.responsibleId = null;
      }
      if (form.serialNumber && form.serialNumber.trim()) {
        payload.serialNumber = form.serialNumber.trim();
      }
      if (form.manufacturer && form.manufacturer.trim()) {
        payload.manufacturer = form.manufacturer.trim();
      }
      if (form.model && form.model.trim()) {
        payload.model = form.model.trim();
      }
      if (form.operatingSystem && form.operatingSystem.trim()) {
        payload.operatingSystem = form.operatingSystem.trim();
      }
      if (form.cost && form.cost.trim()) {
        payload.cost = Number(form.cost);
      }
      if (form.purchaseDate && form.purchaseDate.trim()) {
        payload.purchaseDate = form.purchaseDate.trim();
      }
      if (form.warrantyUntil && form.warrantyUntil.trim()) {
        payload.warrantyUntil = form.warrantyUntil.trim();
      }
      if (form.notes && form.notes.trim()) {
        payload.notes = form.notes.trim();
      }
      if (form.state && form.state.trim()) {
        payload.state = form.state.trim();
      }

      if (assetToEdit) {
        // Actualizar activo existente
        await assetService.update(assetToEdit.id, payload);
        setStatus('✓ Activo actualizado correctamente');
        if (onUpdated) {
          onUpdated();
        }
      } else {
        // Crear nuevo activo
        await assetService.create(payload);
        setStatus('✓ Activo creado correctamente');
        onCreated();
      }

      if (!assetToEdit) {
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
      }
      onCreated();
    } catch (error: unknown) {
      let message = 'Error al crear el activo (revisa IDs/servidor)';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const createHelper = async (type: 'assetType' | 'location' | 'user') => {
    if (!helper[type].trim()) {
      setHelperStatus('Ingresa el nombre del catalogo');
      return;
    }
    try {
      const result =
        type === 'assetType'
          ? await devService.createAssetType(helper[type])
          : type === 'location'
            ? await devService.createLocation(helper[type])
            : await devService.createUser(helper[type]);
      setHelperStatus(`${type} creado: ${result.id}`);
      if (type === 'assetType') handleChange('assetTypeId', result.id);
      if (type === 'location') handleChange('locationId', result.id);
      if (type === 'user') handleChange('responsibleId', result.id);
    } catch {
      setHelperStatus('Error al crear catálogo; revisa si el backend está en marcha y los catálogos disponibles.');
    }
  };

  const fillRandomUuids = () => {
    const generator = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? () => crypto.randomUUID() : () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    setForm((prev) => ({
      ...prev,
      assetTypeId: generator(),
      locationId: generator(),
      responsibleId: generator(),
    }));
  };

  const downloadCsv = (rows: Record<string, string>[], filename: string) => {
    if (!rows.length) return;
    const header = Object.keys(rows[0]).join(',');
    const body = rows.map((row) => Object.values(row).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Definir los campos del formulario con su orden predeterminado
  const allFields = [
    {
      name: 'name', order: 0, render: () => (
        <label key="name">
          <span style={{ fontWeight: 600 }}>Nombre</span>
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Laptop HP" required style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'serialNumber', order: 1, render: () => (
        <label key="serialNumber">
          <span style={{ fontWeight: 600 }}>Serie</span>
          <input value={form.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} placeholder="SN123" style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'assetTypeId', order: 2, render: () => (
        <label key="assetTypeId">
          <span style={{ fontWeight: 600 }}>Tipo *</span>
          <select value={form.assetTypeId} onChange={(e) => handleChange('assetTypeId', e.target.value)} required style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}>
            <option value="">--</option>
            {assetTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )
    },
    {
      name: 'locationId', order: 3, render: () => (
        <label key="locationId">
          <span style={{ fontWeight: 600 }}>Ubicación</span>
          <select value={form.locationId} onChange={(e) => handleChange('locationId', e.target.value)} style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}>
            <option value="">--</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </label>
      )
    },
    {
      name: 'responsibleId', order: 4, render: () => (
        <label key="responsibleId">
          <span style={{ fontWeight: 600 }}>Responsable</span>
          <select value={form.responsibleId} onChange={(e) => handleChange('responsibleId', e.target.value)} style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}>
            <option value="">-- Sin asignar --</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
      )
    },
    {
      name: 'operatingSystem', order: 5, render: () => (
        <label key="operatingSystem">
          <span style={{ fontWeight: 600 }}>Tipo</span>
          <input value={form.operatingSystem} onChange={(e) => handleChange('operatingSystem', e.target.value)} placeholder="Windows 11" style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'manufacturer', order: 6, render: () => (
        <label key="manufacturer">
          <span style={{ fontWeight: 600 }}>Fabricante</span>
          <input value={form.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} placeholder="HP" style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'model', order: 7, render: () => (
        <label key="model">
          <span style={{ fontWeight: 600 }}>Modelo</span>
          <input value={form.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="ProBook 450" style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'cost', order: 8, render: () => (
        <label key="cost">
          <span style={{ fontWeight: 600 }}>Costo</span>
          <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => handleChange('cost', e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'purchaseDate', order: 9, render: () => (
        <label key="purchaseDate">
          <span style={{ fontWeight: 600 }}>Compra</span>
          <input type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'warrantyUntil', order: 10, render: () => (
        <label key="warrantyUntil">
          <span style={{ fontWeight: 600 }}>Garantía</span>
          <input type="date" value={form.warrantyUntil} onChange={(e) => handleChange('warrantyUntil', e.target.value)} style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
    {
      name: 'state', order: 11, render: () => assetToEdit ? (
        <label key="state">
          <span style={{ fontWeight: 600 }}>Estado</span>
          <select value={form.state} onChange={(e) => handleChange('state', e.target.value)} style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }}>
            <option value="ACTIVO">Activo</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="DADO_DE_BAJA">Baja</option>
            <option value="TRANSFERIDO">Transferido</option>
            <option value="CUARENTENA">Cuarentena</option>
          </select>
        </label>
      ) : null
    },
    {
      name: 'notes', order: 12, render: () => (
        <label key="notes" style={{ gridColumn: '1 / -1' }}>
          <span style={{ fontWeight: 600 }}>Notas</span>
          <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Observaciones..." rows={2} style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
        </label>
      )
    },
  ];

  // Aplicar orden personalizado si existe configuración
  const orderedFields = useMemo(() => {
    if (!formConfig?.fields) {
      console.log('[AssetForm] Usando orden predeterminado');
      return allFields;
    }

    console.log('[AssetForm] Aplicando orden personalizado:', formConfig.fields.map((f: any) => `${f.name}:${f.order}`));

    return [...allFields].sort((a, b) => {
      const configA = formConfig.fields.find((f: any) => f.name === a.name);
      const configB = formConfig.fields.find((f: any) => f.name === b.name);
      const orderA = configA?.order ?? 999;
      const orderB = configB?.order ?? 999;
      return orderA - orderB;
    });
  }, [formConfig, assetTypes, locations, users, form, assetToEdit]);

  return (
    <form onSubmit={submit} style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
      {status && (
        <div className={status.includes('✓') ? 'status success' : 'status error'} style={{ marginBottom: '0.5rem', padding: '0.4rem', fontSize: '0.85rem' }}>
          {status}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
        {orderedFields.map(field => field.render())}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.85rem',
            backgroundColor: theme?.primaryColor || '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Guardando...' : assetToEdit ? 'Actualizar' : 'Crear'}
        </button>
        {assetToEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              background: 'transparent',
              color: theme?.primaryColor || '#6c757d',
              border: `1px solid ${theme?.primaryColor || '#6c757d'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
