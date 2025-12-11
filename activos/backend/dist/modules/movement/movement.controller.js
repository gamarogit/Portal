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
exports.MovementController = void 0;
const common_1 = require("@nestjs/common");
const movement_service_1 = require("./movement.service");
const create_movement_dto_1 = require("./dto/create-movement.dto");
const jwt_auth_guard_1 = require("src/modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("src/modules/auth/guards/roles.guard");
const roles_decorator_1 = require("src/modules/auth/decorators/roles.decorator");
let MovementController = class MovementController {
    constructor(movementService) {
        this.movementService = movementService;
    }
    list() {
        return this.movementService.findAll();
    }
    create(dto) {
        return this.movementService.create(dto);
    }
};
exports.MovementController = MovementController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, roles_decorator_1.Roles)('ADMIN', 'TI'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_movement_dto_1.CreateMovementDto]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "create", null);
exports.MovementController = MovementController = __decorate([
    (0, common_1.Controller)('movements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [movement_service_1.MovementService])
], MovementController);
