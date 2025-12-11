import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FormConfigService {
    constructor(private prisma: PrismaService) { }

    async getConfig(formName: string) {
        console.log(`[FormConfigService] getConfig buscando: ${formName}`);
        const config = await this.prisma.formConfig.findUnique({
            where: { formName },
        });
        console.log(`[FormConfigService] getConfig resultado:`, config ? 'Encontrado' : 'Null');
        if (config) {
            console.log(`[FormConfigService] Config data:`, JSON.stringify(config.config).substring(0, 100) + '...');
        }
        return config?.config || null;
    }

    async saveConfig(formName: string, config: any) {
        console.log(`[FormConfigService] saveConfig guardando para ${formName}...`);
        const result = await this.prisma.formConfig.upsert({
            where: { formName },
            update: { config },
            create: { formName, config },
        });
        console.log(`[FormConfigService] saveConfig resultado ID:`, result.id);
        console.log(`[FormConfigService] Guardado:`, JSON.stringify(result.config).substring(0, 100) + '...');
        return result;
    }
}
