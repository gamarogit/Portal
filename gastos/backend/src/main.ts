import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3103'],
            credentials: true,
        },
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const port = process.env.PORT || 3003;
    await app.listen(port);
    console.log(`💰 Gastos Backend running on http://localhost:${port}`);
}

bootstrap();
