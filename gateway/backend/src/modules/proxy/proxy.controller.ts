import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  /**
   * Health check de todos los sistemas
   */
  @Get('health')
  @UseGuards(JwtAuthGuard)
  async checkHealth() {
    return this.proxyService.checkSystemsHealth();
  }

  /**
   * Proxy genérico a microservicios
   * Ejemplo: /proxy/activos/api/assets -> http://localhost:3001/api/assets
   */
  @All(':system/*')
  @UseGuards(JwtAuthGuard)
  async proxyToSystem(
    @Param('system') system: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extraer path después de /proxy/:system
    const path = req.url.replace(`/api/proxy/${system}`, '');
    
    try {
      const result = await this.proxyService.proxyRequest(
        system,
        req.method,
        path,
        req.body,
        req.headers,
      );

      return res.json(result);
    } catch (error) {
      return res.status(error.status || 502).json({
        statusCode: error.status || 502,
        message: error.message || 'Error al comunicarse con el sistema',
      });
    }
  }
}
