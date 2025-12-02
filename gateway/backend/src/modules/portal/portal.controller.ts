import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * Obtener todos los sistemas (admin)
   */
  @Get('systems/all')
  @UseGuards(JwtAuthGuard)
  async getAllSystems() {
    return this.portalService.getAllSystems();
  }

  /**
   * Obtener sistemas habilitados (usuarios)
   */
  @Get('systems')
  @UseGuards(JwtAuthGuard)
  async getEnabledSystems() {
    return this.portalService.getEnabledSystems();
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
}
