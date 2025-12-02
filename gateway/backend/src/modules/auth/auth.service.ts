import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

  async login(username: string, password: string) {
    // Buscar usuario por email o nombre
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username }
        ]
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Verificar contraseña
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
      }
    } else {
      // Si no tiene password (usuarios viejos), rechazar
      throw new UnauthorizedException('Usuario sin contraseña configurada');
    }

    const token = this.createToken(user.id, user.role ? [user.role.name] : []);
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }

  createToken(userId: string, roles: string[] = []) {
    const payload = { sub: userId, roles };
    return this.jwtService.sign(payload);
  }

  // Gestión de usuarios
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(data: { email: string; password: string; name: string; roleId: string }) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        roleId: data.roleId,
      },
      include: { role: true },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    };
  }

  async updateUser(
    id: string,
    data: { email?: string; name?: string; roleId?: string; active?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se está cambiando el email, verificar que no exista
    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      active: updatedUser.active,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado correctamente' };
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createRole(data: { name: string; description?: string }) {
    const existing = await this.prisma.role.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('El rol ya existe');
    }
    return this.prisma.role.create({ data });
  }

  async updateRole(id: string, data: { name?: string; description?: string }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    if (data.name && data.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('El nombre del rol ya está en uso');
      }
    }
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    if (role._count.users > 0) {
      throw new ConflictException('No se puede eliminar un rol con usuarios asignados');
    }
    // Check using count if available or relation
    const userCount = await this.prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new ConflictException('No se puede eliminar un rol con usuarios asignados');
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
