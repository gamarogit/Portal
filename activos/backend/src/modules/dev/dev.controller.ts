import { Body, Controller, Get, Post } from '@nestjs/common';
import { DevService } from './dev.service';

type NamedPayload = { name: string };

@Controller('dev')
export class DevController {
  constructor(private readonly dev: DevService) {}

  @Get('add-os')
  async addOperatingSystemColumn() {
    await this.dev.createOperatingSystemColumn();
    return { status: 'ok', message: 'Columna operatingSystem creada (si no existía)' };
  }

  @Post('asset-type')
  createAssetType(@Body() payload: NamedPayload) {
    return this.dev.createAssetType(payload.name);
  }

  @Post('location')
  createLocation(@Body() payload: NamedPayload) {
    return this.dev.createLocation(payload.name);
  }

  @Post('user')
  createUser(@Body() payload: NamedPayload) {
    return this.dev.createUser(payload.name);
  }

  @Get('asset-types')
  getAssetTypes() {
    return this.dev.getAssetTypes();
  }

  @Get('locations')
  getLocations() {
    return this.dev.getLocations();
  }

  @Get('users')
  getUsers() {
    return this.dev.getUsers();
  }
}
