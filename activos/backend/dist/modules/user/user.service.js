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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            include: {
                role: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario ${id} no encontrado`);
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async create(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException(`El email ${dto.email} ya está registrado`);
        }
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                roleId: dto.roleId || null,
            },
            include: {
                role: true,
            },
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async update(id, dto) {
        console.log('=== UPDATE USER ===');
        console.log('ID:', id);
        console.log('DTO recibido:', JSON.stringify(dto, null, 2));
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`Usuario ${id} no encontrado`);
        }
        console.log('Usuario existente:', JSON.stringify(existingUser, null, 2));
        if (dto.email && dto.email !== existingUser.email) {
            const emailInUse = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailInUse) {
                throw new common_1.ConflictException(`El email ${dto.email} ya está registrado`);
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.email !== undefined)
            updateData.email = dto.email;
        if (dto.roleId !== undefined)
            updateData.roleId = dto.roleId;
        console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2));
        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                role: true,
            },
        });
        console.log('Usuario actualizado:', JSON.stringify(user, null, 2));
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async delete(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario ${id} no encontrado`);
        }
        const assetsCount = await this.prisma.asset.count({
            where: { responsibleId: id },
        });
        if (assetsCount > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el usuario porque tiene ${assetsCount} activo(s) asignado(s)`);
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'Usuario eliminado correctamente' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
