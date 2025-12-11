import { MovementService } from 'src/modules/movement/movement.service';

const prismaMock = {
  movement: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'mov-1', assetId: 'asset-1' }),
  },
  $transaction: jest.fn().mockImplementation((cb) => cb(prismaMock)),
};

const messagingMock = {
  publish: jest.fn(),
};

const auditMock = {
  log: jest.fn(),
};

describe('MovementService', () => {
  let service: MovementService;

  beforeEach(() => {
    service = new MovementService(prismaMock as any, messagingMock as any, auditMock as any);
  });

  it('lists movements', async () => {
    await expect(service.findAll()).resolves.toEqual([]);
    expect(prismaMock.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.any(Object) }),
    );
  });

  it('creates movement and publishes event', async () => {
    const dto = { assetId: 'asset-1', movementType: 'ALTA' as const };
    const movement = await service.create(dto);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(auditMock.log).toHaveBeenCalledWith(
      expect.objectContaining({ entity: 'Movement', assetId: movement.assetId }),
    );
    expect(messagingMock.publish).toHaveBeenCalledWith('movement.created', movement);
  });
});
