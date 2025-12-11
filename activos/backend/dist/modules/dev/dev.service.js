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
exports.DevService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let DevService = class DevService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOperatingSystemColumn() {
        return { message: 'Column management is handled by Prisma migrations' };
    }
    async createAssetType(name) {
        const existing = await this.prisma.assetType.findUnique({ where: { name } });
        if (existing) {
            return existing;
        }
        return this.prisma.assetType.create({
            data: { name },
        });
    }
    async createLocation(name) {
        const existing = await this.prisma.location.findFirst({ where: { name } });
        if (existing) {
            return existing;
        }
        return this.prisma.location.create({
            data: {
                name,
                type: 'general',
            },
        });
    }
    async createUser(name) {
        const email = `${name.replace(/\s+/g, '').toLowerCase()}@local.dev`;
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return existing;
        }
        return this.prisma.user.create({
            data: {
                name,
                email,
            },
        });
    }
    async getAssetTypes() {
        return this.prisma.assetType.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getLocations() {
        return this.prisma.location.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getUsers() {
        return this.prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }
};
exports.DevService = DevService;
exports.DevService = DevService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevService);
