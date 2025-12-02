import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DevService {
  constructor(private readonly prisma: PrismaService) {}

  async createOperatingSystemColumn() {
    // Esta funcionalidad ya no es necesaria con Prisma ya que las migraciones
    // manejan los cambios de schema. Mantenemos el método por compatibilidad.
    return { message: 'Column management is handled by Prisma migrations' };
  }

  async createAssetType(name: string) {
    const existing = await this.prisma.assetType.findUnique({ where: { name } });
    if (existing) {
      return existing;
    }
    return this.prisma.assetType.create({
      data: { name },
    });
  }

  async createLocation(name: string) {
    const existing = await this.prisma.location.findFirst({ where: { name } });
    if (existing) {
      return existing;
    }
    return this.prisma.location.create({
      data: {
        name,
        type: 'general',
      },
    });
  }

  async createUser(name: string) {
    const email = `${name.replace(/\s+/g, '').toLowerCase()}@local.dev`;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return existing;
    }
    return this.prisma.user.create({
      data: {
        name,
        email,
      },
    });
  }

  async getAssetTypes() {
    return this.prisma.assetType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getLocations() {
    return this.prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
