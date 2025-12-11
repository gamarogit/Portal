"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("src/prisma/prisma.module");
const messaging_module_1 = require("src/shared/messaging/messaging.module");
const audit_module_1 = require("src/modules/audit/audit.module");
const movement_controller_1 = require("./movement.controller");
const movement_service_1 = require("./movement.service");
let MovementModule = class MovementModule {
};
exports.MovementModule = MovementModule;
exports.MovementModule = MovementModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, messaging_module_1.MessagingModule, audit_module_1.AuditModule],
        controllers: [movement_controller_1.MovementController],
        providers: [movement_service_1.MovementService],
    })
], MovementModule);
