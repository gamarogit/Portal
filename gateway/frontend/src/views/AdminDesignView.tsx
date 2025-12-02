import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ThemeConfig {
    id: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
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
        fontFamily: 'Montserrat',
    });

    const fontOptions = [
        'Montserrat',
        'Roboto',
        'Open Sans',
        'Lato',
        'Inter',
    ];

    useEffect(() => {
        loadTheme();
    }, []);

    // Load font for preview whenever selection changes
    useEffect(() => {
        if (formData.fontFamily) {
            const linkId = `preview-font-${formData.fontFamily.replace(/\s+/g, '-')}`;
            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';

                const fontMap: Record<string, string> = {
                    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap',
                    'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
                    'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
                    'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
                    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                };

                const fontUrl = fontMap[formData.fontFamily];
                if (fontUrl) {
                    link.href = fontUrl;
                    document.head.appendChild(link);
                }
            }
        }
    }, [formData.fontFamily]);

    const loadTheme = async () => {
        try {
            const response = await api.get('/portal/theme');
            setTheme(response.data);
            setFormData({
                primaryColor: response.data.primaryColor,
                secondaryColor: response.data.secondaryColor,
                accentColor: response.data.accentColor,
                backgroundColor: response.data.backgroundColor,
                fontFamily: response.data.fontFamily || 'Montserrat',
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
            window.location.reload();
        } catch (error) {
            console.error('Error al guardar tema:', error);
            alert('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-sm">Cargando configuración...</div>;
    }

    return (
        <div className={embedded ? '' : "min-h-screen bg-gray-50 p-4"}>
            <div className={embedded ? '' : "max-w-4xl mx-auto"}>
                {!embedded && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <h1 className="text-xl font-bold text-gray-800">Diseño de Imagen</h1>
                        <p className="text-xs text-gray-500 mt-1">Personaliza los colores y la apariencia del portal</p>
                    </div>
                )}

                <div className={`${!embedded ? 'bg-white rounded-lg shadow-sm p-4' : ''}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sección de Tipografía */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Tipografía</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Fuente Principal
                                    </label>
                                    <select
                                        value={formData.fontFamily}
                                        onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        {fontOptions.map((font) => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Se aplicará a todos los textos.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center p-3 bg-gray-50 rounded border border-gray-200">
                                    <div style={{ fontFamily: formData.fontFamily }} className="text-center">
                                        <p className="text-xl font-bold mb-1">Aa</p>
                                        <p className="text-sm leading-tight">El veloz murciélago hindú comía feliz cardillo y kiwi.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Colores */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Paleta de Colores</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Color Primario */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Primario
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="h-8 w-12 p-0.5 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                </div>

                                {/* Color Secundario */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Secundario
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            className="h-8 w-12 p-0.5 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                </div>

                                {/* Color de Acento */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Acento
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={formData.accentColor}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            className="h-8 w-12 p-0.5 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.accentColor}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                </div>

                                {/* Color de Fondo */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Fondo
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            className="h-8 w-12 p-0.5 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs uppercase"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Previsualización</h3>
                            <div
                                className="p-4 rounded-lg border border-gray-200"
                                style={{
                                    backgroundColor: formData.backgroundColor,
                                    fontFamily: formData.fontFamily
                                }}
                            >
                                <div className="flex gap-4">
                                    <div
                                        className="w-1/4 h-24 rounded shadow-sm flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: formData.primaryColor }}
                                    >
                                        Primario
                                    </div>
                                    <div className="w-3/4 space-y-3">
                                        <div className="h-6 w-1/3 rounded" style={{ backgroundColor: formData.secondaryColor }}></div>
                                        <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1.5 rounded text-white text-xs font-medium shadow-sm"
                                                style={{ backgroundColor: formData.primaryColor }}
                                            >
                                                Principal
                                            </button>
                                            <button
                                                className="px-3 py-1.5 rounded border text-xs font-medium shadow-sm"
                                                style={{
                                                    borderColor: formData.accentColor,
                                                    color: '#374151',
                                                    backgroundColor: 'white'
                                                }}
                                            >
                                                Secundario
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary text-secondary-text px-4 py-2 rounded hover:opacity-90 transition text-sm font-medium shadow-sm disabled:opacity-50"
                                style={{ backgroundColor: formData.primaryColor, color: '#ffffff' }}
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
