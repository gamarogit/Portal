"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = class MetricsService {
    constructor() {
        this.emitted = 0;
        this.sent = 0;
        this.failed = 0;
        this.lastDispatchMillis = 0;
    }
    incrementEmitted() {
        this.emitted += 1;
    }
    incrementSent() {
        this.sent += 1;
    }
    incrementFailed() {
        this.failed += 1;
    }
    observeDispatchDuration(ms) {
        this.lastDispatchMillis = ms;
    }
    metrics() {
        return [
            '# HELP activos_integration_events_emitted_total Total de eventos de integración emitidos',
            '# TYPE activos_integration_events_emitted_total counter',
            `activos_integration_events_emitted_total ${this.emitted}`,
            '# HELP activos_integration_events_sent_total Eventos marcados como enviados',
            '# TYPE activos_integration_events_sent_total counter',
            `activos_integration_events_sent_total ${this.sent}`,
            '# HELP activos_integration_events_failed_total Eventos marcados como fallidos',
            '# TYPE activos_integration_events_failed_total counter',
            `activos_integration_events_failed_total ${this.failed}`,
            '# HELP activos_integration_dispatch_duration_milliseconds Latencia de despacho',
            '# TYPE activos_integration_dispatch_duration_milliseconds gauge',
            `activos_integration_dispatch_duration_milliseconds ${this.lastDispatchMillis}`,
        ].join('\n') + '\n';
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
