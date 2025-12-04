import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchemaMigrationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica si una columna existe en una tabla
   */
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    // PostgreSQL almacena nombres sin comillas en minúsculas
    // pero con comillas respeta el case
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    `, tableName, columnName);

    return result.length > 0;
  }

  /**
   * Obtiene el tipo SQL basado en el tipo de campo del formulario
   */
  private getSqlType(fieldType: string): string {
    const typeMap: Record<string, string> = {
      text: 'VARCHAR(255)',
      textarea: 'TEXT',
      number: 'NUMERIC',
      date: 'TIMESTAMP',
      datetime: 'TIMESTAMP',
      email: 'VARCHAR(255)',
      tel: 'VARCHAR(50)',
      url: 'VARCHAR(500)',
      select: 'VARCHAR(100)',
      checkbox: 'BOOLEAN',
      radio: 'VARCHAR(100)',
      file: 'VARCHAR(500)',
    };

    return typeMap[fieldType] || 'VARCHAR(255)';
  }

  /**
   * Agrega una columna a una tabla existente
   */
  async addColumn(
    tableName: string,
    columnName: string,
    fieldType: string,
    nullable: boolean = true,
    defaultValue?: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validar nombre de columna (solo letras, números y guión bajo)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
        return {
          success: false,
          message: `Nombre de columna inválido: ${columnName}. Use solo letras, números y guión bajo.`,
        };
      }

      // Verificar si la columna ya existe
      const exists = await this.columnExists(tableName, columnName);
      if (exists) {
        return {
          success: false,
          message: `La columna ${columnName} ya existe en la tabla ${tableName}`,
        };
      }

      const sqlType = this.getSqlType(fieldType);
      const nullableClause = nullable ? 'NULL' : 'NOT NULL';
      const defaultClause = defaultValue !== undefined 
        ? `DEFAULT ${typeof defaultValue === 'string' ? `'${defaultValue}'` : defaultValue}`
        : '';

      const sql = `
        ALTER TABLE "${tableName}" 
        ADD COLUMN "${columnName}" ${sqlType} ${nullableClause} ${defaultClause}
      `.trim();

      await this.prisma.$executeRawUnsafe(sql);

      return {
        success: true,
        message: `✅ Columna ${columnName} agregada exitosamente a ${tableName}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Error al agregar columna: ${error.message}`,
      };
    }
  }

  /**
   * Procesa campos de un formulario y crea las columnas faltantes
   */
  async syncFormFields(
    tableName: string,
    fields: Array<{ name: string; type: string; required?: boolean; defaultValue?: any }>
  ): Promise<{ success: boolean; results: Array<{ field: string; message: string }> }> {
    const results: Array<{ field: string; message: string }> = [];
    let allSuccess = true;

    for (const field of fields) {
      const exists = await this.columnExists(tableName, field.name);
      
      if (!exists) {
        const result = await this.addColumn(
          tableName,
          field.name,
          field.type,
          !field.required,
          field.defaultValue
        );

        results.push({
          field: field.name,
          message: result.message,
        });

        if (!result.success) {
          allSuccess = false;
        }
      } else {
        results.push({
          field: field.name,
          message: `Campo ${field.name} ya existe`,
        });
      }
    }

    return {
      success: allSuccess,
      results,
    };
  }

  /**
   * Obtiene las tablas disponibles en el esquema
   */
  async getAvailableTables(): Promise<string[]> {
    const result = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    return result.map(r => r.tablename);
  }

  /**
   * Obtiene las columnas de una tabla
   */
  async getTableColumns(tableName: string): Promise<Array<{
    name: string;
    type: string;
    nullable: boolean;
    default: any;
  }>> {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        column_name as name,
        data_type as type,
        is_nullable = 'YES' as nullable,
        column_default as "default"
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = $1
      ORDER BY ordinal_position
    `, tableName);

    return result;
  }

  /**
   * Mapeo de formularios a tablas de la base de datos
   */
  private getTableForForm(formName: string): string | null {
    const formToTable: Record<string, string> = {
      AssetForm: 'Asset',
      UserForm: 'User',
      RoleForm: 'Role',
      LicensesView: 'License',
      MovementView: 'Movement',
      MaintenanceView: 'Maintenance',
      VendorsView: 'Vendor',
    };

    return formToTable[formName] || null;
  }

  /**
   * Sincroniza automáticamente los campos de un formulario con su tabla
   */
  async autoSyncFormToTable(
    formName: string,
    fields: Array<{ name: string; type: string; required?: boolean }>
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const tableName = this.getTableForForm(formName);

    if (!tableName) {
      return {
        success: false,
        message: `No se encontró mapeo de tabla para el formulario ${formName}`,
      };
    }

    // Filtrar solo campos nuevos que el usuario agregó
    // (excluir campos estándar como id, createdAt, updatedAt)
    const standardFields = ['id', 'createdAt', 'updatedAt'];
    const customFields = fields.filter(f => !standardFields.includes(f.name));

    const syncResult = await this.syncFormFields(tableName, customFields);

    return {
      success: syncResult.success,
      message: syncResult.success
        ? `✅ Sincronización completada para ${formName} → ${tableName}`
        : `⚠️ Sincronización parcial para ${formName} → ${tableName}`,
      details: syncResult.results,
    };
  }
}
