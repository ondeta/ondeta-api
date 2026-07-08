import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  const vehiclesService = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCompanyId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        { provide: VehiclesService, useValue: vehiclesService },
        { provide: FirebaseService, useValue: firebase },
        providePrisma(prisma),
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
    jest.clearAllMocks();
  });

  it('cria veículo para a empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehiclesService.create.mockResolvedValue({ id: 1 });

    await expect(
      controller.create(10, { plate: 'ABC1D23' } as never, 'token'),
    ).resolves.toEqual({ id: 1 });
  });

  it('rejeita criação quando token é inválido', async () => {
    firebase.verifyIdToken.mockResolvedValue(null);

    await expect(
      controller.create(10, { plate: 'ABC1D23' } as never, 'token'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('busca veículo por id', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehiclesService.findById.mockResolvedValue({ id: 1 });

    await expect(controller.findById(1, 'token')).resolves.toEqual({ id: 1 });
  });

  it('lista veículos da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehiclesService.findByCompanyId.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findByCompanyId(10, 'token')).resolves.toEqual([
      { id: 1 },
    ]);
  });

  it('atualiza veículo', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehiclesService.update.mockResolvedValue({ id: 1 });

    await expect(
      controller.update(1, { name_vehicle: 'Novo' } as never, 'token'),
    ).resolves.toEqual({ id: 1 });
  });

  it('remove veículo', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehiclesService.delete.mockResolvedValue({ id: 1 });

    await expect(controller.delete(1, 'token')).resolves.toEqual({ id: 1 });
  });
});
