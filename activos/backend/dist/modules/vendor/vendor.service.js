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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let VendorService = class VendorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return {
            message: 'VendorService: Requiere ejecutar migración Prisma',
            command: 'cd backend && npx prisma migrate dev --name add_vendors',
            vendors: [],
        };
    }
    async findOne(id) {
        throw new common_1.NotFoundException('VendorService: Requiere migración de base de datos');
    }
    async create(dto) {
        return {
            message: 'VendorService: Requiere migración de base de datos',
            data: dto,
        };
    }
    async update(id, dto) {
        return {
            message: 'VendorService: Requiere migración de base de datos',
            id,
            data: dto,
        };
    }
    async remove(id) {
        return {
            message: 'VendorService: Requiere migración de base de datos',
            id,
        };
    }
    async getVendorAssets(vendorId) {
        return {
            message: 'VendorService: Requiere migración de base de datos',
            vendorId,
            assets: [],
        };
    }
    async getPerformanceMetrics(vendorId) {
        return {
            message: 'VendorService: Requiere migración de base de datos',
            vendorId,
            metrics: {
                totalAssets: 0,
                activeContracts: 0,
                averageResponseTime: 0,
                rating: 0,
            },
        };
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorService);
