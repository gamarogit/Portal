import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttachmentDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

// Type for multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class AttachmentService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(private readonly prisma: PrismaService) {
    // Crear directorio de uploads si no existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(assetId: string, file: MulterFile, dto: CreateAttachmentDto) {
    // Validar que el activo existe
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Activo ${assetId} no encontrado`);
    }

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Archivo excede el tamaño máximo permitido (10MB)');
    }

    // Validar tipo MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }

    // Generar nombre único
    const timestamp = Date.now();
    const filename = `${assetId}_${timestamp}_${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    // Guardar archivo
    fs.writeFileSync(filepath, file.buffer);

    // Registrar en base de datos (si tienes modelo Attachment - necesitarías migración)
    // Por ahora retornar metadata
    const attachment = {
      id: `att_${timestamp}`,
      assetId,
      filename: file.originalname,
      storedFilename: filename,
      filepath,
      mimeType: file.mimetype,
      size: file.size,
      description: dto.description,
      uploadedAt: new Date(),
    };

    return {
      success: true,
      attachment,
      message: 'Archivo cargado exitosamente',
    };
  }

  async findByAsset(assetId: string) {
    // En producción esto vendría de una tabla Attachment
    const uploadPath = path.join(this.uploadDir);
    
    if (!fs.existsSync(uploadPath)) {
      return [];
    }

    const files = fs.readdirSync(uploadPath);
    const assetFiles = files.filter((f) => f.startsWith(assetId));

    return assetFiles.map((f) => {
      const stats = fs.statSync(path.join(uploadPath, f));
      return {
        id: f,
        filename: f,
        size: stats.size,
        uploadedAt: stats.birthtime,
      };
    });
  }

  async download(id: string) {
    const filepath = path.join(this.uploadDir, id);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const stats = fs.statSync(filepath);
    const stream = createReadStream(filepath);

    // Detectar MIME type
    let mimeType = 'application/octet-stream';
    if (id.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (id.match(/\.(jpg|jpeg)$/)) mimeType = 'image/jpeg';
    else if (id.endsWith('.png')) mimeType = 'image/png';

    return {
      stream,
      filename: id,
      mimeType,
      size: stats.size,
    };
  }

  async remove(id: string) {
    const filepath = path.join(this.uploadDir, id);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    fs.unlinkSync(filepath);

    return {
      success: true,
      message: 'Archivo eliminado exitosamente',
    };
  }
}
