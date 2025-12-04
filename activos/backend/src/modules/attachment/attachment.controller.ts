import { Controller, Get, Post, Body, Param, UseGuards, Delete, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto';
import { Response } from 'express';

// Type for multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('upload/:assetId')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('assetId') assetId: string,
    @UploadedFile() file: MulterFile,
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.attachmentService.upload(assetId, file, dto);
  }

  @Get('asset/:assetId')
  async findByAsset(@Param('assetId') assetId: string) {
    return this.attachmentService.findByAsset(assetId);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { stream, filename, mimeType } = await this.attachmentService.download(id);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    stream.pipe(res);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.attachmentService.remove(id);
  }
}
