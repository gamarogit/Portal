import { IntegrationScheduler } from 'src/modules/integration/integration.scheduler';

describe('IntegrationScheduler', () => {
  it('llama a dispatchPending durante el cron', async () => {
    const serviceMock = {
      dispatchPending: jest.fn().mockResolvedValue([{ id: 'evt-1' }]),
    };
    const scheduler = new IntegrationScheduler(serviceMock as any);
    await scheduler.runCycle();
    expect(serviceMock.dispatchPending).toHaveBeenCalledWith(20);
  });
});
