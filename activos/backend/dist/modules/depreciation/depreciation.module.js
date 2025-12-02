"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepreciationModule = void 0;
const common_1 = require("@nestjs/common");
const depreciation_service_1 = require("./depreciation.service");
const depreciation_controller_1 = require("./depreciation.controller");
const prisma_module_1 = require("src/prisma/prisma.module");
const audit_module_1 = require("../audit/audit.module");
let DepreciationModule = class DepreciationModule {
};
exports.DepreciationModule = DepreciationModule;
exports.DepreciationModule = DepreciationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, audit_module_1.AuditModule],
        providers: [depreciation_service_1.DepreciationService],
        controllers: [depreciation_controller_1.DepreciationController],
    })
], DepreciationModule);
