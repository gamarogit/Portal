// Auto-generado por el sistema de configuración
// No modificar manualmente

export const formConfigs = {
  "AssetForm": {
    "fields": [
      {
        "name": "name",
        "label": "Nombre",
        "type": "text",
        "required": false,
        "order": 1,
        "visible": true
      },
      {
        "name": "serialNumber",
        "label": "Serie",
        "type": "text",
        "required": false,
        "order": 2,
        "visible": true
      },
      {
        "name": "operatingSystem",
        "label": "Tipo",
        "type": "text",
        "required": false,
        "order": 3,
        "visible": true
      },
      {
        "name": "manufacturer",
        "label": "Fabricante",
        "type": "text",
        "required": false,
        "order": 4,
        "visible": true
      },
      {
        "name": "model",
        "label": "Modelo",
        "type": "text",
        "required": false,
        "order": 5,
        "visible": true
      },
      {
        "name": "cost",
        "label": "Costo",
        "type": "number",
        "required": false,
        "order": 6,
        "visible": true
      },
      {
        "name": "purchaseDate",
        "label": "Compra",
        "type": "date",
        "required": false,
        "order": 7,
        "visible": true
      },
      {
        "name": "warrantyUntil",
        "label": "Garantía",
        "type": "date",
        "required": false,
        "order": 8,
        "visible": true
      },
      {
        "name": "assetTypeId",
        "label": "Nombre",
        "type": "select",
        "required": false,
        "order": 9,
        "visible": true
      },
      {
        "name": "locationId",
        "label": "Ubicación",
        "type": "select",
        "required": false,
        "order": 10,
        "visible": true
      },
      {
        "name": "responsibleId",
        "label": "Responsable",
        "type": "select",
        "required": false,
        "order": 11,
        "visible": true
      },
      {
        "name": "state",
        "label": "Tipo",
        "type": "select",
        "required": false,
        "order": 12,
        "visible": true
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "required": false,
        "order": 13,
        "visible": true
      },
      {
        "name": "campo_1764605401037",
        "label": "Memoria",
        "type": "text",
        "required": false,
        "order": 14
      }
    ],
    "layout": "grid-3cols",
    "type": "form",
    "title": "Formulario"
  },
  "MainLayout": {
    "menuItems": [
      {
        "path": "/dashboard",
        "label": "Dashboard",
        "icon": "📊",
        "visible": true,
        "order": 1
      },
      {
        "path": "/users",
        "label": "Usuarios",
        "icon": "👥",
        "visible": true,
        "order": 2
      },
      {
        "path": "/roles",
        "label": "Roles",
        "icon": "📋",
        "visible": true,
        "order": 3,
        "parentPath": "/users"
      },
      {
        "path": "/movements",
        "label": "Movimientos",
        "icon": "🔄",
        "visible": true,
        "order": 4
      },
      {
        "path": "/assets",
        "label": "Activos",
        "icon": "📦",
        "visible": true,
        "order": 5,
        "parentPath": "/movements"
      },
      {
        "path": "/maintenance",
        "label": "Mantenimientos",
        "icon": "🔧",
        "visible": true,
        "order": 6,
        "parentPath": "/movements"
      },
      {
        "path": "/licenses",
        "label": "Licencias",
        "icon": "💿",
        "visible": true,
        "order": 7,
        "parentPath": "/movements"
      },
      {
        "path": "/vendors",
        "label": "Proveedores",
        "icon": "🏢",
        "visible": true,
        "order": 8,
        "parentPath": "/movements"
      },
      {
        "path": "/notifications",
        "label": "Notificaciones",
        "icon": "🔔",
        "visible": true,
        "order": 9
      },
      {
        "path": "/reports",
        "label": "Reportes",
        "icon": "📈",
        "visible": true,
        "order": 10
      },
      {
        "path": "/integrations",
        "label": "Integraciones",
        "icon": "🔗",
        "visible": true,
        "order": 11
      },
      {
        "path": "/configuration",
        "label": "Configuración",
        "icon": "⚙️",
        "visible": true,
        "order": 12
      },
      {
        "path": "/report-builder",
        "label": "Reporteador",
        "icon": "📝",
        "visible": true,
        "order": 13,
        "parentPath": "/configuration"
      }
    ],
    "type": "menu",
    "title": "Gestión de Activos"
  },
  "UserForm": {
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": false,
        "order": 1,
        "visible": true
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": false,
        "order": 2,
        "visible": true
      },
      {
        "name": "roleId",
        "label": "RoleId",
        "type": "select",
        "required": false,
        "order": 3,
        "visible": true
      }
    ],
    "layout": "grid-2cols",
    "type": "form",
    "title": "Formulario"
  }
} as const;

export const getFormConfig = (formName: string) => {
  return formConfigs[formName as keyof typeof formConfigs] || null;
};
