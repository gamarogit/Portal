import { AssetController } from 'src/modules/asset/asset.controller';

const assetMock = { id: 'asset-1', name: 'Laptop' };

describe('AssetController', () => {
  const serviceMock = {
    findAll: jest.fn().mockResolvedValue([assetMock]),
    findOne: jest.fn().mockResolvedValue(assetMock),
    create: jest.fn().mockResolvedValue(assetMock),
  };

  let controller: AssetController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AssetController(serviceMock as any);
  });

  it('lista activos', async () => {
    await expect(controller.findAll()).resolves.toEqual([assetMock]);
    expect(serviceMock.findAll).toHaveBeenCalled();
  });

  it('obtiene activo por id', async () => {
    await expect(controller.findOne('asset-1')).resolves.toEqual(assetMock);
  });
});
