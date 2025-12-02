import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Ya existe un rol con el nombre "${dto.name}"`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    try {
      return await this.prisma.role.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Ya existe un rol con el nombre "${dto.name}"`);
      }
      throw error;
    }
  }

  async delete(id: string) {
    const role = await this.findOne(id);

    // Verificar si hay usuarios usando este rol
    const usersCount = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (usersCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol "${role.name}" porque tiene ${usersCount} usuario(s) asignado(s)`,
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Rol eliminado exitosamente' };
  }
}
