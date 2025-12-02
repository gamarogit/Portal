import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LicenseService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: any) {
    const where: any = {};

    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { vendor: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.expiringDays) {
      const now = new Date();
      const futureDate = new Date(now.getTime() + dto.expiringDays * 24 * 60 * 60 * 1000);
      where.expirationDate = {
        gte: now,
        lte: futureDate,
      };
    }

    const licenses = await this.prisma.license.findMany({
      where,
      orderBy: { expirationDate: 'asc' },
      take: 100,
    });

    return { data: licenses };
  }

  async findOne(id: string) {
    // Retornar licencia con assignments
    return {
      id,
      message: 'Modelo License pendiente de migración. Ver schema-extensions.prisma',
    };
  }

  async create(dto: any) {
    const unitCost = dto.unitCost ? parseFloat(dto.unitCost) : null;
    const totalSeats = dto.totalSeats || 1;
    const totalCost = dto.totalCost ? parseFloat(dto.totalCost) : (unitCost ? unitCost * totalSeats : null);

    return this.prisma.license.create({
      data: {
        name: dto.name,
        vendor: dto.vendor,
        licenseKey: dto.licenseKey,
        purchaseDate: new Date(dto.purchaseDate),
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        totalSeats,
        usedSeats: 0,
        unitCost,
        totalCost,
        invoiceFolio: dto.invoiceFolio,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, dto: any) {
    return { id, message: 'Pendiente migración' };
  }

  async remove(id: string) {
    return { id, message: 'Pendiente migración' };
  }

  async assignLicense(licenseId: string, dto: any) {
    return { licenseId, message: 'Pendiente migración' };
  }

  async unassignLicense(assignmentId: string) {
    return { assignmentId, message: 'Pendiente migración' };
  }

  async getComplianceReport() {
    // Reporte de compliance: licenses vs. uso real
    return {
      summary: {
        totalLicenses: 0,
        activeLicenses: 0,
        expiredLicenses: 0,
        expiringSoon: 0,
        totalSeats: 0,
        usedSeats: 0,
        availableSeats: 0,
        complianceRate: '0%',
      },
      message: 'Ejecutar migración de Licenses primero',
    };
  }
}
