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
exports.DevController = void 0;
const common_1 = require("@nestjs/common");
const dev_service_1 = require("./dev.service");
let DevController = class DevController {
    constructor(dev) {
        this.dev = dev;
    }
    async addOperatingSystemColumn() {
        await this.dev.createOperatingSystemColumn();
        return { status: 'ok', message: 'Columna operatingSystem creada (si no existía)' };
    }
    createAssetType(payload) {
        return this.dev.createAssetType(payload.name);
    }
    createLocation(payload) {
        return this.dev.createLocation(payload.name);
    }
    createUser(payload) {
        return this.dev.createUser(payload.name);
    }
    getAssetTypes() {
        return this.dev.getAssetTypes();
    }
    getLocations() {
        return this.dev.getLocations();
    }
    getUsers() {
        return this.dev.getUsers();
    }
};
exports.DevController = DevController;
__decorate([
    (0, common_1.Get)('add-os'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevController.prototype, "addOperatingSystemColumn", null);
__decorate([
    (0, common_1.Post)('asset-type'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevController.prototype, "createAssetType", null);
__decorate([
    (0, common_1.Post)('location'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Post)('user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('asset-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevController.prototype, "getAssetTypes", null);
__decorate([
    (0, common_1.Get)('locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevController.prototype, "getUsers", null);
exports.DevController = DevController = __decorate([
    (0, common_1.Controller)('dev'),
    __metadata("design:paramtypes", [dev_service_1.DevService])
], DevController);
