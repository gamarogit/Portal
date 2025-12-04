import { useState } from 'react';
import { inventoryService, Product } from '../services/inventory';
import { useTheme } from '../context/ThemeContext';

export default function QuickStockUpdateView() {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [movementType, setMovementType] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('SALIDA');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const results = await inventoryService.searchProducts(searchQuery);
            setSearchResults(results);
            if (results.length === 1) {
                setSelectedProduct(results[0]);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al buscar productos' });
        } finally {
            setLoading(false);
        }
    };

    const calculateNewStock = () => {
        if (!selectedProduct || !quantity) return selectedProduct?.currentStock || 0;

        const qty = parseInt(quantity);
        if (movementType === 'ENTRADA') {
            return selectedProduct.currentStock + qty;
        } else if (movementType === 'SALIDA') {
            return selectedProduct.currentStock - qty;
        } else {
            return qty;
        }
    };

    const handleRegisterMovement = async () => {
        if (!selectedProduct || !quantity) return;

        setLoading(true);
        setMessage(null);

        try {
            await inventoryService.registerMovement({
                productId: selectedProduct.id,
                type: movementType,
                quantity: parseInt(quantity),
                reason: reason || undefined,
                reference: reference || undefined,
                notes: notes || undefined,
            });

            const newStock = calculateNewStock();
            const stockStatus = newStock <= selectedProduct.minStock
                ? newStock === 0
                    ? '❌ Sin stock'
                    : '⚠️ Stock bajo'
                : '✅ Stock normal';

            setMessage({
                type: 'success',
                text: `Movimiento registrado correctamente. Nuevo stock: ${newStock} ${selectedProduct.unit}. ${stockStatus}`,
            });

            // Actualizar producto
            const updatedProduct = await inventoryService.getProduct(selectedProduct.id);
            setSelectedProduct(updatedProduct);

            // Limpiar formulario
            setQuantity('');
            setReason('');
            setReference('');
            setNotes('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al registrar movimiento' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setSelectedProduct(null);
        setSearchResults([]);
        setSearchQuery('');
        setQuantity('');
        setReason('');
        setReference('');
        setNotes('');
        setMessage(null);
    };

    const newStock = calculateNewStock();
    const isStockLow = newStock <= (selectedProduct?.minStock || 0);
    const isOutOfStock = newStock === 0;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">📦 Gestión Rápida de Stock</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Actualiza las cantidades de productos de manera inmediata
                            </p>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                        >
                            ← Volver
                        </button>
                    </div>
                </div>

                {/* Búsqueda */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar Producto por Nombre o SKU
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Ej: LAP-001 o Laptop Dell"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            style={{ borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : undefined }}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading || !searchQuery.trim()}
                            className="px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-white shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
                        >
                            🔍 Buscar
                        </button>
                    </div>

                    {/* Resultados de búsqueda */}
                    {searchResults.length > 1 && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Se encontraron {searchResults.length} productos:</p>
                            <div className="space-y-2">
                                {searchResults.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="font-medium">{product.sku} - {product.name}</div>
                                        <div className="text-sm text-gray-500">
                                            Stock: {product.currentStock} {product.unit}
                                            {product.currentStock <= product.minStock && (
                                                <span className="ml-2 text-orange-600">⚠️ Stock bajo</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Formulario de movimiento */}
                {selectedProduct && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-secondary mb-4">Producto Seleccionado</h2>

                        {/* Info del producto */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">SKU</div>
                                    <div className="font-medium">{selectedProduct.sku}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Nombre</div>
                                    <div className="font-medium">{selectedProduct.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Stock Actual</div>
                                    <div className="font-medium text-lg">{selectedProduct.currentStock} {selectedProduct.unit}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Stock Mínimo</div>
                                    <div className="font-medium">{selectedProduct.minStock} {selectedProduct.unit}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tipo de movimiento */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Movimiento
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        value="ENTRADA"
                                        checked={movementType === 'ENTRADA'}
                                        onChange={(e) => setMovementType(e.target.value as any)}
                                        className="mr-2"
                                        style={{ accentColor: theme?.primaryColor }}
                                    />
                                    <span>📥 Entrada</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        value="SALIDA"
                                        checked={movementType === 'SALIDA'}
                                        onChange={(e) => setMovementType(e.target.value as any)}
                                        className="mr-2"
                                        style={{ accentColor: theme?.primaryColor }}
                                    />
                                    <span>📤 Salida</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        value="AJUSTE"
                                        checked={movementType === 'AJUSTE'}
                                        onChange={(e) => setMovementType(e.target.value as any)}
                                        className="mr-2"
                                        style={{ accentColor: theme?.primaryColor }}
                                    />
                                    <span>🔧 Ajuste</span>
                                </label>
                            </div>
                        </div>

                        {/* Cantidad */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cantidad {movementType === 'AJUSTE' ? '(nuevo stock total)' : ''}
                            </label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="0"
                                placeholder="Ingrese la cantidad"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                style={{ borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : undefined }}
                            />
                        </div>

                        {/* Motivo */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                style={{ borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : undefined }}
                            >
                                <option value="">Seleccione un motivo</option>
                                {movementType === 'ENTRADA' && (
                                    <>
                                        <option value="Compra">Compra</option>
                                        <option value="Devolución">Devolución</option>
                                        <option value="Producción">Producción</option>
                                    </>
                                )}
                                {movementType === 'SALIDA' && (
                                    <>
                                        <option value="Venta">Venta</option>
                                        <option value="Uso interno">Uso interno</option>
                                        <option value="Merma">Merma</option>
                                        <option value="Devolución a proveedor">Devolución a proveedor</option>
                                    </>
                                )}
                                {movementType === 'AJUSTE' && (
                                    <>
                                        <option value="Inventario físico">Inventario físico</option>
                                        <option value="Corrección">Corrección</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Referencia */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Referencia (Opcional)
                            </label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Ej: Pedido #12345, Factura #ABC"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                style={{ borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : undefined }}
                            />
                        </div>

                        {/* Notas */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas (Opcional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Información adicional..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                style={{ borderColor: theme?.primaryColor ? `${theme.primaryColor}40` : undefined }}
                            />
                        </div>

                        {/* Nuevo stock */}
                        {quantity && (
                            <div className={`p-4 rounded-lg mb-4 ${isOutOfStock ? 'bg-red-50' : isStockLow ? 'bg-orange-50' : 'bg-green-50'}`}>
                                <div className="text-sm font-medium mb-1">Nuevo Stock:</div>
                                <div className={`text-2xl font-bold ${isOutOfStock ? 'text-red-700' : isStockLow ? 'text-orange-700' : 'text-green-700'}`}>
                                    {newStock} {selectedProduct.unit}
                                </div>
                                {isOutOfStock && (
                                    <div className="text-sm text-red-600 mt-2">❌ Producto quedará sin stock</div>
                                )}
                                {isStockLow && !isOutOfStock && (
                                    <div className="text-sm text-orange-600 mt-2">⚠️ Stock por debajo del mínimo ({selectedProduct.minStock})</div>
                                )}
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRegisterMovement}
                                disabled={loading || !quantity}
                                className="px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-white shadow-sm disabled:opacity-50"
                                style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
                            >
                                {loading ? 'Registrando...' : 'Registrar Movimiento'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Mensaje de estado */}
                {message && (
                    <div
                        className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
