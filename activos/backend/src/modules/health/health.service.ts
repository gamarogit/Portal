import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const dbHealthy = await this.checkDatabase();
    const uptime = process.uptime();
    
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime)}s`,
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        database: dbHealthy ? 'ok' : 'failed',
        memory: this.getMemoryUsage(),
      },
    };
  }

  async readiness() {
    const dbHealthy = await this.checkDatabase();
    
    if (!dbHealthy) {
      return {
        status: 'not ready',
        message: 'Database connection failed',
      };
    }

    return {
      status: 'ready',
      message: 'Service is ready to accept traffic',
    };
  }

  liveness() {
    const memory = process.memoryUsage();
    const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
    
    // Considera unhealthy si usa más de 1GB de heap
    if (heapUsedMB > 1024) {
      return {
        status: 'unhealthy',
        message: 'Memory usage too high',
        heapUsedMB,
      };
    }

    return {
      status: 'alive',
      message: 'Service is running',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private getMemoryUsage() {
    const memory = process.memoryUsage();
    return {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
    };
  }
}
