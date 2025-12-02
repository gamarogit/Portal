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
exports.UpdateAssetDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateAssetDto {
}
exports.UpdateAssetDto = UpdateAssetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'El nombre no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'assetTypeId debe ser un UUID válido' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "assetTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'locationId debe ser un UUID válido' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'responsibleId debe ser un UUID válido' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "responsibleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'El número de serie no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'El fabricante no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "manufacturer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'El modelo no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'El sistema operativo no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "operatingSystem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El costo debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'El costo debe ser mayor a cero' }),
    (0, class_validator_1.Min)(0.01, { message: 'El costo mínimo es 0.01' }),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de compra debe ser una fecha válida' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de garantía debe ser una fecha válida' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "warrantyUntil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Las notas no pueden exceder 1000 caracteres' }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ACTIVO', 'MANTENIMIENTO', 'DADO_DE_BAJA', 'TRANSFERIDO', 'CUARENTENA'], {
        message: 'Estado inválido'
    }),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "state", void 0);
