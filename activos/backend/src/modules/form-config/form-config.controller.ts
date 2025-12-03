import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FormConfigService } from './form-config.service';

@Controller('form-config')
export class FormConfigController {
    constructor(private readonly service: FormConfigService) { }

    @Get(':formName')
    getConfig(@Param('formName') formName: string) {
        return this.service.getConfig(formName);
    }

    @Post(':formName')
    saveConfig(@Param('formName') formName: string, @Body() config: any) {
        console.log(`[Backend] saveConfig recibido para ${formName}:`, JSON.stringify(config));
        return this.service.saveConfig(formName, config);
    }
}
