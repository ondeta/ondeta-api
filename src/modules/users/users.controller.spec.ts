import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { MembershipsService } from '../memberships/memberships.service';
import { AuthService } from '../auth/auth.service';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
  };
  const membershipsService = {
    findByUserId: jest.fn(),
  };
  const authService = {
    updatePassword: jest.fn(),
  };
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: MembershipsService, useValue: membershipsService },
        { provide: AuthService, useValue: authService },
        providePrisma(prisma),
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('retorna perfil do usuário autenticado', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    usersService.getUserProfile.mockResolvedValue({ id: 1 });

    await expect(controller.profile('token')).resolves.toEqual({
      firebase: { uid: 'uid-1' },
      profile: { id: 1 },
    });
  });

  it('atualiza perfil do usuário autenticado', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    usersService.updateUserProfile.mockResolvedValue({
      id: 1,
      full_name: 'Novo',
    });

    await expect(
      controller.updateProfile('token', { full_name: 'Novo' } as never),
    ).resolves.toEqual({
      firebase: { uid: 'uid-1' },
      profile: { id: 1, full_name: 'Novo' },
    });
  });

  it('atualiza senha quando validações passam', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    prisma.users.findFirst.mockResolvedValue({
      auth_account: { email: 'user@example.com' },
    });
    authService.updatePassword.mockResolvedValue({ message: 'ok' });

    await expect(
      controller.updatePassword('token', {
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      } as never),
    ).resolves.toEqual({ message: 'ok' });

    expect(authService.updatePassword).toHaveBeenCalledWith(
      'uid-1',
      'user@example.com',
      'old',
      'new',
    );
  });

  it('rejeita atualização de senha quando o usuário não existe', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    prisma.users.findFirst.mockResolvedValue(null);

    await expect(
      controller.updatePassword('token', {
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('retorna memberships do usuário consultado', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    membershipsService.findByUserId.mockResolvedValue([{ id: 1 }]);

    await expect(controller.getMemberships('token', 10)).resolves.toEqual([
      { id: 1 },
    ]);

    expect(membershipsService.findByUserId).toHaveBeenCalledWith('uid-1', 10);
  });
});
