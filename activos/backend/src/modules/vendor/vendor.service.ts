import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto } from './dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // NOTA: Requiere migración de schema-extensions.prisma
    return {
      message: 'VendorService: Requiere ejecutar migración Prisma',
      command: 'cd backend && npx prisma migrate dev --name add_vendors',
      vendors: [],
    };
  }

  async findOne(id: string) {
    throw new NotFoundException('VendorService: Requiere migración de base de datos');
  }

  async create(dto: CreateVendorDto) {
    return {
      message: 'VendorService: Requiere migración de base de datos',
      data: dto,
    };
  }

  async update(id: string, dto: UpdateVendorDto) {
    return {
      message: 'VendorService: Requiere migración de base de datos',
      id,
      data: dto,
    };
  }

  async remove(id: string) {
    return {
      message: 'VendorService: Requiere migración de base de datos',
      id,
    };
  }

  async getVendorAssets(vendorId: string) {
    // Una vez migrado, buscar activos con vendor_id
    return {
      message: 'VendorService: Requiere migración de base de datos',
      vendorId,
      assets: [],
    };
  }

  async getPerformanceMetrics(vendorId: string) {
    return {
      message: 'VendorService: Requiere migración de base de datos',
      vendorId,
      metrics: {
        totalAssets: 0,
        activeContracts: 0,
        averageResponseTime: 0,
        rating: 0,
      },
    };
  }
}
