// Servicio para aplicar configuraciones de formulario
// Intenta primero cargar desde el archivo local generado

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  visible?: boolean;
}

interface FormConfig {
  fields?: FieldConfig[];
  layout?: string;
  type?: string;
}

let localConfigs: any = null;
let loadAttempted = false;

// Intentar cargar configuraciones locales
const loadLocalConfigs = async () => {
  if (loadAttempted) return localConfigs || {};
  loadAttempted = true;
  
  try {
    // Importar el archivo generado si existe
    // @vite-ignore - Ignorar análisis de Vite para imports dinámicos
    const module = await import('../.config/index');
    localConfigs = module.formConfigs || {};
    console.log('[formConfig] Configuraciones locales cargadas:', Object.keys(localConfigs));
    return localConfigs;
  } catch (error) {
    console.info('[formConfig] No hay configuraciones locales disponibles o aún no se han generado');
    localConfigs = {};
    return localConfigs;
  }
};

export const getFormConfig = async (formName: string): Promise<FormConfig | null> => {
  // Intentar cargar desde archivo local primero
  const configs = await loadLocalConfigs();
  if (configs && configs[formName]) {
    console.log(`[formConfig] Configuración encontrada para ${formName}`);
    return configs[formName];
  }

  console.log(`[formConfig] No se encontró configuración para ${formName}, usando orden predeterminado`);
  return null;
};

export const applyFieldOrder = <T extends { name?: string; [key: string]: any }>(
  fields: T[], 
  config: FormConfig | null
): T[] => {
  if (!config || !config.fields || config.fields.length === 0) {
    return fields;
  }

  // Crear mapa de orden basado en la configuración
  const orderMap = new Map<string, number>();
  config.fields.forEach((field, index) => {
    orderMap.set(field.name, field.order !== undefined ? field.order : index);
  });

  // Ordenar los campos según la configuración
  return [...fields].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    const orderA = orderMap.has(nameA) ? orderMap.get(nameA)! : 9999;
    const orderB = orderMap.has(nameB) ? orderMap.get(nameB)! : 9999;
    return orderA - orderB;
  });
};

export const getFieldLabel = (fieldName: string, defaultLabel: string, config: FormConfig | null): string => {
  if (!config || !config.fields) {
    return defaultLabel;
  }

  const field = config.fields.find(f => f.name === fieldName);
  return field?.label || defaultLabel;
};

export const getFormLayout = (config: FormConfig | null, defaultLayout: string = 'grid-2cols'): string => {
  return config?.layout || defaultLayout;
};

export const reloadConfig = () => {
  localConfigs = null;
  loadAttempted = false;
};
