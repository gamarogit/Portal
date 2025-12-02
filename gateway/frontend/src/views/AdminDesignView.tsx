import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ThemeConfig {
    id: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    logoUrl: string | null;
}

interface Props {
    embedded?: boolean;
}

export default function AdminDesignView({ embedded = false }: Props) {
    const [theme, setTheme] = useState<ThemeConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        primaryColor: '#003b4d',
        secondaryColor: '#00afaa',
        accentColor: '#d9c79e',
        backgroundColor: '#f0f2f5',
    });

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const response = await api.get('/portal/theme');
            setTheme(response.data);
            setFormData({
                primaryColor: response.data.primaryColor,
                secondaryColor: response.data.secondaryColor,
                accentColor: response.data.accentColor,
                backgroundColor: response.data.backgroundColor,
            });
        } catch (error) {
            console.error('Error al cargar tema:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/portal/theme', formData);
            alert('Diseño actualizado correctamente');
            // Recargar para aplicar cambios (en una app real usaríamos Context)
            window.location.reload();
        } catch (error) {
            console.error('Error al guardar tema:', error);
            alert('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6">Cargando configuración...</div>;
    }

    return (
        <div className={embedded ? '' : "min-h-screen bg-gray-50 p-6"}>
            <div className={embedded ? '' : "max-w-4xl mx-auto"}>
                {!embedded && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Diseño de Imagen</h1>
                        <p className="text-sm text-gray-500 mt-1">Personaliza los colores y la apariencia del portal</p>
                    </div>
                )}

                <div className={`${!embedded ? 'bg-white rounded-lg shadow-sm p-6' : ''}`}>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Sección de Colores */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Paleta de Colores</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Color Primario */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color Primario (PANTONE 548 C)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Usado en encabezados, botones principales y navegación lateral.</p>
                                </div>

                                {/* Color Secundario */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color Secundario (PANTONE 326 C)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Usado en elementos destacados, iconos y estados de éxito.</p>
                                </div>

                                {/* Color de Acento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color de Acento (PANTONE 7501 C)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.accentColor}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.accentColor}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Usado en fondos secundarios, bordes y detalles sutiles.</p>
                                </div>

                                {/* Color de Fondo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color de Fondo
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Color de fondo general de la aplicación.</p>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Previsualización</h3>
                            <div
                                className="p-6 rounded-lg border border-gray-200"
                                style={{ backgroundColor: formData.backgroundColor }}
                            >
                                <div className="flex gap-4 mb-4">
                                    <div
                                        className="w-1/4 h-32 rounded-lg shadow-sm flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: formData.primaryColor }}
                                    >
                                        Primario
                                    </div>
                                    <div className="w-3/4 space-y-4">
                                        <div className="h-8 w-1/3 rounded" style={{ backgroundColor: formData.secondaryColor }}></div>
                                        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                        <button
                                            className="px-4 py-2 rounded text-white font-medium shadow-sm"
                                            style={{ backgroundColor: formData.primaryColor }}
                                        >
                                            Botón Principal
                                        </button>
                                        <button
                                            className="ml-3 px-4 py-2 rounded border font-medium shadow-sm"
                                            style={{
                                                borderColor: formData.accentColor,
                                                color: '#374151',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            Botón Secundario
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
