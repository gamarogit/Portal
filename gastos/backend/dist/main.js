"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3103'],
            credentials: true,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const port = process.env.PORT || 3003;
    await app.listen(port);
    console.log(`💰 Gastos Backend running on http://localhost:${port}`);
}
bootstrap();
