import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) { }

  /**
   * Obtener todos los sistemas (admin)
   */
  @Get('systems/all')
  @UseGuards(JwtAuthGuard)
  async getAllSystems() {
    return this.portalService.getAllSystems();
  }

  /**
   * Obtener sistemas habilitados filtrados por permisos del usuario
   */
  @Get('systems')
  @UseGuards(JwtAuthGuard)
  async getEnabledSystems(@Request() req) {
    return this.portalService.getSystemsForUser(req.user.id);
  }

  /**
   * Obtener un sistema por ID
   */
  @Get('systems/:id')
  @UseGuards(JwtAuthGuard)
  async getSystemById(@Param('id') id: string) {
    return this.portalService.getSystemById(id);
  }

  /**
   * Crear un nuevo sistema
   */
  @Post('systems')
  @UseGuards(JwtAuthGuard)
  async createSystem(
    @Body()
    body: {
      name: string;
      description: string;
      icon: string;
      route: string;
      color: string;
      enabled?: boolean;
      order?: number;
    },
  ) {
    return this.portalService.createSystem(body);
  }

  /**
   * Actualizar un sistema
   */
  @Put('systems/:id')
  @UseGuards(JwtAuthGuard)
  async updateSystem(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      icon?: string;
      route?: string;
      color?: string;
      enabled?: boolean;
      order?: number;
    },
  ) {
    return this.portalService.updateSystem(id, body);
  }

  /**
   * Eliminar un sistema
   */
  @Delete('systems/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSystem(@Param('id') id: string) {
    return this.portalService.deleteSystem(id);
  }

  /**
   * Reordenar sistemas
   */
  @Post('systems/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderSystems(@Body() body: { systemIds: string[] }) {
    return this.portalService.reorderSystems(body.systemIds);
  }

  /**
   * Seed: Crear sistemas por defecto
   */
  @Post('systems/seed')
  @UseGuards(JwtAuthGuard)
  async seedDefaultSystems() {
    return this.portalService.seedDefaultSystems();
  }
  /**
   * Obtener configuración de tema
   */
  @Get('theme')
  async getTheme() {
    return this.portalService.getTheme();
  }

  /**
   * Actualizar configuración de tema
   */
  @Put('theme')
  @UseGuards(JwtAuthGuard)
  async updateTheme(
    @Body()
    body: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      backgroundColor?: string;
      logoUrl?: string;
      portalName?: string;
    },
  ) {
    return this.portalService.updateTheme(body);
  }

  /**
   * Subir logo del portal
   */
  @Post('upload/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    // Construir URL pública
    // Nota: En producción, esto debería usar la URL base configurada
    const protocol = process.env.PUBLIC_PROTOCOL || 'http';
    const host = process.env.PUBLIC_HOST || 'localhost:3000';
    const fileUrl = `${protocol}://${host}/public/uploads/${file.filename}`;

    return {
      url: fileUrl,
      filename: file.filename,
    };
  }
}
