import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { inventoryService, Product, Supplier } from '../services/inventory';

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
}

export default function PurchaseOrderFormView() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [formData, setFormData] = useState({
        supplierId: '',
        expectedDate: '',
        notes: ''
    });

    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [suppliersData, productsData] = await Promise.all([
                inventoryService.getSuppliers(),
                inventoryService.getProducts()
            ]);
            setSuppliers(suppliersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const newItem: OrderItem = {
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            unitCost: product.unitCost || 0,
            subtotal: quantity * (product.unitCost || 0)
        };

        setItems([...items, newItem]);
        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId) {
            alert('Seleccione un proveedor');
            return;
        }
        if (items.length === 0) {
            alert('Agregue al menos un producto');
            return;
        }

        setLoading(true);
        try {
            await inventoryService.createPurchaseOrder({
                supplierId: formData.supplierId,
                expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
                notes: formData.notes,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost
                }))
            });
            alert('Orden de compra creada correctamente');
            navigate('/inventory/purchase-orders');
        } catch (error: any) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.message || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">Nueva Orden de Compra</h1>
                            <p className="text-sm text-gray-500 mt-1">Crear una nueva orden de compra manual</p>
                        </div>
                        <button
                            onClick={() => navigate('/inventory/purchase-orders')}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                <select
                                    required
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                >
                                    <option value="">Seleccionar proveedor...</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Esperada</label>
                                <input
                                    type="date"
                                    value={formData.expectedDate}
                                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Productos</h3>

                            <div className="flex gap-4 mb-4 items-end bg-gray-50 p-4 rounded-lg">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white"
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    disabled={!selectedProduct}
                                    className="px-4 py-2 bg-secondary text-white rounded-md hover:opacity-90 disabled:opacity-50"
                                >
                                    Agregar
                                </button>
                            </div>

                            {items.length > 0 ? (
                                <div className="overflow-hidden border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">${item.unitCost.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">${item.subtotal.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">Total:</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">${calculateTotal().toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                    No hay productos agregados a la orden
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium shadow-sm disabled:opacity-50"
                                style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
                            >
                                {loading ? 'Creando...' : 'Crear Orden de Compra'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
