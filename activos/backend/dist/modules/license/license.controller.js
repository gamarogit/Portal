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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseController = void 0;
const common_1 = require("@nestjs/common");
const license_service_1 = require("./license.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("src/modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("src/modules/auth/guards/roles.guard");
const roles_decorator_1 = require("src/modules/auth/decorators/roles.decorator");
let LicenseController = class LicenseController {
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    search(dto) {
        return this.licenseService.search(dto);
    }
    getCompliance() {
        return this.licenseService.getComplianceReport();
    }
    findOne(id) {
        return this.licenseService.findOne(id);
    }
    create(dto) {
        return this.licenseService.create(dto);
    }
    update(id, dto) {
        return this.licenseService.update(id, dto);
    }
    remove(id) {
        return this.licenseService.remove(id);
    }
    assign(id, dto) {
        return this.licenseService.assignLicense(id, dto);
    }
    unassign(assignmentId) {
        return this.licenseService.unassignLicense(assignmentId);
    }
};
exports.LicenseController = LicenseController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SearchLicensesDto]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('compliance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "getCompliance", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, roles_decorator_1.Roles)('ADMIN', 'TI'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateLicenseDto]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, roles_decorator_1.Roles)('ADMIN', 'TI'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateLicenseDto]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, roles_decorator_1.Roles)('ADMIN', 'TI'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AssignLicenseDto]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)('assignments/:assignmentId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'TI'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LicenseController.prototype, "unassign", null);
exports.LicenseController = LicenseController = __decorate([
    (0, common_1.Controller)('licenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [license_service_1.LicenseService])
], LicenseController);
