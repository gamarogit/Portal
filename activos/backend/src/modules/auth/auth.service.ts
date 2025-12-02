import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

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
}
