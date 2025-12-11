import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles?: string[];
  iss?: string;
  aud?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      issuer: configService.get('JWT_ISSUER'),
      audience: configService.get('JWT_AUDIENCE'),
    });
  }

  async validate(payload: JwtPayload) {
    // 1. Intentar buscar por ID
    let user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    // 2. Si no existe por ID, buscar por Email (para vincular cuentas existentes)
    if (!user && payload.email) {
      user = await this.prisma.user.findUnique({
        where: { email: payload.email },
        include: { role: true },
      });

      // Si encontramos por email pero el ID es diferente, podríamos actualizar el ID
      // pero por seguridad y consistencia, mejor asumimos que el ID del token es la verdad
      // o simplemente vinculamos. En este caso, si existe por email, usaremos ese registro.
    }

    // 3. Si no existe, crear usuario (JIT Provisioning)
    if (!user) {
      if (!payload.email || !payload.name) {
        throw new UnauthorizedException('Token inválido: faltan datos de usuario');
      }

      try {
        user = await this.prisma.user.create({
          data: {
            id: payload.sub, // Sincronizar ID del Gateway
            email: payload.email,
            name: payload.name,
            // Asignar rol por defecto si es necesario, o dejar null
          },
          include: { role: true },
        });
        console.log(`[JwtStrategy] Usuario creado JIT: ${user.email}`);
      } catch (error) {
        console.error('[JwtStrategy] Error creando usuario JIT:', error);
        throw new UnauthorizedException('Error sincronizando usuario');
      }
    } else {
      // Opcional: Actualizar datos si cambiaron
      if (user.email !== payload.email || user.name !== payload.name) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { email: payload.email, name: payload.name }
        });
      }
    }

    return {
      ...user,
      roles: payload.roles ?? user.role ? [user.role.name] : [],
    };
  }
}
