import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
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

  async create(dto: CreateUserDto) {
    // Verificar que el email no exista
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(`El email ${dto.email} ya está registrado`);
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

  async update(id: string, dto: UpdateUserDto) {
    console.log('=== UPDATE USER ===');
    console.log('ID:', id);
    console.log('DTO recibido:', JSON.stringify(dto, null, 2));
    
    // Verificar que el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    console.log('Usuario existente:', JSON.stringify(existingUser, null, 2));

    // Verificar que el email no esté en uso por otro usuario
    if (dto.email && dto.email !== existingUser.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailInUse) {
        throw new ConflictException(`El email ${dto.email} ya está registrado`);
      }
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;

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

  async delete(id: string) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    // Verificar que el usuario no tenga activos asignados
    const assetsCount = await this.prisma.asset.count({
      where: { responsibleId: id },
    });

    if (assetsCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el usuario porque tiene ${assetsCount} activo(s) asignado(s)`,
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado correctamente' };
  }
}
