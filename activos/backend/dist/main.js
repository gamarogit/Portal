"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:5173', 'http://localhost:3000'];
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    logger.log(`Backend listening on port ${port}`);
    logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
