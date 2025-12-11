import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PortalSystem } from '@prisma/client';

@Injectable()
export class PortalService {
  private publicHost: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.publicHost = this.configService.get<string>('PUBLIC_HOST') || 'http://localhost';
    console.log('📢 [PortalService] PUBLIC_HOST a usar:', this.publicHost);
  }

  private transformSystemUrls(system: PortalSystem): PortalSystem {
    const transform = (url: string | null): string | null => {
      if (!url || !url.startsWith('http')) {
        return url;
      }
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === 'localhost') {
          const publicUrl = new URL(this.publicHost);
          parsedUrl.hostname = publicUrl.hostname;
        }
        return parsedUrl.toString();
      } catch {
        return url; // Devuelve la URL original si es inválida
      }
    };

    return {
      ...system,
      route: transform(system.route) || system.route,
      apiUrl: transform(system.apiUrl),
    };
  }

  async getAllSystems() {
    const systems = await this.prisma.portalSystem.findMany({
      orderBy: { order: 'asc' },
    });

    return { systems: systems.map(this.transformSystemUrls.bind(this)) };
  }

  async getEnabledSystems() {
    const systems = await this.prisma.portalSystem.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });

    return { systems: systems.map(this.transformSystemUrls.bind(this)) };
  }

  async getSystemsForUser(userId: string) {
    // Obtener el usuario con su rol
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    // Si es ADMIN, devolver todos los sistemas habilitados
    if (user?.role?.name === 'ADMIN') {
      return this.getEnabledSystems();
    }

    // Obtener permisos de sistemas del usuario
    const systemPermissions = await this.prisma.systemPermission.findMany({
      where: { userId, canAccess: true },
      include: { system: true },
    });

    // Filtrar solo sistemas habilitados
    const allowedSystems = systemPermissions
      .map(p => p.system)
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);

    return { systems: allowedSystems.map(this.transformSystemUrls.bind(this)) };
  }

  async getSystemById(id: string) {
    return this.prisma.portalSystem.findUnique({
      where: { id },
    });
  }

  async createSystem(data: {
    name: string;
    description: string;
    icon: string;
    route: string;
    color: string;
    enabled?: boolean;
    order?: number;
  }) {
    return this.prisma.portalSystem.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        route: data.route,
        color: data.color,
        enabled: data.enabled ?? true,
        order: data.order ?? 0,
      },
    });
  }

  async updateSystem(
    id: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      route?: string;
      color?: string;
      enabled?: boolean;
      order?: number;
    },
  ) {
    return this.prisma.portalSystem.update({
      where: { id },
      data,
    });
  }

  async deleteSystem(id: string) {
    return this.prisma.portalSystem.delete({
      where: { id },
    });
  }

  async reorderSystems(systemIds: string[]) {
    // Actualizar el orden de cada sistema
    const updates = systemIds.map((id, index) =>
      this.prisma.portalSystem.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return { success: true, message: 'Sistemas reordenados correctamente' };
  }

  async seedDefaultSystems() {
    // Verificar si ya existen sistemas
    const count = await this.prisma.portalSystem.count();
    if (count > 0) {
      return { message: 'Ya existen sistemas configurados' };
    }

    // Crear sistemas por defecto
    const defaultSystems = [
      {
        name: 'Gestión de Activos',
        description: 'Sistema de inventario y control de activos TI',
        icon: '💼',
        route: 'http://localhost:3101',
        color: '#667eea',
        enabled: true,
        order: 1,
      },
      {
        name: 'Usuarios y Roles',
        description: 'Administración de usuarios y permisos del sistema',
        icon: '👥',
        route: '/users',
        color: '#f093fb',
        enabled: true,
        order: 2,
      },
      {
        name: 'Reportes',
        description: 'Generación y visualización de reportes',
        icon: '📊',
        route: '/reports',
        color: '#4facfe',
        enabled: true,
        order: 3,
      },
      {
        name: 'Mantenimiento',
        description: 'Programación y seguimiento de mantenimientos',
        icon: '🔧',
        route: '/maintenance',
        color: '#43e97b',
        enabled: true,
        order: 4,
      },
      {
        name: 'Licencias',
        description: 'Control y gestión de licencias de software',
        icon: '📜',
        route: '/licenses',
        color: '#fa709a',
        enabled: true,
        order: 5,
      },
      {
        name: 'Configuración',
        description: 'Configuración general del sistema',
        icon: '⚙️',
        route: '/configuration',
        color: '#a8edea',
        enabled: true,
        order: 6,
      },
    ];

    for (const system of defaultSystems) {
      await this.prisma.portalSystem.create({
        data: system,
      });
    }

    return {
      success: true,
      message: `${defaultSystems.length} sistemas creados correctamente`,
      count: defaultSystems.length
    };
  }
  async getTheme() {
    const theme = await this.prisma.themeConfig.findFirst({
      where: { isActive: true },
    });

    if (!theme) {
      // Crear tema por defecto si no existe
      return this.prisma.themeConfig.create({
        data: {
          primaryColor: '#003b4d',
          secondaryColor: '#00afaa',
          accentColor: '#d9c79e',
          backgroundColor: '#f0f2f5',
          isActive: true,
        },
      });
    }

    return theme;
  }

  async updateTheme(data: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    logoUrl?: string;
    portalName?: string;
  }) {
    const theme = await this.getTheme();

    return this.prisma.themeConfig.update({
      where: { id: theme.id },
      data,
    });
  }
}
