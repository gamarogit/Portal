import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private emitted = 0;
  private sent = 0;
  private failed = 0;
  private lastDispatchMillis = 0;

  incrementEmitted() {
    this.emitted += 1;
  }

  incrementSent() {
    this.sent += 1;
  }

  incrementFailed() {
    this.failed += 1;
  }

  observeDispatchDuration(ms: number) {
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
}
