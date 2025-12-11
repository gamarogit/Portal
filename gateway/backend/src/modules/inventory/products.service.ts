import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockMovementType } from '@prisma/client';
import { ReorderAlertsService } from './reorder-alerts.service';

@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly reorderAlertsService: ReorderAlertsService,
    ) { }

    // Listar todos los productos
    async findAll(includeInactive = false) {
        return this.prisma.product.findMany({
            where: includeInactive ? {} : { active: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        movements: true,
                        alerts: { where: { resolved: false } },
                    },
                },
            },
        });
    }

    // Buscar productos por nombre o SKU
    async search(query: string) {
        return this.prisma.product.findMany({
            where: {
                AND: [
                    { active: true },
                    {
                        OR: [
                            { sku: { contains: query, mode: 'insensitive' } },
                            { name: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                ],
            },
            orderBy: { name: 'asc' },
        });
    }

    // Obtener un producto por ID
    async findOne(id: string) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                movements: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true, email: true } } },
                },
                alerts: {
                    where: { resolved: false },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    // Crear un producto
    async create(data: {
        sku: string;
        name: string;
        description?: string;
        category?: string;
        unit?: string;
        currentStock?: number;
        minStock?: number;
        maxStock?: number;
        reorderPoint?: number;
        optimalOrderQuantity?: number;
        preferredSupplierId?: string;
        unitCost?: number;
        location?: string;
    }) {
        return this.prisma.product.create({
            data,
        });
    }

    // Actualizar un producto
    async update(
        id: string,
        data: {
            sku?: string;
            name?: string;
            description?: string;
            category?: string;
            unit?: string;
            minStock?: number;
            maxStock?: number;
            reorderPoint?: number;
            optimalOrderQuantity?: number;
            preferredSupplierId?: string;
            unitCost?: number;
            location?: string;
            active?: boolean;
        },
    ) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    // Eliminar un producto (soft delete)
    async remove(id: string) {
        return this.prisma.product.update({
            where: { id },
            data: { active: false },
        });
    }

    // Obtener productos con stock bajo
    async getLowStock() {
        return this.prisma.product.findMany({
            where: {
                active: true,
                currentStock: {
                    lte: this.prisma.product.fields.minStock,
                },
            },
            orderBy: { currentStock: 'asc' },
        });
    }

    // Obtener productos sin stock
    async getOutOfStock() {
        return this.prisma.product.findMany({
            where: {
                active: true,
                currentStock: 0,
            },
            orderBy: { name: 'asc' },
        });
    }

    // Registrar movimiento de stock
    async registerMovement(data: {
        productId: string;
        type: StockMovementType;
        quantity: number;
        reason?: string;
        reference?: string;
        notes?: string;
        userId: string;
    }) {
        const product = await this.prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const previousStock = product.currentStock;
        let newStock = previousStock;

        // Calcular nuevo stock según el tipo de movimiento
        if (data.type === 'ENTRADA') {
            newStock += data.quantity;
        } else if (data.type === 'SALIDA') {
            newStock -= data.quantity;
            if (newStock < 0) {
                throw new Error('Stock insuficiente para realizar la salida');
            }
        } else if (data.type === 'AJUSTE') {
            newStock = data.quantity;
        }

        // Crear movimiento y actualizar stock en una transacción
        const [movement] = await this.prisma.$transaction([
            this.prisma.stockMovement.create({
                data: {
                    ...data,
                    previousStock,
                    newStock,
                },
                include: {
                    product: true,
                    user: { select: { name: true, email: true } },
                },
            }),
            this.prisma.product.update({
                where: { id: data.productId },
                data: { currentStock: newStock },
            }),
        ]);

        // Verificar y crear alertas si es necesario
        await this.checkStockAlerts(data.productId, newStock);

        // Verificar punto de reorden y crear alerta de reabastecimiento si es necesario
        await this.reorderAlertsService.createFromStockMovement(
            data.productId,
            newStock,
        );

        return movement;
    }

    // Verificar y crear alertas de stock
    private async checkStockAlerts(productId: string, currentStock: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) return;

        // Resolver alertas anteriores si el stock mejoró
        if (currentStock > product.minStock) {
            await this.prisma.stockAlert.updateMany({
                where: {
                    productId,
                    resolved: false,
                },
                data: {
                    resolved: true,
                    resolvedAt: new Date(),
                },
            });
            return;
        }

        // Verificar si ya existe una alerta activa
        const existingAlert = await this.prisma.stockAlert.findFirst({
            where: {
                productId,
                resolved: false,
            },
        });

        if (existingAlert) return;

        // Crear alerta de sin stock
        if (currentStock === 0) {
            await this.prisma.stockAlert.create({
                data: {
                    productId,
                    type: 'OUT_OF_STOCK',
                    message: `Producto sin stock`,
                    currentStock,
                    minStock: product.minStock,
                },
            });
            return;
        }

        // Crear alerta de stock bajo
        if (currentStock <= product.minStock) {
            await this.prisma.stockAlert.create({
                data: {
                    productId,
                    type: 'LOW_STOCK',
                    message: `Stock bajo: ${currentStock} ${product.unit} (mínimo: ${product.minStock})`,
                    currentStock,
                    minStock: product.minStock,
                },
            });
        }
    }
}
