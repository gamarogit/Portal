import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { SchemaMigrationService } from './schema-migration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('schema-migration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchemaMigrationController {
  constructor(private readonly schemaMigrationService: SchemaMigrationService) {}

  /**
   * Verifica si una columna existe
   */
  @Get('check/:tableName/:columnName')
  async checkColumn(
    @Param('tableName') tableName: string,
    @Param('columnName') columnName: string,
  ) {
    const exists = await this.schemaMigrationService.columnExists(tableName, columnName);
    return { exists, tableName, columnName };
  }

  /**
   * Agrega una columna a una tabla
   */
  @Post('add-column')
  async addColumn(
    @Body() body: {
      tableName: string;
      columnName: string;
      fieldType: string;
      nullable?: boolean;
      defaultValue?: any;
    },
  ) {
    return this.schemaMigrationService.addColumn(
      body.tableName,
      body.columnName,
      body.fieldType,
      body.nullable ?? true,
      body.defaultValue,
    );
  }

  /**
   * Sincroniza campos de un formulario con su tabla
   */
  @Post('sync-form')
  async syncForm(
    @Body() body: {
      formName: string;
      fields: Array<{ name: string; type: string; required?: boolean; defaultValue?: any }>;
    },
  ) {
    return this.schemaMigrationService.autoSyncFormToTable(body.formName, body.fields);
  }

  /**
   * Obtiene las tablas disponibles
   */
  @Get('tables')
  async getTables() {
    const tables = await this.schemaMigrationService.getAvailableTables();
    return { tables };
  }

  /**
   * Obtiene las columnas de una tabla
   */
  @Get('tables/:tableName/columns')
  async getTableColumns(@Param('tableName') tableName: string) {
    const columns = await this.schemaMigrationService.getTableColumns(tableName);
    return { tableName, columns };
  }
}
