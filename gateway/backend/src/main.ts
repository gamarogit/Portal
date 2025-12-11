import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para micro-frontends
  app.enableCors({
    origin: (origin, callback) => {
      // Un solo regex para localhost y red local
      const allowedOriginPattern = /^http:\/\/(localhost|192\.168\.\d{1,3}\.\d{1,3}):(3000|5173|5174|3101|3102|3103)$/;

      if (!origin || allowedOriginPattern.test(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS Blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Gateway running on:`);
  console.log(`   Local:   http://localhost:${port}`);
  console.log(`   Network: http://192.168.0.149:${port}`);
  console.log(`   Network: http://192.168.0.149:${port}`);
}

bootstrap();
