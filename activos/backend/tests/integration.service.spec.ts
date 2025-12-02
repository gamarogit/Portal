global.fetch = jest.fn().mockResolvedValue({ ok: true });

import { IntegrationService } from 'src/modules/integration/integration.service';

const prismaMock = {
  integrationEvent: {
    create: jest.fn().mockResolvedValue({ id: 'evt-1', source: 'erp.sync', payload: { name: 'asset' }, status: 'PENDING' }),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({}),
  },
};

const messagingMock = {
  publish: jest.fn(),
};

const metricsMock = {
  incrementEmitted: jest.fn(),
  incrementSent: jest.fn(),
  incrementFailed: jest.fn(),
  observeDispatchDuration: jest.fn(),
};

describe('IntegrationService', () => {
  let service: IntegrationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IntegrationService(prismaMock as any, messagingMock as any, metricsMock as any);
  });

  it('crea eventos y los encola', async () => {
    const payload = { assetId: 'asset-1' };
    await expect(service.emit({ source: 'erp.sync', payload })).resolves.toHaveProperty('id', 'evt-1');
    expect(prismaMock.integrationEvent.create).toHaveBeenCalled();
    expect(messagingMock.publish).toHaveBeenCalledWith('integration.event', expect.any(Object));
  });

  it('marca como enviado si no hay endpoints', async () => {
    process.env.ERP_ENDPOINT = '';
    process.env.CMDB_ENDPOINT = '';
    prismaMock.integrationEvent.findMany.mockResolvedValue([{ id: 'evt-2', source: 'dummy', payload: {}, status: 'PENDING' }]);
    await service.dispatchPending();
    expect(prismaMock.integrationEvent.update).toHaveBeenCalledWith({
      where: { id: 'evt-2' },
      data: expect.objectContaining({ status: 'SENT' }),
    });
  });
});
