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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
const messaging_service_1 = require("src/shared/messaging/messaging.service");
const audit_service_1 = require("src/modules/audit/audit.service");
let MaintenanceService = class MaintenanceService {
    constructor(prisma, messaging, audit) {
        this.prisma = prisma;
        this.messaging = messaging;
        this.audit = audit;
    }
    findAll() {
        return this.prisma.maintenance.findMany({
            include: {
                asset: { include: { assetType: true, location: true } },
                performedBy: true,
            },
        });
    }
    async create(dto) {
        const maintenance = await this.prisma.maintenance.create({
            data: {
                assetId: dto.assetId,
                scheduledAt: new Date(dto.scheduledAt),
                performedById: dto.performedById,
                notes: dto.notes,
            },
        });
        await this.audit.log({
            entity: 'Maintenance',
            entityId: maintenance.id,
            action: `Mantenimiento ${maintenance.status}`,
            changes: { scheduledAt: maintenance.scheduledAt },
            assetId: maintenance.assetId,
            performedById: maintenance.performedById,
        });
        await this.messaging.publish('maintenance.created', maintenance);
        return maintenance;
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messaging_service_1.MessagingService,
        audit_service_1.AuditService])
], MaintenanceService);
