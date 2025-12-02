import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportBuilderService } from './report-builder.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('report-builder')
@UseGuards(JwtAuthGuard)
export class ReportBuilderController {
  constructor(private readonly reportBuilderService: ReportBuilderService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportBuilderService.create(createReportDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.reportBuilderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportBuilderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportBuilderService.update(id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportBuilderService.remove(id);
  }
}
