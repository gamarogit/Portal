import { useState, useEffect } from 'react';
import { inventoryService, Product } from '../services/inventory';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function InventoryView() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await inventoryService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
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
                                onClick={() => navigate('/inventory/quick-update')}
                                className="px-4 py-2 rounded-lg hover:opacity-90 transition font-medium text-white shadow-sm"
                                style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
                            >
                                ⚡ Actualización Rápida
                            </button>
                            <button
                                onClick={() => window.history.back()}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SKU
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mínimo
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => {
                                    const status = getStockStatus(product);
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.sku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.category || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                                {product.currentStock} {product.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                {product.minStock} {product.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <span className={`${status.color} font-medium`}>
                                                    {status.icon} {status.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No hay productos registrados
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
