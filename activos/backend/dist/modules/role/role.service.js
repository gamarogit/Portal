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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RoleService = class RoleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Rol con ID ${id} no encontrado`);
        }
        return role;
    }
    async create(dto) {
        try {
            return await this.prisma.role.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException(`Ya existe un rol con el nombre "${dto.name}"`);
            }
            throw error;
        }
    }
    async update(id, dto) {
        const role = await this.findOne(id);
        try {
            return await this.prisma.role.update({
                where: { id },
                data: {
                    ...(dto.name && { name: dto.name }),
                    ...(dto.description !== undefined && { description: dto.description }),
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException(`Ya existe un rol con el nombre "${dto.name}"`);
            }
            throw error;
        }
    }
    async delete(id) {
        const role = await this.findOne(id);
        const usersCount = await this.prisma.user.count({
            where: { roleId: id },
        });
        if (usersCount > 0) {
            throw new common_1.ConflictException(`No se puede eliminar el rol "${role.name}" porque tiene ${usersCount} usuario(s) asignado(s)`);
        }
        await this.prisma.role.delete({
            where: { id },
        });
        return { message: 'Rol eliminado exitosamente' };
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleService);
