import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SchemaMigrationService } from '../schema-migration/schema-migration.service';

@Injectable()
export class ConfigurationService {
  private readonly frontendDir = path.join(process.cwd(), '../frontend/src');

  constructor(private readonly schemaMigration: SchemaMigrationService) {}

  listAvailableForms() {
    const forms = [
      // Formularios (components)
      { id: 'AssetForm', name: 'Formulario de Activos', path: 'components/AssetForm.tsx', type: 'form' },
      { id: 'UserForm', name: 'Formulario de Usuarios', path: 'components/UserForm.tsx', type: 'form' },
      { id: 'RoleForm', name: 'Formulario de Roles', path: 'components/RoleForm.tsx', type: 'form' },
      
      // Tablas (components con tabla)
      { id: 'AssetList', name: 'Tabla de Activos', path: 'components/AssetList.tsx', type: 'table' },
      { id: 'UserList', name: 'Tabla de Usuarios', path: 'components/UserList.tsx', type: 'table' },
      { id: 'RoleList', name: 'Tabla de Roles', path: 'components/RoleList.tsx', type: 'table' },
      
      // Vistas con tablas
      { id: 'LicensesView', name: 'Tabla de Licencias', path: 'views/LicensesView.tsx', type: 'table' },
      { id: 'MovementView', name: 'Tabla de Movimientos', path: 'views/MovementView.tsx', type: 'table' },
      { id: 'MaintenanceView', name: 'Tabla de Mantenimiento', path: 'views/MaintenanceView.tsx', type: 'table' },
      { id: 'VendorsView', name: 'Tabla de Proveedores', path: 'views/VendorsView.tsx', type: 'table' },
      { id: 'NotificationsView', name: 'Tabla de Notificaciones', path: 'views/NotificationsView.tsx', type: 'table' },
      
      // Vistas especiales
      { id: 'ReportsView', name: 'Vista de Reportes', path: 'views/ReportsView.tsx', type: 'view' },
      { id: 'IntegrationsView', name: 'Vista de Integraciones', path: 'views/IntegrationsView.tsx', type: 'view' },
      { id: 'DashboardView', name: 'Dashboard', path: 'views/DashboardView.tsx', type: 'view' },
      { id: 'ReportBuilderView', name: 'Generador de Reportes', path: 'views/ReportBuilderView.tsx', type: 'view' },
      { id: 'ConfigurationView', name: 'Configuración', path: 'views/ConfigurationView.tsx', type: 'view' },
      
      // Navegación
      { id: 'MainLayout', name: 'Menú de Navegación', path: 'components/MainLayout.tsx', type: 'menu' },
    ];
    return { forms };
  }

