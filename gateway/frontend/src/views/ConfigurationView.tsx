import { useState } from 'react';
import AdminUsersView from './AdminUsersView';
import AdminRolesView from './AdminRolesView';
import AdminDesignView from './AdminDesignView';

type Tab = 'users' | 'roles' | 'design';

export default function ConfigurationView() {
    const [activeTab, setActiveTab] = useState<Tab>('users');

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Unificado */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">Configuración</h1>
                            <p className="text-sm text-gray-500 mt-1">Gestión general del sistema</p>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                        >
                            ← Volver al Portal
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'users'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            👥 Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'roles'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🛡️ Roles
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'design'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🎨 Diseño
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {activeTab === 'users' && <AdminUsersView embedded={true} />}
                    {activeTab === 'roles' && <AdminRolesView embedded={true} />}
                    {activeTab === 'design' && <AdminDesignView embedded={true} />}
                </div>
            </div>
        </div>
    );
}
