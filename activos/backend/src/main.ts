import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3101'];
  
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  logger.log(`Backend listening on port ${port}`);
  logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
