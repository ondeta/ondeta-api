import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('MembershipsController', () => {
  let controller: MembershipsController;
  const membershipsService = {
    create: jest.fn(),
    findByCompanyId: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    updateRole: jest.fn(),
    remove: jest.fn(),
  };
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipsController],
      providers: [
        { provide: MembershipsService, useValue: membershipsService },
        { provide: FirebaseService, useValue: firebase },
        providePrisma(prisma),
      ],
    }).compile();

    controller = module.get<MembershipsController>(MembershipsController);
    jest.clearAllMocks();
  });

  it('cria membership na empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    membershipsService.create.mockResolvedValue({ id: 1 });

    await expect(
      controller.create('token', 10, { user_id: 2 } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('lista memberships da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    membershipsService.findByCompanyId.mockResolvedValue([{ id: 1 }]);

    await expect(controller.listByCompany('token', 10)).resolves.toEqual([
      { id: 1 },
    ]);
  });

  it('busca membership por id', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    membershipsService.findById.mockResolvedValue({ id: 1 });

    await expect(controller.findById('token', 10, 1)).resolves.toEqual({
      id: 1,
    });
  });

  it('atualiza role do membership', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    membershipsService.updateRole.mockResolvedValue({ id: 1 });

    await expect(
      controller.updateRole('token', 10, 1, { role: 'admin' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('remove membership', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    membershipsService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('token', 10, 1)).resolves.toBeUndefined();
  });
});