  getFormSchema(formName: string) {
    // Lee el archivo y extrae los campos del formulario
    const filePath = this.getFilePath(formName);
    
    if (!fs.existsSync(filePath)) {
      return { fields: [], layout: 'grid-2cols', error: 'Archivo no encontrado' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Cargar metadata para obtener título si existe
    const metadata = this.loadMetadata(formName);
    
    // Determinar el tipo de contenido
    const isTable = content.includes('<table>') || content.includes('<thead>');
    const isMenu = content.includes('<nav>') && content.includes('NavLink');
    
    if (isMenu) {
      const menuItems = this.extractMenuItems(content);
      
      // Aplicar orden personalizado y obtener título
      if (metadata && metadata.menuItems) {
        const orderedItems = this.applyMenuOrder(menuItems, metadata.menuItems);
        return { 
          menuItems: orderedItems, 
          type: 'menu', 
          filePath, 
          content,
          title: metadata.title || 'Menú de Navegación'
        };
      }
      
      return { 
        menuItems, 
        type: 'menu', 
        filePath, 
        content,
        title: metadata?.title || 'Menú de Navegación'
      };
    } else if (isTable) {
      const columns = this.extractTableColumns(content);
      
      // Aplicar orden personalizado y obtener título
      if (metadata && metadata.columns) {
        const orderedColumns = this.applyColumnOrder(columns, metadata.columns);
        return { 
          columns: orderedColumns, 
          type: 'table', 
          filePath, 
          content,
          title: metadata.title || 'Tabla'
        };
      }
      
      return { 
        columns, 
        type: 'table', 
        filePath, 
        content,
        title: metadata?.title || 'Tabla'
      };
    } else {
      const fields = this.extractFieldsFromCode(content);
      const layout = this.extractLayout(content);
      
      // Aplicar orden personalizado y obtener título
      if (metadata && metadata.fields) {
        const orderedFields = this.applyFieldOrder(fields, metadata.fields);
        return { 
          fields: orderedFields, 
          layout: metadata.layout || layout, 
          type: 'form', 
          filePath, 
          content,
          title: metadata.title || 'Formulario'
        };
      }
      
      return { 
        fields, 
        layout, 
        type: 'form', 
        filePath, 
        content,
        title: metadata?.title || 'Formulario'
      };
    }
  }

  private extractTableColumns(content: string): any[] {
    const columns: any[] = [];
    
    // Buscar encabezados de tabla
    const theadMatch = /<thead>([\s\S]*?)<\/thead>/.exec(content);
    if (!theadMatch) return columns;
    
    const theadContent = theadMatch[1];
    // Regex mejorado: captura solo el texto visible del th, ignorando atributos onClick, etc
    const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/g;
    let match;
    let order = 1;
    
    // Extraer también el cuerpo de la tabla para determinar tipos
    const tbodyMatch = /<tbody[^>]*>([\s\S]*?)<\/tbody>/.exec(content);
    const tbodyContent = tbodyMatch ? tbodyMatch[1] : '';
    
    // Extraer una fila de ejemplo para analizar tipos
    const firstRowMatch = /<tr[^>]*>([\s\S]*?)<\/tr>/.exec(tbodyContent);
    const tdContents: string[] = [];
    
    if (firstRowMatch) {
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      let tdMatch;
      while ((tdMatch = tdRegex.exec(firstRowMatch[1])) !== null) {
        tdContents.push(tdMatch[1].trim());
      }
    }
    
    let colIndex = 0;
    while ((match = thRegex.exec(theadContent)) !== null) {
      let thContent = match[1].trim();
      
      // Si contiene código onClick/handleSort, extraer solo el texto después del último >
      if (thContent.includes('onClick') || thContent.includes('handleSort')) {
        // Dividir por > y tomar la última parte
        const parts = thContent.split('>');
        thContent = parts[parts.length - 1].trim();
      }
      
      // Limpiar restos de código JSX y HTML
      thContent = thContent
        .replace(/\{[^}]*\}/g, '')  // Eliminar expresiones JSX
        .replace(/<[^>]*>/g, '')     // Eliminar tags HTML
        .replace(/[{}]/g, '')        // Eliminar llaves sueltas
        .replace(/}>/g, '')          // Eliminar }>
        .replace(/\n/g, ' ')         // Eliminar saltos de línea
        .replace(/\s+/g, ' ')        // Normalizar espacios
        .trim();
      
      const label = thContent || `Columna ${colIndex + 1}`;
      const tdContent = tdContents[colIndex] || '';
      
      // Determinar tipo basándose en el contenido del td
      let dataType = 'text';
      if (tdContent.includes('toLocaleDateString') || tdContent.includes('Date(')) {
        dataType = 'date';
      } else if (tdContent.includes('toFixed') || tdContent.includes('$')) {
        dataType = 'number';
      } else if (tdContent.includes('<button') || tdContent.includes('onClick')) {
        dataType = 'action';
      } else if (tdContent.match(/\{.*\?\s*.*\:\s*.*\}/)) {
        dataType = 'conditional';
      }
      
      columns.push({
        label,
        visible: true,
        order: order++,
        dataType,
      });
      
      colIndex++;
    }
    
    return columns;
  }

