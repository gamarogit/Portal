import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SearchAssetsDto } from './dto/search-assets.dto';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const assets = await this.prisma.asset.findMany({
      include: {
        assetType: true,
        location: true,
        responsible: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      state: asset.state,
      serialNumber: asset.serialNumber,
      cost: asset.cost ? Number(asset.cost) : null,
      operatingSystem: asset.operatingSystem,
      assetType: asset.assetType ? { name: asset.assetType.name } : undefined,
      location: asset.location ? { name: asset.location.name } : undefined,
      responsible: asset.responsible ? { name: asset.responsible.name } : undefined,
    }));
  }

  async search(dto: SearchAssetsDto) {
    const where: any = {};

    // Búsqueda de texto en nombre, serial, manufacturer, model
    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { serialNumber: { contains: dto.search, mode: 'insensitive' } },
        { manufacturer: { contains: dto.search, mode: 'insensitive' } },
        { model: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    // Filtro por estado
    if (dto.state) {
      where.state = dto.state;
    }

    // Filtro por ubicación
    if (dto.locationId) {
      where.locationId = dto.locationId;
    }

    // Filtro por tipo de activo
    if (dto.assetTypeId) {
      where.assetTypeId = dto.assetTypeId;
    }

    // Filtro por responsable
    if (dto.responsibleId) {
      where.responsibleId = dto.responsibleId;
    }

    // Filtro por rango de costo
    if (dto.minCost !== undefined || dto.maxCost !== undefined) {
      where.cost = {};
      if (dto.minCost !== undefined) {
        where.cost.gte = dto.minCost;
      }
      if (dto.maxCost !== undefined) {
        where.cost.lte = dto.maxCost;
      }
    }

    // Filtro por fecha de compra
    if (dto.purchasedAfter || dto.purchasedBefore) {
      where.purchaseDate = {};
      if (dto.purchasedAfter) {
        where.purchaseDate.gte = new Date(dto.purchasedAfter);
      }
      if (dto.purchasedBefore) {
        where.purchaseDate.lte = new Date(dto.purchasedBefore);
      }
    }

    // Filtro por garantía próxima a vencer
    if (dto.warrantyExpiringDays) {
      const now = new Date();
      const futureDate = new Date(now.getTime() + dto.warrantyExpiringDays * 24 * 60 * 60 * 1000);
      where.warrantyUntil = {
        gte: now,
        lte: futureDate,
      };
    }

    // Paginación
    const page = dto.page || 1;
    const limit = dto.limit || 50;
    const skip = (page - 1) * limit;

    // Ejecutar consulta con conteo total
    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          assetType: true,
          location: true,
          responsible: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        state: asset.state,
        serialNumber: asset.serialNumber,
        manufacturer: asset.manufacturer,
        model: asset.model,
        cost: asset.cost ? Number(asset.cost) : null,
        purchaseDate: asset.purchaseDate,
        warrantyUntil: asset.warrantyUntil,
        operatingSystem: asset.operatingSystem,
        assetType: asset.assetType ? { id: asset.assetType.id, name: asset.assetType.name } : undefined,
        location: asset.location ? { id: asset.location.id, name: asset.location.name } : undefined,
        responsible: asset.responsible ? { id: asset.responsible.id, name: asset.responsible.name } : undefined,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assetType: true,
        location: true,
        responsible: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Activo ${id} no encontrado`);
    }

    return {
      id: asset.id,
      name: asset.name,
      state: asset.state,
      serialNumber: asset.serialNumber,
      manufacturer: asset.manufacturer,
      model: asset.model,
      operatingSystem: asset.operatingSystem,
      cost: asset.cost ? Number(asset.cost) : null,
      purchaseDate: asset.purchaseDate,
      warrantyUntil: asset.warrantyUntil,
      notes: asset.notes,
      assetTypeId: asset.assetTypeId,
      locationId: asset.locationId,
      responsibleId: asset.responsibleId,
      assetType: asset.assetType ? { name: asset.assetType.name } : undefined,
      location: asset.location ? { name: asset.location.name } : undefined,
      responsible: asset.responsible ? { name: asset.responsible.name } : undefined,
    };
  }

  async create(dto: CreateAssetDto) {
    const assetTypeId = await this.resolveCatalog('assetType', dto.assetTypeId);
    const locationId = await this.resolveCatalog('location', dto.locationId);
    const responsibleId = await this.resolveCatalog('user', dto.responsibleId);

    try {
      const asset = await this.prisma.asset.create({
        data: {
          name: dto.name,
          assetTypeId,
          locationId,
          responsibleId,
          serialNumber: dto.serialNumber,
          manufacturer: dto.manufacturer,
          model: dto.model,
          operatingSystem: dto.operatingSystem,
          cost: dto.cost,
          purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
          warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil) : undefined,
          notes: dto.notes,
        },
        include: {
          assetType: true,
          location: true,
          responsible: true,
        },
      });

      return {
        id: asset.id,
        name: asset.name,
        state: asset.state,
        serialNumber: asset.serialNumber,
        manufacturer: asset.manufacturer,
        model: asset.model,
        operatingSystem: asset.operatingSystem,
        cost: asset.cost ? Number(asset.cost) : null,
        purchaseDate: asset.purchaseDate,
        warrantyUntil: asset.warrantyUntil,
        notes: asset.notes,
        assetType: asset.assetType ? { name: asset.assetType.name } : undefined,
        location: asset.location ? { name: asset.location.name } : undefined,
        responsible: asset.responsible ? { name: asset.responsible.name } : undefined,
      };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2003') {
        throw new BadRequestException(
          'Revisa que los IDs o nombres de tipo, ubicación y responsable existan en los catálogos.',
        );
      }
      throw error;
    }
  }

  private isUuid(value: string | null | undefined): boolean {
    return (
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    );
  }

  private async resolveCatalog(
    type: 'assetType' | 'location' | 'user',
    value: string | null | undefined,
  ): Promise<string | null> {
    if (!value) return null;

    // Si es un UUID, verifica que existe
    if (this.isUuid(value)) {
      const exists = await this.checkCatalogExists(type, value);
      if (exists) return value;
    }

    // Busca por nombre
    const found = await this.findCatalogByName(type, value);
    if (found) return found.id;

    // Crea el catálogo si no existe
    return await this.createCatalog(type, value);
  }

  private async checkCatalogExists(
    type: 'assetType' | 'location' | 'user',
    id: string,
  ): Promise<boolean> {
    const result = await (type === 'assetType'
      ? this.prisma.assetType.findUnique({ where: { id } })
      : type === 'location'
      ? this.prisma.location.findUnique({ where: { id } })
      : this.prisma.user.findUnique({ where: { id } }));

    return result !== null;
  }

  private async findCatalogByName(
    type: 'assetType' | 'location' | 'user',
    name: string,
  ): Promise<{ id: string } | null> {
    return (type === 'assetType'
      ? this.prisma.assetType.findUnique({ where: { name } })
      : type === 'location'
      ? this.prisma.location.findFirst({ where: { name } })
      : this.prisma.user.findFirst({ where: { name } })) as Promise<{ id: string } | null>;
  }

  private async createCatalog(
    type: 'assetType' | 'location' | 'user',
    name: string,
  ): Promise<string> {
    const created =
      type === 'assetType'
        ? await this.prisma.assetType.create({ data: { name } })
        : type === 'location'
        ? await this.prisma.location.create({ data: { name, type: 'general' } })
        : await this.prisma.user.create({ data: { name, email: `${name.toLowerCase().replace(/\s+/g, '.')}@temp.local` } });

    return created.id;
  }

  async update(id: string, dto: UpdateAssetDto) {
    // Verificar que el activo existe
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Activo ${id} no encontrado`);
    }

    // Resolver catálogos si se proporcionan
    const assetTypeId = dto.assetTypeId !== undefined
      ? await this.resolveCatalog('assetType', dto.assetTypeId)
      : undefined;
    const locationId = dto.locationId !== undefined
      ? await this.resolveCatalog('location', dto.locationId)
      : undefined;
    const responsibleId = dto.responsibleId !== undefined
      ? (dto.responsibleId === null ? null : await this.resolveCatalog('user', dto.responsibleId))
      : undefined;

    try {
      const asset = await this.prisma.asset.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(assetTypeId !== undefined && { assetTypeId }),
          ...(locationId !== undefined && { locationId }),
          ...(responsibleId !== undefined && { responsibleId }),
          ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
          ...(dto.manufacturer !== undefined && { manufacturer: dto.manufacturer }),
          ...(dto.model !== undefined && { model: dto.model }),
          ...(dto.operatingSystem !== undefined && { operatingSystem: dto.operatingSystem }),
          ...(dto.cost !== undefined && { cost: dto.cost }),
          ...(dto.purchaseDate !== undefined && { purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null }),
          ...(dto.warrantyUntil !== undefined && { warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil) : null }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.state !== undefined && { state: dto.state as any }),
        },
        include: {
          assetType: true,
          location: true,
          responsible: true,
        },
      });

      return {
        id: asset.id,
        name: asset.name,
        state: asset.state,
        serialNumber: asset.serialNumber,
        manufacturer: asset.manufacturer,
        model: asset.model,
        operatingSystem: asset.operatingSystem,
        cost: asset.cost ? Number(asset.cost) : null,
        purchaseDate: asset.purchaseDate,
        warrantyUntil: asset.warrantyUntil,
        notes: asset.notes,
        assetType: asset.assetType ? { name: asset.assetType.name } : undefined,
        location: asset.location ? { name: asset.location.name } : undefined,
        responsible: asset.responsible ? { name: asset.responsible.name } : undefined,
      };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2003') {
        throw new BadRequestException(
          'Revisa que los IDs o nombres de tipo, ubicación y responsable existan en los catálogos.',
        );
      }
      throw error;
    }
  }
}
