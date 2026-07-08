import { Test, TestingModule } from '@nestjs/testing';
import { UserAddressesController } from './user-addresses.controller';
import { UserAddressesService } from './user-addresses.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { createFirebaseMock } from '@/test/mocks';

describe('UserAddressesController', () => {
  let controller: UserAddressesController;
  const userAddressesService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAddressesController],
      providers: [
        { provide: UserAddressesService, useValue: userAddressesService },
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    controller = module.get<UserAddressesController>(UserAddressesController);
    jest.clearAllMocks();
  });

  it('cria endereço para o usuário autenticado', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    userAddressesService.create.mockResolvedValue({ id: 1 });

    await expect(
      controller.create('token', { city: 'SP' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('lista endereços do usuário autenticado', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    userAddressesService.findByUser.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findByUser('token')).resolves.toEqual([{ id: 1 }]);
  });

  it('busca endereço por id', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    userAddressesService.findById.mockResolvedValue({ id: 1 });

    await expect(controller.findById('token', 1)).resolves.toEqual({ id: 1 });
  });

  it('atualiza endereço', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    userAddressesService.update.mockResolvedValue({ id: 1 });

    await expect(
      controller.update('token', 1, { city: 'RJ' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('remove endereço', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    userAddressesService.delete.mockResolvedValue(undefined);

    await expect(controller.delete('token', 1)).resolves.toBeUndefined();
  });
});
