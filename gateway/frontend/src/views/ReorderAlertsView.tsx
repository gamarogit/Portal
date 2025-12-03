import { useState, useEffect } from 'react';
import { inventoryService, ReorderAlert } from '../services/inventory';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function ReorderAlertsView() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ORDERED'>('PENDING');

    useEffect(() => {
        loadAlerts();
    }, [filter]);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const status = filter === 'ALL' ? undefined : filter;
            const data = await inventoryService.getReorderAlerts(status as any);
            setAlerts(data);
        } catch (error) {
            console.error('Error cargando alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePurchaseOrder = async (alertId: string) => {
        try {
            const purchaseOrder = await inventoryService.createPurchaseOrderFromAlert(alertId);
            alert(`Orden de compra ${purchaseOrder.orderNumber} creada exitosamente`);
            loadAlerts();
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.message || 'No se pudo crear la orden de compra'}`);
        }
    };

    const handleIgnoreAlert = async (alertId: string) => {
        const notes = prompt('¿Por qué deseas ignorar esta alerta?');
        if (notes === null) return;

        try {
            await inventoryService.ignoreReorderAlert(alertId, notes);
            loadAlerts();
        } catch (error) {
            alert('Error al ignorar la alerta');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; label: string }> = {
            PENDING: { bg: '#fff3cd', text: '#856404', label: 'Pendiente' },
            ORDERED: { bg: '#d1ecf1', text: '#0c5460', label: 'Ordenada' },
            RESOLVED: { bg: '#d4edda', text: '#155724', label: 'Resuelta' },
            IGNORED: { bg: '#f8d7da', text: '#721c24', label: 'Ignorada' },
        };

        const style = styles[status] || styles.PENDING;

        return (
            <span
                style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: style.bg,
                    color: style.text,
                }}
            >
                {style.label}
            </span>
        );
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: theme.primaryColor }}>
                        🔔 Alertas de Reabastecimiento
                    </h1>
                    <p style={{ margin: 0, color: '#666' }}>
                        Gestiona las alertas de productos que necesitan reabastecimiento
                    </p>
                </div>
                <button
                    onClick={() => navigate('/inventory')}
                    style={{
                        padding: '10px 20px',
                        background: theme.primaryColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                    }}
                >
                    ← Volver a Inventario
                </button>
            </div>

            {/* Filtros */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                {['ALL', 'PENDING', 'ORDERED'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        style={{
                            padding: '8px 16px',
                            border: `2px solid ${filter === f ? theme.primaryColor : '#ddd'}`,
                            borderRadius: '8px',
                            background: filter === f ? theme.primaryColor : 'white',
                            color: filter === f ? 'white' : '#333',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendientes' : 'Ordenadas'}
                    </button>
                ))}
            </div>

            {/* Lista de alertas */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Cargando alertas...</p>
                </div>
            ) : alerts.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                    }}
                >
                    <p style={{ fontSize: '18px', color: '#666' }}>
                        ✅ No hay alertas {filter === 'PENDING' ? 'pendientes' : filter === 'ORDERED' ? 'ordenadas' : ''}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', color: theme.primaryColor }}>
                                            {alert.product?.name}
                                        </h3>
                                        {getStatusBadge(alert.status)}
                                    </div>
                                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                        SKU: {alert.product?.sku}
                                    </p>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '16px',
                                            marginTop: '16px',
                                        }}
                                    >
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                                                Stock Actual
                                            </p>
                                            <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#d32f2f' }}>
                                                {alert.currentStock} {alert.product?.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                                                Punto de Reorden
                                            </p>
                                            <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#ff9800' }}>
                                                {alert.reorderPoint} {alert.product?.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                                                Cantidad Sugerida
                                            </p>
                                            <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#4caf50' }}>
                                                {alert.suggestedQuantity} {alert.product?.unit}
                                            </p>
                                        </div>
                                        {alert.product?.preferredSupplier && (
                                            <div>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                                                    Proveedor Preferido
                                                </p>
                                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                                                    {alert.product.preferredSupplier.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones */}
                                {alert.status === 'PENDING' && (
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                        <button
                                            onClick={() => handleCreatePurchaseOrder(alert.id)}
                                            disabled={!alert.product?.preferredSupplier}
                                            style={{
                                                padding: '10px 20px',
                                                background: alert.product?.preferredSupplier ? theme.primaryColor : '#ccc',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: alert.product?.preferredSupplier ? 'pointer' : 'not-allowed',
                                                fontWeight: '500',
                                                fontSize: '14px',
                                            }}
                                            title={!alert.product?.preferredSupplier ? 'Configure un proveedor preferido primero' : ''}
                                        >
                                            📦 Generar OC
                                        </button>
                                        <button
                                            onClick={() => handleIgnoreAlert(alert.id)}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'white',
                                                color: '#666',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '14px',
                                            }}
                                        >
                                            Ignorar
                                        </button>
                                    </div>
                                )}

                                {alert.status === 'ORDERED' && alert.purchaseOrder && (
                                    <div style={{ marginLeft: '16px' }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                                            Orden de Compra
                                        </p>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: theme.primaryColor }}>
                                            {alert.purchaseOrder.orderNumber}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {alert.notes && (
                                <div
                                    style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                        <strong>Notas:</strong> {alert.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
