import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
    constructor(private readonly prisma: PrismaService) { }

    // Obtener permisos de un usuario
    async getUserPermissions(userId: string) {
        const [systemPermissions, featurePermissions] = await Promise.all([
            this.prisma.systemPermission.findMany({
                where: { userId },
                include: { system: true },
            }),
            this.prisma.featurePermission.findMany({
                where: { userId },
                include: {
                    feature: {
                        include: { system: true },
                    },
                },
            }),
        ]);

        return {
            systems: systemPermissions,
            features: featurePermissions,
        };
    }

    // Actualizar permisos de sistemas de un usuario
    async updateSystemPermissions(
        userId: string,
        permissions: { systemId: string; canAccess: boolean }[],
    ) {
        // Eliminar permisos existentes
        await this.prisma.systemPermission.deleteMany({
            where: { userId },
        });

        // Crear nuevos permisos
        if (permissions.length > 0) {
            await this.prisma.systemPermission.createMany({
                data: permissions.map((p) => ({
                    userId,
                    systemId: p.systemId,
                    canAccess: p.canAccess,
                })),
            });
        }

        return this.getUserPermissions(userId);
    }

    // Actualizar permisos de funcionalidades de un usuario
    async updateFeaturePermissions(
        userId: string,
        permissions: { featureId: string; granted: boolean }[],
    ) {
        // Eliminar permisos existentes
        await this.prisma.featurePermission.deleteMany({
            where: { userId },
        });

        // Crear nuevos permisos
        if (permissions.length > 0) {
            await this.prisma.featurePermission.createMany({
                data: permissions.map((p) => ({
                    userId,
                    featureId: p.featureId,
                    granted: p.granted,
                })),
            });
        }

        return this.getUserPermissions(userId);
    }

    // Obtener funcionalidades de un sistema
    async getSystemFeatures(systemId: string) {
        return this.prisma.systemFeature.findMany({
            where: { systemId },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }

    // Obtener todas las funcionalidades agrupadas por sistema
    async getAllFeatures() {
        const systems = await this.prisma.portalSystem.findMany({
            where: { enabled: true },
            include: {
                features: {
                    orderBy: [{ category: 'asc' }, { name: 'asc' }],
                },
            },
            orderBy: { order: 'asc' },
        });

        return systems;
    }

    // Crear una nueva funcionalidad
    async createFeature(data: {
        systemId: string;
        key: string;
        name: string;
        description?: string;
        category?: string;
    }) {
        return this.prisma.systemFeature.create({
            data,
        });
    }

    // Verificar si un usuario tiene un permiso específico
    async hasPermission(userId: string, featureKey: string): Promise<boolean> {
        // Los administradores tienen todos los permisos
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (user?.role?.name === 'ADMIN') {
            return true;
        }

        // Buscar la funcionalidad por key
        const feature = await this.prisma.systemFeature.findFirst({
            where: { key: featureKey },
        });

        if (!feature) {
            return false;
        }

        // Verificar si el usuario tiene el permiso
        const permission = await this.prisma.featurePermission.findUnique({
            where: {
                userId_featureId: {
                    userId,
                    featureId: feature.id,
                },
            },
        });

        return permission?.granted ?? false;
    }

    // Verificar si un usuario tiene acceso a un sistema
    async hasSystemAccess(userId: string, systemId: string): Promise<boolean> {
        // Los administradores tienen acceso a todos los sistemas
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (user?.role?.name === 'ADMIN') {
            return true;
        }

        // Verificar si el usuario tiene permiso explícito
        const permission = await this.prisma.systemPermission.findUnique({
            where: {
                userId_systemId: {
                    userId,
                    systemId,
                },
            },
        });

        return permission?.canAccess ?? false;
    }
}
