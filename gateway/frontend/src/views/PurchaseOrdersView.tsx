import { useState, useEffect } from 'react';
import { inventoryService, PurchaseOrder } from '../services/inventory';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function PurchaseOrdersView() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'SENT' | 'RECEIVED'>('ALL');

    useEffect(() => {
        loadOrders();
    }, [filter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const status = filter === 'ALL' ? undefined : filter;
            const data = await inventoryService.getPurchaseOrders({ status: status as any });
            setOrders(data);
        } catch (error) {
            console.error('Error cargando órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOrder = async (orderId: string) => {
        if (!confirm('¿Enviar esta orden de compra al proveedor?')) return;

        try {
            await inventoryService.sendPurchaseOrder(orderId);
            alert('Orden enviada exitosamente');
            loadOrders();
        } catch (error) {
            alert('Error al enviar la orden');
        }
    };

    const handleReceiveOrder = async (order: PurchaseOrder) => {
        const items = order.items.map((item) => ({
            itemId: item.id,
            receivedQty: item.quantity, // Por defecto recibir todo
        }));

        try {
            await inventoryService.receivePurchaseOrder(order.id, items);
            alert('Mercancía recibida e inventario actualizado');
            loadOrders();
        } catch (error) {
            alert('Error al recibir la orden');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('¿Cancelar esta orden de compra?')) return;

        try {
            await inventoryService.cancelPurchaseOrder(orderId);
            alert('Orden cancelada');
            loadOrders();
        } catch (error) {
            alert('Error al cancelar la orden');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; label: string }> = {
            DRAFT: { bg: '#e3f2fd', text: '#1565c0', label: 'Borrador' },
            SENT: { bg: '#fff3cd', text: '#856404', label: 'Enviada' },
            RECEIVED: { bg: '#d4edda', text: '#155724', label: 'Recibida' },
            CANCELLED: { bg: '#f8d7da', text: '#721c24', label: 'Cancelada' },
        };

        const style = styles[status] || styles.DRAFT;

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

    const formatCurrency = (amount?: number) => {
        if (!amount) return '$0.00';
        return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-MX');
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: theme.primaryColor }}>
                        📦 Órdenes de Compra
                    </h1>
                    <p style={{ margin: 0, color: '#666' }}>
                        Gestiona las órdenes de compra a proveedores
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/inventory/purchase-orders/new')}
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        + Nueva Orden
                    </button>
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
            </div>

            {/* Filtros */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                {['ALL', 'DRAFT', 'SENT', 'RECEIVED'].map((f) => (
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
                        {f === 'ALL' ? 'Todas' : f === 'DRAFT' ? 'Borradores' : f === 'SENT' ? 'Enviadas' : 'Recibidas'}
                    </button>
                ))}
            </div>

            {/* Lista de órdenes */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Cargando órdenes...</p>
                </div>
            ) : orders.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                    }}
                >
                    <p style={{ fontSize: '18px', color: '#666' }}>
                        No hay órdenes de compra
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '20px', color: theme.primaryColor }}>
                                            {order.orderNumber}
                                        </h3>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                        Proveedor: <strong>{order.supplier?.name}</strong>
                                    </p>
                                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                        Fecha: {formatDate(order.orderDate)}
                                        {order.expectedDate && ` | Esperada: ${formatDate(order.expectedDate)}`}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>Total</p>
                                    <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.primaryColor }}>
                                        {formatCurrency(order.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                    Productos ({order.items.length})
                                </p>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                padding: '12px',
                                                background: '#f8f9fa',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <div>
                                                <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>
                                                    {item.product?.name}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                                    {item.quantity} {item.product?.unit} × {formatCurrency(Number(item.unitCost))}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontWeight: '600' }}>
                                                    {formatCurrency(Number(item.subtotal))}
                                                </p>
                                                {order.status === 'RECEIVED' && (
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                                                        ✓ Recibido: {item.receivedQty}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acciones */}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {order.status === 'DRAFT' && (
                                    <>
                                        <button
                                            onClick={() => handleSendOrder(order.id)}
                                            style={{
                                                padding: '8px 16px',
                                                background: theme.primaryColor,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                            }}
                                        >
                                            📤 Enviar
                                        </button>
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            style={{
                                                padding: '8px 16px',
                                                background: 'white',
                                                color: '#d32f2f',
                                                border: '1px solid #d32f2f',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                )}
                                {order.status === 'SENT' && (
                                    <button
                                        onClick={() => handleReceiveOrder(order)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        ✓ Recibir Mercancía
                                    </button>
                                )}
                            </div>

                            {order.notes && (
                                <div
                                    style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                        <strong>Notas:</strong> {order.notes}
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
