import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    // Obtener permisos de un usuario
    @Get('users/:userId')
    @Roles('ADMIN')
    async getUserPermissions(@Param('userId') userId: string) {
        return this.permissionsService.getUserPermissions(userId);
    }

    // Actualizar permisos de sistemas de un usuario
    @Put('users/:userId/systems')
    @Roles('ADMIN')
    async updateSystemPermissions(
        @Param('userId') userId: string,
        @Body() body: { permissions: { systemId: string; canAccess: boolean }[] },
    ) {
        return this.permissionsService.updateSystemPermissions(
            userId,
            body.permissions,
        );
    }

    // Actualizar permisos de funcionalidades de un usuario
    @Put('users/:userId/features')
    @Roles('ADMIN')
    async updateFeaturePermissions(
        @Param('userId') userId: string,
        @Body() body: { permissions: { featureId: string; granted: boolean }[] },
    ) {
        return this.permissionsService.updateFeaturePermissions(
            userId,
            body.permissions,
        );
    }

    // Obtener funcionalidades de un sistema
    @Get('systems/:systemId/features')
    @Roles('ADMIN')
    async getSystemFeatures(@Param('systemId') systemId: string) {
        return this.permissionsService.getSystemFeatures(systemId);
    }

    // Obtener todas las funcionalidades agrupadas por sistema
    @Get('features/all')
    @Roles('ADMIN')
    async getAllFeatures() {
        return this.permissionsService.getAllFeatures();
    }

    // Crear una nueva funcionalidad
    @Post('features')
    @Roles('ADMIN')
    async createFeature(
        @Body()
        body: {
            systemId: string;
            key: string;
            name: string;
            description?: string;
            category?: string;
        },
    ) {
        return this.permissionsService.createFeature(body);
    }
}
