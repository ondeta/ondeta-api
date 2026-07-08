import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  createFirebaseMock,
  createPrismaMock,
  provideFirebase,
  providePrisma,
} from '@/test/mocks';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = createPrismaMock();
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        providePrisma(prisma),
        provideFirebase(firebase),
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('retorna perfil quando usuário existe', async () => {
      const user = { id: 1, full_name: 'João' };
      prisma.users.findFirst.mockResolvedValue(user);

      await expect(service.getUserProfile('uid')).resolves.toEqual(user);
    });

    it('lança NotFoundException quando usuário não existe', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(service.getUserProfile('uid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserProfile', () => {
    const existingUser = {
      id: 1,
      auth_account_id: 2,
      auth_account: { id: 2, email: 'old@example.com' },
    };

    it('atualiza perfil no Firebase e no banco', async () => {
      prisma.users.findFirst.mockResolvedValue(existingUser);
      firebase.updateUserAccountProfile.mockResolvedValue(undefined);
      prisma.auth_accounts.update.mockResolvedValue({});
      prisma.users.update.mockResolvedValue({
        id: 1,
        full_name: 'Novo Nome',
      });

      const result = await service.updateUserProfile('uid', {
        full_name: 'Novo Nome',
        email: 'new@example.com',
      });

      expect(firebase.updateUserAccountProfile).toHaveBeenCalledWith('uid', {
        displayName: 'Novo Nome',
        email: 'new@example.com',
      });
      expect(result.full_name).toBe('Novo Nome');
    });

    it('lança NotFoundException quando usuário não existe', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(
        service.updateUserProfile('uid', { full_name: 'Nome' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
