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
var IntegrationScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationScheduler = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
let IntegrationScheduler = IntegrationScheduler_1 = class IntegrationScheduler {
    constructor(integration) {
        this.integration = integration;
        this.logger = new common_1.Logger(IntegrationScheduler_1.name);
    }
    async onModuleInit() {
        this.interval = setInterval(() => this.runCycle(), 60000);
        await this.runCycle();
    }
    async onModuleDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    async runCycle() {
        const events = await this.integration.dispatchPending(20);
        if (events.length) {
            this.logger.log(`Despachados ${events.length} eventos de integración`);
        }
    }
};
exports.IntegrationScheduler = IntegrationScheduler;
exports.IntegrationScheduler = IntegrationScheduler = IntegrationScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationScheduler);
