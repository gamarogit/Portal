import { AuditService } from 'src/modules/audit/audit.service';

const prismaMock = {
  auditLog: {
    create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'log-1', ...data })),
    findMany: jest.fn().mockResolvedValue([{ id: 'log-1', action: 'test' }]),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    service = new AuditService(prismaMock as any);
  });

  it('genera registros de auditoría', async () => {
    const data = {
      entity: 'Asset',
      entityId: 'asset-1',
      action: 'creado',
      changes: { name: 'Laptop' },
    };
    await expect(service.log(data)).resolves.toEqual(expect.objectContaining({ action: 'creado' }));
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({ data });
  });

  it('obtiene auditorías por activo', async () => {
    await expect(service.listByAsset('asset-1')).resolves.toEqual([{ id: 'log-1', action: 'test' }]);
    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
      where: { assetId: 'asset-1' },
      orderBy: { occurredAt: 'desc' },
    });
  });
});
