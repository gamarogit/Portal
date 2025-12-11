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
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
const messaging_service_1 = require("src/shared/messaging/messaging.service");
const metrics_service_1 = require("../metrics/metrics.service");
let IntegrationService = class IntegrationService {
    constructor(prisma, messaging, metrics) {
        this.prisma = prisma;
        this.messaging = messaging;
        this.metrics = metrics;
    }
    async emit(event) {
        const record = await this.prisma.integrationEvent.create({
            data: {
                source: event.source,
                payload: event.payload,
            },
        });
        this.metrics.incrementEmitted();
        await this.messaging.publish('integration.event', { eventId: record.id, source: record.source });
        return record;
    }
    async dispatchPending(limit = 10) {
        const pending = await this.prisma.integrationEvent.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        const start = Date.now();
        await Promise.all(pending.map((item) => this.tryDispatch(item)));
        this.metrics.observeDispatchDuration(Date.now() - start);
        return pending;
    }
    async list(status) {
        return this.prisma.integrationEvent.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }
    async tryDispatch(event) {
        const targets = this.getTargetEndpoints();
        if (!targets.length) {
            await this.markAsSuccess(event.id);
            return;
        }
        let success = false;
        const body = JSON.stringify({ source: event.source, payload: event.payload });
        for (const target of targets) {
            try {
                await fetch(target, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body,
                });
                success = true;
            }
            catch (error) {
            }
        }
        await this.prisma.integrationEvent.update({
            where: { id: event.id },
            data: {
                status: success ? 'SENT' : 'FAILED',
                lastAttemptedAt: new Date(),
            },
        });
        if (success) {
            this.metrics.incrementSent();
        }
        else {
            this.metrics.incrementFailed();
        }
    }
    async markAsSuccess(id) {
        await this.prisma.integrationEvent.update({
            where: { id },
            data: { status: 'SENT', lastAttemptedAt: new Date() },
        });
    }
    getTargetEndpoints() {
        const candidates = [
            process.env.ERP_ENDPOINT,
            process.env.CMDB_ENDPOINT,
        ];
        return candidates.filter(Boolean);
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messaging_service_1.MessagingService,
        metrics_service_1.MetricsService])
], IntegrationService);
