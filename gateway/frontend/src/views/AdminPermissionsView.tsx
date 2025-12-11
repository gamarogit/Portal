import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { permissionsService, SystemFeature } from '../services/permissions';
import { useTheme } from '../context/ThemeContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: { name: string };
}

interface PortalSystem {
    id: string;
    name: string;
    description: string;
    icon: string;
    features: SystemFeature[];
}

export default function AdminPermissionsView() {
    const { theme } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [systems, setSystems] = useState<PortalSystem[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [systemPermissions, setSystemPermissions] = useState<Record<string, boolean>>({});
    const [featurePermissions, setFeaturePermissions] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadUsers();
        loadSystems();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            loadUserPermissions(selectedUserId);
        }
    }, [selectedUserId]);

    const loadUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadSystems = async () => {
        try {
            const data = await permissionsService.getAllFeatures();
            setSystems(data);
        } catch (error) {
            console.error('Error loading systems:', error);
        }
    };

    const loadUserPermissions = async (userId: string) => {
        setLoading(true);
        try {
            const permissions = await permissionsService.getUserPermissions(userId);

            // Mapear permisos de sistemas
            const sysPerms: Record<string, boolean> = {};
            permissions.systems.forEach(p => {
                sysPerms[p.systemId] = p.canAccess;
            });
            setSystemPermissions(sysPerms);

            // Mapear permisos de funcionalidades
            const featPerms: Record<string, boolean> = {};
            permissions.features.forEach(p => {
                featPerms[p.featureId] = p.granted;
            });
            setFeaturePermissions(featPerms);
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSystemToggle = (systemId: string) => {
        setSystemPermissions(prev => ({
            ...prev,
            [systemId]: !prev[systemId],
        }));
    };

    const handleFeatureToggle = (featureId: string) => {
        setFeaturePermissions(prev => ({
            ...prev,
            [featureId]: !prev[featureId],
        }));
    };

    const handleSave = async () => {
        if (!selectedUserId) return;

        setSaving(true);
        setMessage(null);

        try {
            // Guardar permisos de sistemas
            const sysPermsArray = Object.entries(systemPermissions).map(([systemId, canAccess]) => ({
                systemId,
                canAccess,
            }));
            await permissionsService.updateSystemPermissions(selectedUserId, sysPermsArray);

            // Guardar permisos de funcionalidades
            const featPermsArray = Object.entries(featurePermissions).map(([featureId, granted]) => ({
                featureId,
                granted,
            }));
            await permissionsService.updateFeaturePermissions(selectedUserId, featPermsArray);

            setMessage({ type: 'success', text: 'Permisos guardados correctamente' });
        } catch (error: any) {
            console.error('Error saving permissions:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar permisos' });
        } finally {
            setSaving(false);
        }
    };

    const selectedUser = users.find(u => u.id === selectedUserId);
    const isAdmin = selectedUser?.role?.name === 'ADMIN';

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">Gestión de Permisos</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Asigna acceso a micrositios y funcionalidades por usuario
                            </p>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                        >
                            ← Volver
                        </button>
                    </div>
                </div>

                {/* Selector de usuario */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Usuario
                    </label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        style={{ borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : undefined }}
                    >
                        <option value="">-- Seleccione un usuario --</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email}) - {user.role?.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mensaje de estado */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Advertencia para administradores */}
                {isAdmin && (
                    <div className="mb-6 p-4 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
                        ⚠️ Este usuario tiene rol de ADMIN y tiene acceso completo a todos los sistemas y funcionalidades.
                    </div>
                )}

                {selectedUserId && !loading && (
                    <>
                        {/* Permisos de sistemas */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-secondary mb-4">
                                Acceso a Micrositios
                            </h2>
                            <div className="space-y-3">
                                {systems.map(system => (
                                    <label
                                        key={system.id}
                                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={systemPermissions[system.id] || false}
                                            onChange={() => handleSystemToggle(system.id)}
                                            disabled={isAdmin}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            style={{ accentColor: theme?.primaryColor }}
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-2">{system.icon}</span>
                                                <div>
                                                    <div className="font-medium text-gray-900">{system.name}</div>
                                                    <div className="text-sm text-gray-500">{system.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Permisos de funcionalidades */}
                        {systems.filter(s => systemPermissions[s.id]).map(system => (
                            <div key={system.id} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold text-secondary mb-4">
                                    Funcionalidades de {system.name}
                                </h2>

                                {/* Agrupar por categoría */}
                                {Object.entries(
                                    system.features.reduce((acc, feature) => {
                                        const category = feature.category || 'General';
                                        if (!acc[category]) acc[category] = [];
                                        acc[category].push(feature);
                                        return acc;
                                    }, {} as Record<string, SystemFeature[]>)
                                ).map(([category, features]) => (
                                    <div key={category} className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-600 mb-2">{category}</h3>
                                        <div className="space-y-2">
                                            {features.map(feature => (
                                                <label
                                                    key={feature.id}
                                                    className="flex items-start p-2 rounded hover:bg-gray-50 cursor-pointer transition"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={featurePermissions[feature.id] || false}
                                                        onChange={() => handleFeatureToggle(feature.id)}
                                                        disabled={isAdmin}
                                                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                        style={{ accentColor: theme?.primaryColor }}
                                                    />
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                                                        {feature.description && (
                                                            <div className="text-xs text-gray-500">{feature.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Botones de acción */}
                        {!isAdmin && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedUserId('');
                                            setSystemPermissions({});
                                            setFeaturePermissions({});
                                            setMessage(null);
                                        }}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-white shadow-sm"
                                        style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-500">Cargando permisos...</div>
                    </div>
                )}
            </div>
        </div>
    );
}
