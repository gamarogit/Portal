import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type AuditParams = {
  entity: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
  performedById?: string;
  assetId?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditParams) {
    return this.prisma.auditLog.create({
      data: params as Prisma.AuditLogUncheckedCreateInput,
    });
  }

  listByAsset(assetId: string) {
    return this.prisma.auditLog.findMany({
      where: { assetId },
      orderBy: { occurredAt: 'desc' },
    });
  }
}
