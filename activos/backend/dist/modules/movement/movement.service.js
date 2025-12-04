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
exports.MovementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
const messaging_service_1 = require("src/shared/messaging/messaging.service");
const audit_service_1 = require("src/modules/audit/audit.service");
let MovementService = class MovementService {
    constructor(prisma, messaging, audit) {
        this.prisma = prisma;
        this.messaging = messaging;
        this.audit = audit;
    }
    findAll() {
        return this.prisma.movement.findMany({
            include: {
                asset: { include: { assetType: true, location: true } },
                fromLocation: true,
                toLocation: true,
                requestedBy: true,
                approvedBy: true,
            },
        });
    }
    create(data) {
        return this.prisma.$transaction(async (tx) => {
            const movement = await tx.movement.create({
                data: {
                    assetId: data.assetId,
                    movementType: data.movementType,
                    fromLocationId: data.fromLocationId,
                    toLocationId: data.toLocationId,
                    notes: data.notes,
                },
            });
            await this.audit.log({
                entity: 'Movement',
                entityId: movement.id,
                action: `Movimiento ${movement.movementType}`,
                changes: { movementType: movement.movementType, fromLocationId: movement.fromLocationId, toLocationId: movement.toLocationId },
                assetId: movement.assetId,
                performedById: movement.requestedById,
            });
            await this.messaging.publish('movement.created', movement);
            return movement;
        });
    }
};
exports.MovementService = MovementService;
exports.MovementService = MovementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messaging_service_1.MessagingService,
        audit_service_1.AuditService])
], MovementService);
