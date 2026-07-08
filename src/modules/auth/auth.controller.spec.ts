import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { createFirebaseMock } from '@/test/mocks';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    registerUser: jest.fn(),
    login: jest.fn(),
    convertToCompany: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('registra usuário', async () => {
    authService.registerUser.mockResolvedValue({ id: 1 });

    await expect(
      controller.register({ email: 'a@b.com' } as never),
    ).resolves.toEqual({
      id: 1,
    });

    expect(authService.registerUser).toHaveBeenCalledWith({
      email: 'a@b.com',
    });
  });

  it('faz login', async () => {
    authService.login.mockResolvedValue({ idToken: 'token' });

    await expect(
      controller.login({ email: 'a@b.com' } as never),
    ).resolves.toEqual({
      idToken: 'token',
    });
  });

  it('converte usuário em empresa usando o uid do token', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    authService.convertToCompany.mockResolvedValue({ message: 'ok' });

    await expect(
      controller.convertToCompany('token', {
        name_company: 'Empresa',
      } as never),
    ).resolves.toEqual({ message: 'ok' });

    expect(firebase.verifyIdToken).toHaveBeenCalledWith('token');
    expect(authService.convertToCompany).toHaveBeenCalledWith('uid-1', {
      name_company: 'Empresa',
    });
  });

  it('faz logout', async () => {
    authService.logout.mockResolvedValue(undefined);

    await expect(controller.logout('token')).resolves.toBeUndefined();

    expect(authService.logout).toHaveBeenCalledWith('token');
  });

  it('atualiza refresh token', async () => {
    authService.refreshToken.mockResolvedValue({ idToken: 'new-token' });

    await expect(
      controller.refreshAuth({ refreshToken: 'refresh' } as never),
    ).resolves.toEqual({ idToken: 'new-token' });
  });
});
