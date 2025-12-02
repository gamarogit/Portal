import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  inventoryByState() {
    return this.prisma.asset.groupBy({
      by: ['state'],
      _count: {
        state: true,
      },
    });
  }

  depreciationByMethod() {
    return this.prisma.depreciation.groupBy({
      by: ['method'],
      _sum: {
        amount: true,
      },
    });
  }
}
