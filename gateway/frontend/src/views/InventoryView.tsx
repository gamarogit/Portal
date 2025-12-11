import { useState, useEffect } from 'react';
import { inventoryService, Product } from '../services/inventory';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function InventoryView() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        sku: '',
        name: '',
        description: '',
        category: '',
        unit: 'unidad',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        reorderPoint: 0,
        optimalOrderQuantity: 0,
        preferredSupplierId: '',
        unitCost: 0,
        location: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, suppliersData] = await Promise.all([
                inventoryService.getProducts(),
                inventoryService.getSuppliers(),
            ]);
            setProducts(productsData);
            setSuppliers(suppliersData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                sku: product.sku,
                name: product.name,
                description: product.description,
                category: product.category,
                unit: product.unit,
                currentStock: product.currentStock,
                minStock: product.minStock,
                maxStock: product.maxStock,
                reorderPoint: product.reorderPoint || 0,
                optimalOrderQuantity: product.optimalOrderQuantity || 0,
                preferredSupplierId: product.preferredSupplierId || '',
                unitCost: product.unitCost,
                location: product.location,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                sku: '',
                name: '',
                description: '',
                category: '',
                unit: 'unidad',
                currentStock: 0,
                minStock: 0,
                maxStock: 0,
                reorderPoint: 0,
                optimalOrderQuantity: 0,
                preferredSupplierId: '',
                unitCost: 0,
                location: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await inventoryService.updateProduct(editingProduct.id, formData);
                alert('Producto actualizado correctamente');
            } else {
                await inventoryService.createProduct(formData);
                alert('Producto creado correctamente');
            }
            handleCloseModal();
            loadData();
        } catch (error: any) {
            console.error('Error saving product:', error);
            alert(error.response?.data?.message || 'Error al guardar producto');
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`¿Estás seguro de eliminar el producto ${product.name}?`)) return;
        try {
            await inventoryService.deleteProduct(product.id);
            alert('Producto eliminado correctamente');
            loadData();
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    const getStockStatus = (product: Product) => {
        if (product.currentStock === 0) return { icon: '❌', text: 'Sin stock', color: 'text-red-600' };
        if (product.currentStock <= product.minStock) return { icon: '⚠️', text: 'Stock bajo', color: 'text-orange-600' };
        return { icon: '✅', text: 'Normal', color: 'text-green-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mb-4"></div>
                    <p className="text-gray-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">📦 Inventarios</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Control de stock y gestión de productos
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/inventory/reorder-alerts')}
                                className="px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition font-medium"
                            >
                                🔔 Alertas
                            </button>
                            <button
                                onClick={() => navigate('/inventory/purchase-orders')}
                                className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                            >
                                📦 Órdenes
                            </button>
                            <button
                                onClick={() => navigate('/inventory/quick-update')}
                                className="px-4 py-2 rounded-lg hover:opacity-90 transition font-medium text-white shadow-sm"
                                style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
                            >
                                ⚡ Actualización Rápida
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                            >
                                + Nuevo Producto
                            </button>
                            <button
                                onClick={() => navigate('/systems')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                            >
                                ← Volver
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-sm text-gray-600">Total Productos</div>
                        <div className="text-2xl font-bold text-secondary">{products.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-sm text-gray-600">Stock Normal</div>
                        <div className="text-2xl font-bold text-green-600">
                            {products.filter(p => p.currentStock > p.minStock).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-sm text-gray-600">Stock Bajo</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-sm text-gray-600">Sin Stock</div>
                        <div className="text-2xl font-bold text-red-600">
                            {products.filter(p => p.currentStock === 0).length}
                        </div>
                    </div>
                </div>

                {/* Lista de productos */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reorden</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => {
                                    const status = getStockStatus(product);
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                                {product.currentStock} {product.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                <div>Min: {product.minStock}</div>
                                                {product.reorderPoint && <div className="text-orange-600 font-medium">Punto: {product.reorderPoint}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <span className={`${status.color} font-medium`}>
                                                    {status.icon} {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="text-primary hover:text-blue-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Producto */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                                <h2 className="text-xl font-semibold text-secondary">
                                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                </h2>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md bg-white"
                                    >
                                        <option value="unidad">Unidad</option>
                                        <option value="kg">Kilogramo (kg)</option>
                                        <option value="litro">Litro (L)</option>
                                        <option value="metro">Metro (m)</option>
                                        <option value="caja">Caja</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>

                                <div className="col-span-2 border-t pt-4 mt-2">
                                    <h3 className="font-medium text-gray-900 mb-3">Configuración de Reabastecimiento</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Reorden</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.reorderPoint}
                                        onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md border-orange-300"
                                        placeholder="Ej: 20"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Stock que activa la alerta</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Óptima de Compra</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.optimalOrderQuantity}
                                        onChange={(e) => setFormData({ ...formData, optimalOrderQuantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md border-green-300"
                                        placeholder="Ej: 50"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor Preferido</label>
                                    <select
                                        value={formData.preferredSupplierId}
                                        onChange={(e) => setFormData({ ...formData, preferredSupplierId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md bg-white"
                                    >
                                        <option value="">Seleccionar proveedor...</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                                    >
                                        {editingProduct ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
