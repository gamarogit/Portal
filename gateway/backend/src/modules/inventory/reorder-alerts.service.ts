import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReorderAlertStatus } from '@prisma/client';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReorderAlertsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    /**
     * Obtener todas las alertas de reabastecimiento
     */
    async findAll(status?: ReorderAlertStatus) {
        const where = status ? { status } : {};

        return this.prisma.reorderAlert.findMany({
            where,
            include: {
                product: {
                    include: {
                        preferredSupplier: true,
                    },
                },
                purchaseOrder: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Obtener alertas pendientes
     */
    async findPending() {
        return this.findAll(ReorderAlertStatus.PENDING);
    }

    /**
     * Obtener una alerta específica
     */
    async findOne(id: string) {
        return this.prisma.reorderAlert.findUnique({
            where: { id },
            include: {
                product: {
                    include: {
                        preferredSupplier: true,
                    },
                },
                purchaseOrder: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        supplier: true,
                    },
                },
            },
        });
    }

    /**
     * Crear una alerta de reabastecimiento manualmente
     */
    /**
     * Crear una alerta de reabastecimiento manualmente
     */
    async create(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        if (!product.reorderPoint) {
            throw new Error('El producto no tiene punto de reorden configurado');
        }

        // Verificar si ya existe una alerta pendiente para este producto
        const existingAlert = await this.prisma.reorderAlert.findFirst({
            where: {
                productId,
                status: ReorderAlertStatus.PENDING,
            },
        });

        if (existingAlert) {
            return existingAlert;
        }

        // Calcular cantidad sugerida
        const suggestedQuantity = this.calculateSuggestedQuantity(product);

        const alert = await this.prisma.reorderAlert.create({
            data: {
                productId,
                currentStock: product.currentStock,
                reorderPoint: product.reorderPoint,
                suggestedQuantity,
                status: ReorderAlertStatus.PENDING,
            },
            include: {
                product: {
                    include: {
                        preferredSupplier: true,
                    },
                },
            },
        });

        await this.notificationsService.createFromAlert(alert);

        return alert;
    }

    /**
     * Crear alerta automáticamente desde un movimiento de stock
     */
    async createFromStockMovement(productId: string, newStock: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product || !product.reorderPoint) {
            return null;
        }

        // Solo crear alerta si el stock cae en o por debajo del punto de reorden
        if (newStock > product.reorderPoint) {
            return null;
        }

        // Verificar si ya existe una alerta pendiente
        const existingAlert = await this.prisma.reorderAlert.findFirst({
            where: {
                productId,
                status: ReorderAlertStatus.PENDING,
            },
        });

        if (existingAlert) {
            return existingAlert;
        }

        const suggestedQuantity = this.calculateSuggestedQuantity(product);

        const alert = await this.prisma.reorderAlert.create({
            data: {
                productId,
                currentStock: newStock,
                reorderPoint: product.reorderPoint,
                suggestedQuantity,
                status: ReorderAlertStatus.PENDING,
            },
            include: {
                product: {
                    include: {
                        preferredSupplier: true,
                    },
                },
            },
        });

        await this.notificationsService.createFromAlert(alert);

        return alert;
    }

    /**
     * Resolver una alerta
     */
    async resolve(id: string) {
        return this.prisma.reorderAlert.update({
            where: { id },
            data: {
                status: ReorderAlertStatus.RESOLVED,
                resolvedAt: new Date(),
            },
        });
    }

    /**
     * Ignorar una alerta
     */
    async ignore(id: string, notes?: string) {
        return this.prisma.reorderAlert.update({
            where: { id },
            data: {
                status: ReorderAlertStatus.IGNORED,
                resolvedAt: new Date(),
                notes,
            },
        });
    }

    /**
     * Marcar alerta como ordenada (vinculada a una OC)
     */
    async markAsOrdered(id: string, purchaseOrderId: string) {
        return this.prisma.reorderAlert.update({
            where: { id },
            data: {
                status: ReorderAlertStatus.ORDERED,
                purchaseOrderId,
            },
        });
    }

    /**
     * Calcular cantidad sugerida de compra
     * Usa optimalOrderQuantity si está definido, sino calcula basado en maxStock
     */
    private calculateSuggestedQuantity(product: any): number {
        // Si hay cantidad óptima definida, usarla
        if (product.optimalOrderQuantity && product.optimalOrderQuantity > 0) {
            return product.optimalOrderQuantity;
        }

        // Si hay stock máximo, calcular para llegar al máximo
        if (product.maxStock && product.maxStock > product.currentStock) {
            return product.maxStock - product.currentStock;
        }

        // Si no hay nada definido, sugerir el doble del punto de reorden
        if (product.reorderPoint) {
            return product.reorderPoint * 2;
        }

        // Fallback: sugerir 10 unidades
        return 10;
    }
}
