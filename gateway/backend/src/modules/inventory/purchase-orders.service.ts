import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseOrderStatus } from '@prisma/client';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchaseOrdersService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    /**
     * Obtener todas las órdenes de compra
     */
    async findAll(filters?: {
        status?: PurchaseOrderStatus;
        supplierId?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.supplierId) {
            where.supplierId = filters.supplierId;
        }

        if (filters?.startDate || filters?.endDate) {
            where.orderDate = {};
            if (filters.startDate) {
                where.orderDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.orderDate.lte = filters.endDate;
            }
        }

        return this.prisma.purchaseOrder.findMany({
            where,
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                reorderAlerts: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                orderDate: 'desc',
            },
        });
    }

    /**
     * Obtener una orden de compra específica
     */
    async findOne(id: string) {
        return this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                reorderAlerts: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    /**
     * Crear una orden de compra
     */
    async create(data: {
        supplierId: string;
        expectedDate?: Date;
        items: Array<{
            productId: string;
            quantity: number;
            unitCost: number;
        }>;
        notes?: string;
    }) {
        // Generar número de orden único
        const orderNumber = await this.generateOrderNumber();

        // Calcular total
        const totalAmount = data.items.reduce(
            (sum, item) => sum + item.quantity * item.unitCost,
            0,
        );

        const purchaseOrder = await this.prisma.purchaseOrder.create({
            data: {
                orderNumber,
                supplierId: data.supplierId,
                expectedDate: data.expectedDate,
                totalAmount,
                notes: data.notes,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        subtotal: item.quantity * item.unitCost,
                    })),
                },
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        await this.notificationsService.createFromPurchaseOrder(purchaseOrder, 'CREATED');

        return purchaseOrder;
    }

    /**
     * Crear orden de compra desde una alerta de reabastecimiento
     */
    async createFromAlert(alertId: string) {
        const alert = await this.prisma.reorderAlert.findUnique({
            where: { id: alertId },
            include: {
                product: {
                    include: {
                        preferredSupplier: true,
                    },
                },
            },
        });

        if (!alert) {
            throw new Error('Alerta no encontrada');
        }

        if (!alert.product.preferredSupplier) {
            throw new Error(
                'El producto no tiene un proveedor preferido configurado',
            );
        }

        // Crear la orden de compra
        const orderNumber = await this.generateOrderNumber();
        const unitCost = alert.product.unitCost || 0;
        const totalAmount = alert.suggestedQuantity * Number(unitCost);

        const purchaseOrder = await this.prisma.purchaseOrder.create({
            data: {
                orderNumber,
                supplierId: alert.product.preferredSupplierId!,
                totalAmount,
                notes: `Generada automáticamente desde alerta de reabastecimiento`,
                items: {
                    create: {
                        productId: alert.productId,
                        quantity: alert.suggestedQuantity,
                        unitCost,
                        subtotal: totalAmount,
                    },
                },
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Actualizar la alerta para vincularla con la OC
        await this.prisma.reorderAlert.update({
            where: { id: alertId },
            data: {
                status: 'ORDERED',
                purchaseOrderId: purchaseOrder.id,
            },
        });

        await this.notificationsService.createFromPurchaseOrder(purchaseOrder, 'CREATED');

        return purchaseOrder;
    }

    /**
     * Actualizar una orden de compra
     */
    async update(
        id: string,
        data: {
            expectedDate?: Date;
            notes?: string;
            items?: Array<{
                id?: string;
                productId: string;
                quantity: number;
                unitCost: number;
            }>;
        },
    ) {
        const updateData: any = {};

        if (data.expectedDate !== undefined) {
            updateData.expectedDate = data.expectedDate;
        }

        if (data.notes !== undefined) {
            updateData.notes = data.notes;
        }

        // Si se actualizan items, recalcular total
        if (data.items) {
            const totalAmount = data.items.reduce(
                (sum, item) => sum + item.quantity * item.unitCost,
                0,
            );
            updateData.totalAmount = totalAmount;

            // Eliminar items existentes y crear nuevos
            await this.prisma.purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: id },
            });

            updateData.items = {
                create: data.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    subtotal: item.quantity * item.unitCost,
                })),
            };
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: updateData,
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    /**
     * Marcar orden como enviada
     */
    async markAsSent(id: string) {
        const purchaseOrder = await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: PurchaseOrderStatus.SENT,
            },
            include: { supplier: true },
        });

        await this.notificationsService.createFromPurchaseOrder(purchaseOrder, 'SENT');

        return purchaseOrder;
    }

    /**
     * Recibir mercancía y actualizar inventario
     */
    async receiveOrder(
        id: string,
        receivedItems: Array<{
            itemId: string;
            receivedQty: number;
        }>,
    ) {
        const purchaseOrder = await this.findOne(id);

        if (!purchaseOrder) {
            throw new Error('Orden de compra no encontrada');
        }

        if (purchaseOrder.status === PurchaseOrderStatus.RECEIVED) {
            throw new Error('Esta orden ya fue recibida');
        }

        if (purchaseOrder.status === PurchaseOrderStatus.CANCELLED) {
            throw new Error('No se puede recibir una orden cancelada');
        }

        // Actualizar cada item y el inventario
        for (const receivedItem of receivedItems) {
            const item = purchaseOrder.items.find(
                (i) => i.id === receivedItem.itemId,
            );

            if (!item) {
                throw new Error(`Item ${receivedItem.itemId} no encontrado`);
            }

            // Actualizar cantidad recibida del item
            await this.prisma.purchaseOrderItem.update({
                where: { id: receivedItem.itemId },
                data: {
                    receivedQty: receivedItem.receivedQty,
                },
            });

            // Actualizar stock del producto
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (product) {
                const newStock = product.currentStock + receivedItem.receivedQty;

                await this.prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: newStock,
                    },
                });

                // Crear movimiento de stock
                await this.prisma.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'ENTRADA',
                        quantity: receivedItem.receivedQty,
                        previousStock: product.currentStock,
                        newStock,
                        reason: 'Recepción de orden de compra',
                        reference: purchaseOrder.orderNumber,
                        userId: 'system', // TODO: obtener del contexto de usuario
                    },
                });
            }
        }

        // Marcar orden como recibida
        const updatedOrder = await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: PurchaseOrderStatus.RECEIVED,
                receivedDate: new Date(),
            },
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                reorderAlerts: true,
            },
        });

        // Resolver alertas asociadas
        if (updatedOrder.reorderAlerts.length > 0) {
            await this.prisma.reorderAlert.updateMany({
                where: {
                    purchaseOrderId: id,
                },
                data: {
                    status: 'RESOLVED',
                    resolvedAt: new Date(),
                },
            });
        }

        await this.notificationsService.createFromPurchaseOrder(updatedOrder, 'RECEIVED');

        return updatedOrder;
    }

    /**
     * Cancelar una orden de compra
     */
    async cancel(id: string) {
        const purchaseOrder = await this.findOne(id);

        if (!purchaseOrder) {
            throw new Error('Orden de compra no encontrada');
        }

        if (purchaseOrder.status === PurchaseOrderStatus.RECEIVED) {
            throw new Error('No se puede cancelar una orden ya recibida');
        }

        // Actualizar alertas asociadas de vuelta a PENDING
        if (purchaseOrder.reorderAlerts.length > 0) {
            await this.prisma.reorderAlert.updateMany({
                where: {
                    purchaseOrderId: id,
                },
                data: {
                    status: 'PENDING',
                    purchaseOrderId: null,
                },
            });
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: PurchaseOrderStatus.CANCELLED,
            },
        });
    }

    /**
     * Generar número de orden único
     */
    private async generateOrderNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Contar órdenes del mes actual
        const count = await this.prisma.purchaseOrder.count({
            where: {
                orderNumber: {
                    startsWith: `OC-${year}${month}`,
                },
            },
        });

        const sequence = String(count + 1).padStart(4, '0');
        return `OC-${year}${month}-${sequence}`;
    }
}
