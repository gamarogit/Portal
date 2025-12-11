import api from './api';

export interface FieldConfig {
    name: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    visible?: boolean;
}

export interface FormConfig {
    fields?: FieldConfig[];
    layout?: string;
    type?: string;
}

export const getFormConfig = async (formName: string): Promise<FormConfig | null> => {
    try {
        console.log(`[formConfigApi] Solicitando configuración para ${formName}...`);
        // Agregar timestamp para evitar cache del navegador
        const response = await api.get(`/form-config/${formName}?t=${Date.now()}`);
        console.log(`[formConfigApi] Respuesta GET para ${formName}:`, response.status, Object.keys(response.data || {}));

        if (response.data) {
            console.log(`[formConfigApi] Configuración remota cargada. Keys:`, Object.keys(response.data));

            // Si es un string, intentar parsear (por si acaso)
            if (typeof response.data === 'string') {
                try {
                    const parsed = JSON.parse(response.data);
                    console.log('[formConfigApi] Parseado desde string:', Object.keys(parsed));
                    return parsed;
                } catch (e) {
                    console.error('[formConfigApi] Error al parsear string:', e);
                }
            }

            // Si tiene la propiedad 'config' y NO 'fields', es probable que sea el wrapper de la BD
            // (Aunque el backend actual devuelve config.config, vale la pena mantener esto por si cambia)
            if (response.data.config && !response.data.fields) {
                console.log('[formConfigApi] Desempaquetando objeto config anidado...');
                return typeof response.data.config === 'string'
                    ? JSON.parse(response.data.config)
                    : response.data.config;
            }

            return response.data;
        }
    } catch (error) {
        console.warn(`[formConfigApi] No se pudo cargar configuración remota para ${formName}`, error);
    }
    return null;
};

export const saveFormConfig = async (formName: string, config: FormConfig): Promise<void> => {
    try {
        console.log(`[formConfigApi] Guardando configuración para ${formName}:`, JSON.stringify(config));
        // Enviar la configuración directamente, sin envolverla en { config }
        // Esto evita que se guarde como { config: { fields: ... } } en la BD
        const response = await api.post(`/form-config/${formName}`, config);
        console.log(`[formConfigApi] Respuesta de guardado para ${formName}:`, response.status, response.data);
    } catch (error) {
        console.error(`[formConfigApi] Error al guardar configuración para ${formName}`, error);
        throw error;
    }
};
