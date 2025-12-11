import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepreciationDto } from './dto/create-depreciation.dto';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class DepreciationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateDepreciationDto, recordedById?: string) {
    const record = await this.prisma.depreciation.create({
      data: {
        assetId: dto.assetId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        amount: dto.amount,
        method: dto.method,
        recordedById,
      },
    });
    await this.audit.log({
      entity: 'Depreciation',
      entityId: record.id,
      action: `Depreciación ${record.method}`,
      changes: { amount: record.amount, periodStart: record.periodStart, periodEnd: record.periodEnd },
      assetId: record.assetId,
      performedById: recordedById,
    });
    return record;
  }

  findByAsset(assetId: string) {
    return this.prisma.depreciation.findMany({
      where: { assetId },
      orderBy: { periodStart: 'desc' },
    });
  }
}
