import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {}

  /**
   * Busca el sistema por ruta y proxy la petición
   */
  async proxyRequest(
    systemRoute: string,
    method: string,
    path: string,
    body?: any,
    headers?: any,
  ) {
    // Buscar sistema en la base de datos
    const system = await this.prisma.portalSystem.findFirst({
      where: {
        route: {
          contains: systemRoute,
        },
        enabled: true,
      },
    });

    if (!system || !system.apiUrl) {
      throw new BadGatewayException(`Sistema ${systemRoute} no encontrado o sin API configurada`);
    }

    // Construir URL completa
    const targetUrl = `${system.apiUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          data: body,
          headers: {
            ...headers,
            // Remover headers del proxy que no deben reenviarse
            host: undefined,
            connection: undefined,
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error(`Error proxying to ${targetUrl}:`, error.message);
      throw new BadGatewayException(`Error al comunicarse con ${system.name}`);
    }
  }

  /**
   * Health check de todos los sistemas
   */
  async checkSystemsHealth() {
    const systems = await this.prisma.portalSystem.findMany({
      where: { enabled: true },
    });

    const healthChecks = await Promise.allSettled(
      systems.map(async (system) => {
        if (!system.apiUrl) {
          return {
            system: system.name,
            status: 'unknown',
            message: 'No API URL configured',
          };
        }

        try {
          const response = await firstValueFrom(
            this.httpService.get(`${system.apiUrl}/health`, {
              timeout: 3000,
            }),
          );

          return {
            system: system.name,
            status: 'healthy',
            data: response.data,
          };
        } catch (error) {
          return {
            system: system.name,
            status: 'unhealthy',
            message: error.message,
          };
        }
      }),
    );

    return healthChecks.map((result, index) => ({
      system: systems[index].name,
      ...(result.status === 'fulfilled' ? result.value : { status: 'error', message: result.reason }),
    }));
  }
}
