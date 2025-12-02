import { AssetService } from 'src/modules/asset/asset.service';

const mockAssetDb = {
  id: 'asset-1',
  name: 'Laptop',
  state: 'ACTIVO',
  serialNumber: 'SN123',
  cost: 1500.50,
  operatingSystem: 'Windows 11',
  assetTypeId: 'type-1',
  locationId: 'loc-1',
  responsibleId: 'user-1',
  assetType: { id: 'type-1', name: 'Estación', description: null },
  location: { id: 'loc-1', name: 'HQ', type: 'office', description: null, createdAt: new Date(), updatedAt: new Date() },
  responsible: { id: 'user-1', name: 'Ana', email: 'ana@test.com', roleId: null, createdAt: new Date(), updatedAt: new Date() },
  purchaseDate: null,
  warrantyUntil: null,
  manufacturer: null,
  model: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAssetResponse = {
  id: 'asset-1',
  name: 'Laptop',
  state: 'ACTIVO',
  serialNumber: 'SN123',
  cost: 1500.50,
  operatingSystem: 'Windows 11',
  assetType: { name: 'Estación' },
  location: { name: 'HQ' },
  responsible: { name: 'Ana' },
};

const prismaMock = {
  asset: {
    findMany: jest.fn().mockResolvedValue([mockAssetDb]),
    findUnique: jest.fn().mockImplementation(({ where: { id } }) =>
      id === mockAssetDb.id ? Promise.resolve(mockAssetDb) : Promise.resolve(null),
    ),
    create: jest.fn().mockResolvedValue(mockAssetDb),
  },
  assetType: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
  location: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 'loc-1', name: 'HQ', type: 'general' }),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'ana@temp.local' }),
  },
};

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AssetService(prismaMock as any);
  });

  it('list assets', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockAssetResponse]);
    expect(prismaMock.asset.findMany).toHaveBeenCalledWith({
      include: {
        assetType: true,
        location: true,
        responsible: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('retrieves one asset by id', async () => {
    const result = await service.findOne(mockAssetDb.id);
    expect(result).toEqual(mockAssetResponse);
    expect(prismaMock.asset.findUnique).toHaveBeenCalledWith({
      where: { id: mockAssetDb.id },
      include: {
        assetType: true,
        location: true,
        responsible: true,
      },
    });
  });

  it('throws when asset not found', async () => {
    await expect(service.findOne('missing')).rejects.toThrow('Activo missing no encontrado');
  });

  it('creates an asset with catalog resolution', async () => {
    const dto = { name: 'Laptop', locationId: 'HQ', responsibleId: 'Ana' };
    const result = await service.create(dto as any);
    
    expect(result).toEqual(mockAssetResponse);
    expect(prismaMock.location.create).toHaveBeenCalled();
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(prismaMock.asset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ 
        name: 'Laptop',
        locationId: 'loc-1',
        responsibleId: 'user-1',
      }),
      include: {
        assetType: true,
        location: true,
        responsible: true,
      },
    });
  });
});