  private extractMenuItems(content: string): any[] {
    const menuItems: any[] = [];
    
    // Primero intentar extraer del array defaultMenuItems si existe
    const defaultMenuMatch = /const\s+defaultMenuItems\s*:\s*MenuItem\[\]\s*=\s*\[([\s\S]*?)\];/.exec(content);
    if (defaultMenuMatch) {
      const arrayContent = defaultMenuMatch[1];
      // Extraer cada objeto del array
      const itemRegex = /\{\s*path:\s*['"]([^'"]+)['"]\s*,\s*label:\s*['"]([^'"]+)['"]\s*,\s*icon:\s*['"]([^'"]+)['"]\s*,\s*visible:\s*(true|false)\s*,\s*order:\s*(\d+)\s*\}/g;
      let match;
      
      while ((match = itemRegex.exec(arrayContent)) !== null) {
        menuItems.push({
          path: match[1],
          label: match[2],
          icon: match[3],
          visible: match[4] === 'true',
          order: parseInt(match[5]),
        });
      }
      
      if (menuItems.length > 0) {
        return menuItems;
      }
    }
    
    // Si no hay defaultMenuItems, buscar NavLinks en el JSX (formato antiguo)
    const navMatch = /<nav[^>]*>([\s\S]*?)<\/nav>/.exec(content);
    if (!navMatch) return menuItems;
    
    const navContent = navMatch[1];
    const navLinkRegex = /<NavLink\s+to="([^"]+)"[^>]*>([^<]+)<\/NavLink>/g;
    let match;
    let order = 1;
    
    while ((match = navLinkRegex.exec(navContent)) !== null) {
      const path = match[1];
      let label = match[2].trim();
      
      // Extraer el emoji y el texto - mejor regex para emojis
      const emojiMatch = label.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*(.+)$/u);
      const icon = emojiMatch ? emojiMatch[1] : '';
      const text = emojiMatch ? emojiMatch[2] : label;
      
      menuItems.push({
        path,
        label: text,
        icon,
        visible: true,
        order: order++,
      });
    }
    
    return menuItems;
  }

  private applyMenuOrder(menuItems: any[], savedMenuItems: any[]): any[] {
    const itemMap = new Map(menuItems.map(item => [item.path, item]));
    const result = [];

    // Primero agregar los elementos guardados en el orden guardado
    for (const saved of savedMenuItems) {
      const item = itemMap.get(saved.path);
      if (item) {
        result.push({
          ...item,
          label: saved.label || item.label,
          icon: saved.icon !== undefined ? saved.icon : item.icon,
          visible: saved.visible !== undefined ? saved.visible : item.visible,
          order: saved.order || item.order,
          parentPath: saved.parentPath || undefined, // Preservar parentPath de la metadata
        });
        itemMap.delete(saved.path);
      }
    }

    // Agregar elementos nuevos que no estaban en la configuración guardada
    for (const [, item] of itemMap) {
      result.push(item);
    }

    return result;
  }

  private getFilePath(formName: string): string {
    const forms = this.listAvailableForms().forms;
    const form = forms.find(f => f.id === formName);
    if (!form) return '';
    
    // El path ya viene con la ruta completa (components/AssetForm.tsx o views/AssetsView.tsx)
    // frontendDir ya apunta a /frontend/src, así que solo agregamos el path del form
    return path.join(this.frontendDir, form.path);
  }

  private extractFieldsFromCode(content: string): any[] {
    // Extrae campos tipo: <input ... value={formData.name} ...> o value={form.name}
    const fields: any[] = [];
    const labelMap: { [key: string]: string } = {};
    
    // Primero extraer todos los labels con su campo asociado (buscar ambos patrones)
    // Patrón 1: <label><span>Texto</span><input value={formData.campo} />
    const labelPattern1 = /<label[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<input[^>]*value=\{formData\.(\w+)\}/g;
    const labelPattern2 = /<label[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<input[^>]*value=\{form\.(\w+)\}/g;
    // Patrón 2: <label>Texto<input value={formData.campo} />
    const labelPattern3 = /<label[^>]*>([^<]+)<\/label>\s*<input[^>]*value=\{formData\.(\w+)\}/g;
    const labelPattern4 = /<label[^>]*>([^<]+)<\/label>\s*<input[^>]*value=\{form\.(\w+)\}/g;
    let labelMatch;
    
    // Extraer labels con span y formData
    while ((labelMatch = labelPattern1.exec(content)) !== null) {
      const labelText = labelMatch[1].replace(/\s*\*\s*$/, '').trim();
      const fieldName = labelMatch[2];
      labelMap[fieldName] = labelText;
    }
    
    // Extraer labels con span y form
    while ((labelMatch = labelPattern2.exec(content)) !== null) {
      const labelText = labelMatch[1].replace(/\s*\*\s*$/, '').trim();
      const fieldName = labelMatch[2];
      labelMap[fieldName] = labelText;
    }
    
    // Extraer labels simples con formData
    while ((labelMatch = labelPattern3.exec(content)) !== null) {
      const labelText = labelMatch[1].replace(/\s*\*\s*$/, '').trim();
      const fieldName = labelMatch[2];
      if (!labelMap[fieldName]) labelMap[fieldName] = labelText;
    }
    
    // Extraer labels simples con form
    while ((labelMatch = labelPattern4.exec(content)) !== null) {
      const labelText = labelMatch[1].replace(/\s*\*\s*$/, '').trim();
      const fieldName = labelMatch[2];
      if (!labelMap[fieldName]) labelMap[fieldName] = labelText;
    }
    
    // Ahora extraer los inputs (buscar ambos patrones)
    const inputRegex1 = /<input[^>]*value=\{formData\.(\w+)\}[^>]*>/g;
    const inputRegex2 = /<input[^>]*value=\{form\.(\w+)\}[^>]*>/g;
    let match;
    let order = 1;
    const processedFields = new Set<string>();
    
    // Procesar inputs con formData
    while ((match = inputRegex1.exec(content)) !== null) {
      const fieldName = match[1];
      if (processedFields.has(fieldName)) continue;
      
      const typeMatch = /type="([^"]+)"/.exec(match[0]);
      const requiredMatch = /required/.test(match[0]);
      
      fields.push({
        name: fieldName,
        label: labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: typeMatch ? typeMatch[1] : 'text',
        required: requiredMatch,
        order: order++,
      });
      processedFields.add(fieldName);
    }
    
    // Procesar inputs con form
    while ((match = inputRegex2.exec(content)) !== null) {
      const fieldName = match[1];
      if (processedFields.has(fieldName)) continue;
      
      const typeMatch = /type="([^"]+)"/.exec(match[0]);
      const requiredMatch = /required/.test(match[0]);
      
      fields.push({
        name: fieldName,
        label: labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: typeMatch ? typeMatch[1] : 'text',
        required: requiredMatch,
        order: order++,
      });
      processedFields.add(fieldName);
    }
    
    // También buscar selects (ambos patrones y ambos formatos de label)
    const selectRegex1 = /<select[^>]*value=\{formData\.(\w+)\}[^>]*>/g;
    const selectRegex2 = /<select[^>]*value=\{form\.(\w+)\}[^>]*>/g;
    
    // Extraer labels para selects con span
    const selectLabelPattern1 = /<label[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<select[^>]*value=\{formData\.(\w+)\}/g;
    const selectLabelPattern2 = /<label[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<select[^>]*value=\{form\.(\w+)\}/g;
    
    while ((labelMatch = selectLabelPattern1.exec(content)) !== null) {
      const labelText = labelMatch[1].replace(/\s*\*\s*$/, '').trim();
      const fieldName = labelMatch[2];
      if (!labelMap[fieldName]) labelMap[fieldName] = labelText;
    }
    
    while ((labelMatch = selectLabelPattern2.exec(content)) !== null) {
      const labelText = labelMatch[1].replace(/\s*\*\s*$/, '').trim();
      const fieldName = labelMatch[2];
      if (!labelMap[fieldName]) labelMap[fieldName] = labelText;
    }
    
    while ((match = selectRegex1.exec(content)) !== null) {
      const fieldName = match[1];
      if (processedFields.has(fieldName)) continue;
      
      const requiredMatch = /required/.test(match[0]);
      fields.push({
        name: fieldName,
        label: labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: 'select',
        required: requiredMatch,
        order: order++,
      });
      processedFields.add(fieldName);
    }
    
    while ((match = selectRegex2.exec(content)) !== null) {
      const fieldName = match[1];
      if (processedFields.has(fieldName)) continue;
      
      const requiredMatch = /required/.test(match[0]);
      fields.push({
        name: fieldName,
        label: labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: 'select',
        required: requiredMatch,
        order: order++,
      });
      processedFields.add(fieldName);
    }
    
    // También buscar textareas (ambos patrones)
    const textareaRegex1 = /<textarea[^>]*value=\{formData\.(\w+)\}[^>]*>/g;
    const textareaRegex2 = /<textarea[^>]*value=\{form\.(\w+)\}[^>]*>/g;
    
    while ((match = textareaRegex1.exec(content)) !== null) {
      const fieldName = match[1];
      if (processedFields.has(fieldName)) continue;
      
      const requiredMatch = /required/.test(match[0]);
      fields.push({
        name: fieldName,
        label: labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: 'textarea',
        required: requiredMatch,
        order: order++,
      });
      processedFields.add(fieldName);
    }
    
    while ((match = textareaRegex2.exec(content)) !== null) {
      const fieldName = match[1];
      if (processedFields.has(fieldName)) continue;
      
      const requiredMatch = /required/.test(match[0]);
      fields.push({
        name: fieldName,
        label: labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        type: 'textarea',
        required: requiredMatch,
        order: order++,
      });
      processedFields.add(fieldName);
    }
    
    return fields;
  }

  private extractLayout(content: string): string {
    // Buscar patrones hardcoded
    if (content.includes('gridTemplateColumns: \'1fr 1fr 1fr\'')) return 'grid-3cols';
    if (content.includes('gridTemplateColumns: \'1fr 1fr\'')) return 'grid-2cols';
    
    // Buscar patrones dinámicos con variables
    if (content.includes('gridTemplateColumns: gridColumns')) {
      // Verificar el valor inicial de la variable
      const gridColsMatch = /useState\(['"`](.*?)['"`]\)/s.exec(content);
      if (gridColsMatch) {
        const initialValue = gridColsMatch[1];
        if (initialValue === '1fr 1fr 1fr') return 'grid-3cols';
        if (initialValue === '1fr 1fr') return 'grid-2cols';
        if (initialValue === '1fr') return 'single-column';
      }
    }
    
    return 'single-column';
  }

  private loadMetadata(formName: string): any {
    const metadataPath = path.join(this.frontendDir, '.config', `${formName}.json`);
    if (fs.existsSync(metadataPath)) {
      return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    }
    return null;
  }

  private saveMetadata(formName: string, metadata: any): void {
    const configDir = path.join(this.frontendDir, '.config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Guardar JSON metadata
    const metadataPath = path.join(configDir, `${formName}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Guardar también un archivo index.ts que exporte todas las configuraciones
    this.updateConfigIndex(configDir);
  }

  private updateConfigIndex(configDir: string): void {
    const files = fs.readdirSync(configDir).filter(f => f.endsWith('.json'));
    const configs: any = {};
    
    files.forEach(file => {
      const formName = file.replace('.json', '');
      const content = fs.readFileSync(path.join(configDir, file), 'utf-8');
      configs[formName] = JSON.parse(content);
    });
    
    // Crear archivo TypeScript con todas las configuraciones
    const tsContent = `// Auto-generado por el sistema de configuración
// No modificar manualmente

export const formConfigs = ${JSON.stringify(configs, null, 2)} as const;

export const getFormConfig = (formName: string) => {
  return formConfigs[formName as keyof typeof formConfigs] || null;
};
`;
    
    fs.writeFileSync(path.join(configDir, 'index.ts'), tsContent);
  }

  private applyFieldOrder(fields: any[], savedFields: any[]): any[] {
    // Crear un mapa con la información guardada (orden y labels personalizados)
    const savedFieldsMap = new Map();
    savedFields.forEach((field) => {
      savedFieldsMap.set(field.name, field);
    });

    // Actualizar campos con la info guardada y ordenar
    return fields.map(field => {
      const savedField = savedFieldsMap.get(field.name);
      if (savedField) {
        // Usar label del metadata si existe, mantener el del código si no
        return {
          ...field,
          label: savedField.label || field.label,
          order: savedField.order !== undefined ? savedField.order : field.order,
          visible: savedField.visible !== undefined ? savedField.visible : true,
        };
      }
      return field;
    }).sort((a, b) => a.order - b.order);
  }

  private applyColumnOrder(columns: any[], savedColumns: any[]): any[] {
    // Crear un mapa con la información guardada
    const savedColumnsMap = new Map();
    savedColumns.forEach((col) => {
      savedColumnsMap.set(col.label, col);
    });

    // Actualizar columnas con la info guardada y ordenar
    return columns.map(column => {
      const savedColumn = savedColumnsMap.get(column.label);
      if (savedColumn) {
        return {
          ...column,
          label: savedColumn.label || column.label,
          order: savedColumn.order !== undefined ? savedColumn.order : column.order,
          visible: savedColumn.visible !== undefined ? savedColumn.visible : true,
        };
      }
      return column;
    }).sort((a, b) => a.order - b.order);
  }

  async updateFormSchema(formName: string, schema: any) {
    try {
      const filePath = this.getFilePath(formName);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, message: 'Archivo no encontrado' };
      }

      // NO crear backup - Git ya maneja control de versiones
      // const backupPath = filePath.replace('.tsx', `.backup_${Date.now()}.tsx`);
      // fs.copyFileSync(filePath, backupPath);

      // Leer contenido actual
      let content = fs.readFileSync(filePath, 'utf-8');

      // Si es un menú, actualizar items
      if (schema.type === 'menu' && schema.menuItems) {
        // Guardar metadata con el orden de los items y el título
        this.saveMetadata(formName, { 
          menuItems: schema.menuItems, 
          type: 'menu',
          title: schema.title || 'Menú de Navegación'
        });
        
        return { 
          success: true, 
          message: 'Configuración de menú guardada correctamente. Los cambios se aplicarán en el siguiente deployment.'
        };
      }

      // Si es una tabla, actualizar columnas
      if (schema.type === 'table' && schema.columns) {
        // Guardar metadata con el orden de las columnas y el título
        this.saveMetadata(formName, { 
          columns: schema.columns, 
          type: 'table',
          title: schema.title || 'Tabla'
        });
        
        // Extraer las columnas actuales para hacer el mapeo
        const currentColumns = this.extractTableColumns(content);
        
        // Actualizar cada th con su nuevo label
        schema.columns.forEach((newColumn: any, index: number) => {
          if (currentColumns[index]) {
            const oldLabel = currentColumns[index].label;
            const newLabel = newColumn.label;
            
            // Reemplazar el contenido del th
            const thRegex = new RegExp(
              `(<th[^>]*>)${oldLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(</th>)`,
              'g'
            );
            content = content.replace(thRegex, `$1${newLabel}$2`);
          }
        });

        // Escribir cambios
        fs.writeFileSync(filePath, content);

        return { 
          success: true, 
          message: 'Configuración de tabla guardada correctamente'
        };
      }

      // Si es un formulario, actualizar layout y campos
      if (schema.layout || schema.fields) {
        // Sincronizar campos nuevos con la base de datos ANTES de guardar metadata
        if (schema.fields && schema.fields.length > 0) {
          try {
            const syncResult = await this.schemaMigration.autoSyncFormToTable(
              formName,
              schema.fields
            );
            
            // Log del resultado de sincronización
            console.log(`🔄 Sincronización de campos para ${formName}:`, syncResult);
            
            // Identificar campos nuevos que se agregaron exitosamente
            let newFieldsAdded: string[] = [];
            if (syncResult.details) {
              newFieldsAdded = syncResult.details
                .filter(d => d.message.includes('agregada exitosamente'))
                .map(d => d.field);
              
              if (newFieldsAdded.length > 0) {
                console.log(`✅ Nuevos campos agregados a BD: ${newFieldsAdded.join(', ')}`);
                
                // Agregar campos nuevos al formulario TypeScript
                for (const fieldName of newFieldsAdded) {
                  const fieldConfig = schema.fields.find(f => f.name === fieldName);
                  if (fieldConfig) {
                    content = this.addFieldToForm(content, fieldConfig);
                  }
                }
              }
            }
          } catch (syncError) {
            console.warn(`⚠️  No se pudo sincronizar campos automáticamente: ${syncError.message}`);
            // Continuar con el guardado de metadata incluso si falla la sincronización
          }
        }
        
        // Guardar metadata con el orden de los campos, layout y título
        this.saveMetadata(formName, { 
          fields: schema.fields, 
          layout: schema.layout,
          type: 'form',
          title: schema.title || 'Formulario'
        });
        
        // Actualizar layout si se especificó
        if (schema.layout === 'grid-2cols') {
          content = content.replace(
            /gridTemplateColumns:\s*['"][^'"]+['"]/g,
            "gridTemplateColumns: '1fr 1fr'"
          );
        } else if (schema.layout === 'grid-3cols') {
          content = content.replace(
            /gridTemplateColumns:\s*['"][^'"]+['"]/g,
            "gridTemplateColumns: '1fr 1fr 1fr'"
          );
        } else if (schema.layout === 'single-column') {
          content = content.replace(
            /gridTemplateColumns:\s*['"][^'"]+['"]/g,
            "gridTemplateColumns: '1fr'"
          );
        }

        // Actualizar labels de campos si se especificaron
        if (schema.fields) {
          schema.fields.forEach((field: any) => {
            // Buscar y actualizar el label en el formato <span>Label</span>
            const spanLabelRegex = new RegExp(
              `(<label[^>]*>\\s*<span[^>]*>)[^<]+(</span>\\s*<input[^>]*value=\\{form\\.${field.name}\\})`,
              'g'
            );
            if (spanLabelRegex.test(content)) {
              content = content.replace(spanLabelRegex, `$1${field.label}$2`);
            }
            
            // También buscar formato <label>Label<input... para compatibilidad
            const simpleLabelRegex = new RegExp(
              `(<label[^>]*>)([^<]+)(</label>\\s*<input[^>]*value=\\{form\\.${field.name}\\})`,
              'g'
            );
            content = content.replace(simpleLabelRegex, `$1${field.label}$3`);
          });
        }

        // Escribir cambios
        fs.writeFileSync(filePath, content);

        return { 
          success: true, 
          message: `✅ Configuración guardada. Metadata actualizado en .config/${formName}.json`
        };
      }

      // Guardar también en JSON de referencia
      const configDir = path.join(process.cwd(), 'config');
      const configPath = path.join(configDir, 'form-schemas.json');
      
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      let configs = {};
      if (fs.existsSync(configPath)) {
        configs = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      
      configs[formName] = {
        ...schema,
        lastModified: new Date().toISOString(),
      };
      
      fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));

      return {
        success: true,
        message: `✅ Cambios guardados en ${filePath}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  /**
   * Agrega un nuevo campo al código del formulario
   */
  private addFieldToForm(content: string, field: any): string {
    // 1. Agregar el campo al estado inicial del formulario
    const stateMatch = /const \[form, setForm\] = useState\(\{([^}]+)\}\);/s.exec(content);
    if (stateMatch) {
      const currentFields = stateMatch[1];
      // Verificar si el campo ya existe en el estado
      if (!currentFields.includes(`${field.name}:`)) {
        const newField = `${field.name}: '',`;
        const updatedState = currentFields.trim() + `\n    ${newField}`;
        content = content.replace(
          /const \[form, setForm\] = useState\(\{([^}]+)\}\);/s,
          `const [form, setForm] = useState({\n    ${updatedState.trim()}\n  });`
        );
      }
    }

    // 2. Agregar el campo al payload de submit
    const submitMatch = /if \(form\.notes.*?\{[\s\S]*?payload\.notes = form\.notes\.trim\(\);[\s\S]*?\}/m.exec(content);
    if (submitMatch) {
      const insertionPoint = submitMatch.index + submitMatch[0].length;
      const payloadCode = `\n      if (form.${field.name} && form.${field.name}.trim()) {\n        payload.${field.name} = form.${field.name}.trim();\n      }`;
      
      // Solo agregar si no existe
      if (!content.includes(`payload.${field.name}`)) {
        content = content.slice(0, insertionPoint) + payloadCode + content.slice(insertionPoint);
      }
    }

    // 3. Agregar el campo al reseteo del formulario
    const resetMatch = /setForm\(\{[\s\S]*?state: 'ACTIVO',[\s\S]*?\}\);/m.exec(content);
    if (resetMatch && !resetMatch[0].includes(`${field.name}:`)) {
      const resetCode = resetMatch[0].replace(
        /state: 'ACTIVO',/,
        `state: 'ACTIVO',\n          ${field.name}: '',`
      );
      content = content.replace(resetMatch[0], resetCode);
    }

    // 4. Agregar el campo visual al JSX (buscar dónde insertar)
    // Buscar el último </label> antes del botón de submit
    const lastLabelMatch = /<\/label>(?=[\s\S]*?<button[^>]*type="submit")/g;
    let lastMatch;
    let matches = content.matchAll(lastLabelMatch);
    for (const match of matches) {
      lastMatch = match;
    }

    if (lastMatch) {
      const inputType = this.getInputTypeForField(field.type);
      const fieldJSX = `

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
        <span style={{ fontWeight: 500, color: '#555' }}>${field.label}</span>
        <input ${inputType} value={form.${field.name}} onChange={(e) => handleChange('${field.name}', e.target.value)} placeholder="${field.label}" style={{ width: '100%', padding: '0.3rem', fontSize: '0.85rem' }} />
      </label>`;

      // Solo agregar si no existe
      if (!content.includes(`value={form.${field.name}}`)) {
        const insertPos = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, insertPos) + fieldJSX + content.slice(insertPos);
      }
    }

    return content;
  }

  /**
   * Obtiene el atributo type de HTML para un tipo de campo
   */
  private getInputTypeForField(fieldType: string): string {
    const typeMap: Record<string, string> = {
      text: 'type="text"',
      textarea: 'type="text"', // Podría cambiarse a <textarea> en el futuro
      number: 'type="number"',
      date: 'type="date"',
      datetime: 'type="datetime-local"',
      email: 'type="email"',
      tel: 'type="tel"',
      url: 'type="url"',
      checkbox: 'type="checkbox"',
      file: 'type="file"',
    };

    return typeMap[fieldType] || 'type="text"';
  }
}
