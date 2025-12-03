import { useState, useEffect } from 'react';
import { saveFormConfig } from '@services/formConfigApi';
import { useTheme } from '@contexts/ThemeContext';

interface Field {
    name: string;
    label: string; // O una forma de obtener el label legible
    order: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    formName: string;
    currentFields: { name: string; label?: string; order: number }[];
    onConfigSaved: () => void;
}

export default function FieldReorderModal({ isOpen, onClose, formName, currentFields, onConfigSaved }: Props) {
    const { theme } = useTheme();
    const [fields, setFields] = useState<Field[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Inicializar campos ordenados solo al abrir
            const sorted = [...currentFields].sort((a, b) => a.order - b.order);
            setFields(sorted.map((f, index) => ({
                name: f.name,
                label: f.label || f.name,
                order: index
            })));
        }
    }, [isOpen]); // Eliminar currentFields de las dependencias para evitar reset si el padre re-renderiza

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newFields = [...fields];
        const temp = newFields[index];
        newFields[index] = newFields[index - 1];
        newFields[index - 1] = temp;
        // Recalcular orden
        newFields.forEach((f, i) => f.order = i);
        setFields(newFields);
    };

    const moveDown = (index: number) => {
        if (index === fields.length - 1) return;
        const newFields = [...fields];
        const temp = newFields[index];
        newFields[index] = newFields[index + 1];
        newFields[index + 1] = temp;
        // Recalcular orden
        newFields.forEach((f, i) => f.order = i);
        setFields(newFields);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const config = {
                fields: fields.map(f => ({
                    name: f.name,
                    label: f.label,
                    type: 'text',
                    required: false,
                    order: f.order
                }))
            };

            // DEBUG: Confirmar con el usuario qué se está enviando
            const orderSummary = fields.map(f => f.label).join(', ');
            alert(`DEBUG: Guardando el siguiente orden:\n${orderSummary}`);

            console.log('[FieldReorderModal] Enviando configuración:', JSON.stringify(config));
            await saveFormConfig(formName, config);
            onConfigSaved();
            onClose();
            // Opcional: Mostrar notificación de éxito si hubiera un sistema de toast
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Error al guardar la configuración. Por favor intente de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const primaryColor = theme?.primaryColor || '#2563eb';
    const secondaryColor = theme?.secondaryColor || '#64748b';

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '450px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Reordenar Campos</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}>
                        Arrastra o usa las flechas para cambiar el orden de los campos en el formulario.
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {fields.map((field, index) => (
                            <li key={field.name} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 15px',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}>
                                <span style={{ fontWeight: 500, color: '#334155' }}>{field.label}</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        style={{
                                            padding: '4px 8px',
                                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                                            backgroundColor: index === 0 ? '#f1f5f9' : '#e2e8f0',
                                            color: index === 0 ? '#cbd5e1' : '#475569',
                                            border: 'none',
                                            borderRadius: '4px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Mover arriba"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveDown(index)}
                                        disabled={index === fields.length - 1}
                                        style={{
                                            padding: '4px 8px',
                                            cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer',
                                            backgroundColor: index === fields.length - 1 ? '#f1f5f9' : '#e2e8f0',
                                            color: index === fields.length - 1 ? '#cbd5e1' : '#475569',
                                            border: 'none',
                                            borderRadius: '4px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Mover abajo"
                                    >
                                        ↓
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: 'white',
                            color: '#475569',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            backgroundColor: primaryColor,
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '6px',
                            cursor: saving ? 'wait' : 'pointer',
                            fontWeight: 500,
                            boxShadow: `0 2px 4px ${primaryColor}40`
                        }}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
