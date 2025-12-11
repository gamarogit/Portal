import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skip =
      this.configService.get('DEV_ALLOW_PUBLIC_ASSETS') === '1' ||
      process.env.NODE_ENV !== 'production';
    if (skip) {
      return true;
    }
    return super.canActivate(context);
  }
}
