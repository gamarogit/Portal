import { DepreciationService } from 'src/modules/depreciation/depreciation.service';

const prismaMock = {
  depreciation: {
    create: jest.fn().mockResolvedValue({
      id: 'dep-1',
      assetId: 'asset-1',
      method: 'SL',
      amount: 100,
      periodStart: new Date(),
      periodEnd: new Date(),
    }),
    findMany: jest.fn().mockResolvedValue([]),
  },
};

const auditMock = {
  log: jest.fn(),
};

describe('DepreciationService', () => {
  let service: DepreciationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DepreciationService(prismaMock as any, auditMock as any);
  });

  it('crea depreciación y registra auditoría', async () => {
    const dto = {
      assetId: 'asset-1',
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      amount: 120,
      method: 'SL',
    };
    const record = await service.create(dto, 'user-1');
    expect(prismaMock.depreciation.create).toHaveBeenCalled();
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({ entity: 'Depreciation', assetId: record.assetId }),
    );
  });

  it('lista depreciaciones por activo', async () => {
    await expect(service.findByAsset('asset-1')).resolves.toEqual([]);
    expect(prismaMock.depreciation.findMany).toHaveBeenCalledWith({
      where: { assetId: 'asset-1' },
      orderBy: { periodStart: 'desc' },
    });
  });
});
