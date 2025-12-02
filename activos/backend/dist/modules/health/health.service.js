"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async checkDatabase() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
    getMemoryUsage() {
        const memory = process.memoryUsage();
        return {
            heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthService);
