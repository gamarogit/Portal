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
exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let LicenseService = class LicenseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(dto) {
        const where = {};
        if (dto.search) {
            where.OR = [
                { name: { contains: dto.search, mode: 'insensitive' } },
                { vendor: { contains: dto.search, mode: 'insensitive' } },
            ];
        }
        if (dto.status) {
            where.status = dto.status;
        }
        if (dto.expiringDays) {
            const now = new Date();
            const futureDate = new Date(now.getTime() + dto.expiringDays * 24 * 60 * 60 * 1000);
            where.expirationDate = {
                gte: now,
                lte: futureDate,
            };
        }
        const licenses = await this.prisma.$queryRaw `
      SELECT 
        id, name, vendor, "purchaseDate", "expirationDate",
        "totalSeats", "usedSeats", cost, status
      FROM "License"
      WHERE 1=1
      ORDER BY "expirationDate" ASC NULLS LAST
      LIMIT 100
    `;
        return {
            data: licenses,
            message: 'Nota: El modelo License no está en el schema actual. Ejecutar migración primero.',
        };
    }
    async findOne(id) {
        return {
            id,
            message: 'Modelo License pendiente de migración. Ver schema-extensions.prisma',
        };
    }
    async create(dto) {
        return {
            message: 'Modelo License pendiente de migración. Ejecutar: npx prisma migrate dev --name add_licenses',
        };
    }
    async update(id, dto) {
        return { id, message: 'Pendiente migración' };
    }
    async remove(id) {
        return { id, message: 'Pendiente migración' };
    }
    async assignLicense(licenseId, dto) {
        return { licenseId, message: 'Pendiente migración' };
    }
    async unassignLicense(assignmentId) {
        return { assignmentId, message: 'Pendiente migración' };
    }
    async getComplianceReport() {
        return {
            summary: {
                totalLicenses: 0,
                activeLicenses: 0,
                expiredLicenses: 0,
                expiringSoon: 0,
                totalSeats: 0,
                usedSeats: 0,
                availableSeats: 0,
                complianceRate: '0%',
            },
            message: 'Ejecutar migración de Licenses primero',
        };
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LicenseService);
