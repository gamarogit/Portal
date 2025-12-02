import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportBuilderService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, userId: string) {
    return this.prisma.customReport.create({
      data: {
        ...createReportDto,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.customReport.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.customReport.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    return this.prisma.customReport.update({
      where: { id },
      data: updateReportDto,
    });
  }

  async remove(id: string) {
    return this.prisma.customReport.delete({
      where: { id },
    });
  }
}
