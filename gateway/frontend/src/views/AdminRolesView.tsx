import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Role {
    id: string;
    name: string;
    description: string | null;
    _count?: {
        users: number;
    };
}

interface RoleFormData {
    name: string;
    description: string;
}

interface Props {
    embedded?: boolean;
}

export default function AdminRolesView({ embedded = false }: Props) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        description: '',
    });
    const [modalStatus, setModalStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [listStatus, setListStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const response = await api.get('/auth/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error al cargar roles:', error);
            setListStatus({ type: 'error', text: 'Error al cargar roles' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
        });
        setModalStatus(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalStatus(null);
        try {
            if (editingRole) {
                // Editar rol
                await api.put(`/auth/roles/${editingRole.id}`, formData);
                setModalStatus({ type: 'success', text: 'Rol actualizado correctamente' });
            } else {
                // Crear rol
                await api.post('/auth/roles', formData);
                setModalStatus({ type: 'success', text: 'Rol creado correctamente' });
                setFormData({ name: '', description: '' }); // Limpiar formulario para permitir crear otro
            }
            loadRoles();
            // No cerramos el modal automáticamente para que el usuario vea el mensaje
        } catch (error: any) {
            console.error('Error al guardar rol:', error);
            setModalStatus({
                type: 'error',
                text: error.response?.data?.message || 'Error al guardar rol'
            });
        }
    };

    const handleDelete = async (role: Role) => {
        if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
            return;
        }
        setListStatus(null);
        try {
            await api.delete(`/auth/roles/${role.id}`);
            setListStatus({ type: 'success', text: 'Rol eliminado correctamente' });
            loadRoles();
        } catch (error: any) {
            console.error('Error al eliminar rol:', error);
            setListStatus({
                type: 'error',
                text: error.response?.data?.message || 'Error al eliminar rol'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className={embedded ? '' : "min-h-screen bg-background p-6"}>
            <div className={embedded ? '' : "max-w-7xl mx-auto"}>
                {!embedded && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-secondary">Gestión de Roles</h1>
                                <p className="text-sm text-gray-500 mt-1">Define los perfiles de acceso para los usuarios</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                                >
                                    ← Volver
                                </button>
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="bg-primary text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition font-medium shadow-sm"
                                >
                                    + Nuevo Rol
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {embedded && (
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-secondary">Lista de Roles</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-medium shadow-sm text-sm"
                        >
                            + Nuevo Rol
                        </button>
                    </div>
                )}

                {listStatus && (
                    <div className={`mb-4 p-4 rounded-md ${listStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {listStatus.text}
                    </div>
                )}

                <div className={`${!embedded ? 'bg-white rounded-lg shadow-sm' : ''} overflow-hidden`}>
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Nombre del Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                                {role.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{role.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => handleOpenModal(role)}
                                            className="text-primary hover:text-secondary font-medium mr-3"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(role)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-secondary">
                                    {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                            {modalStatus && (
                                <div className={`p-3 rounded-md text-sm ${modalStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {modalStatus.text}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Rol
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: ENTRENADOR"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descripción de los permisos..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 pb-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium text-gray-700"
                                >
                                    {modalStatus?.type === 'success' ? 'Cerrar' : 'Cancelar'}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition font-medium"
                                >
                                    {editingRole ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
