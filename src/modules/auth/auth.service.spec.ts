import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountType } from '@/shared/enums';
import {
  createFirebaseMock,
  createPrismaMock,
  provideFirebase,
  providePrisma,
} from '@/test/mocks';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = createPrismaMock();
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        providePrisma(prisma),
        provideFirebase(firebase),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) =>
      callback(prisma),
    );
  });

  describe('registerUser', () => {
    const dto = {
      full_name: 'João Silva',
      email: 'joao@example.com',
      password: 'secret123',
      cpf: '12345678901',
      phone_number: '11999999999',
    };

    it('registra usuário com sucesso', async () => {
      firebase.createUser.mockResolvedValue({ uid: 'firebase-uid' });
      firebase.setCustomUserClaims.mockResolvedValue(undefined);
      prisma.auth_accounts.create.mockResolvedValue({ id: 1 });
      prisma.users.create.mockResolvedValue({ id: 1, auth_account: {} });

      const result = await service.registerUser(dto);

      expect(result.message).toBe('User registered successfully');
      expect(firebase.createUser).toHaveBeenCalledWith({
        displayName: dto.full_name,
        email: dto.email,
        password: dto.password,
      });
      expect(firebase.setCustomUserClaims).toHaveBeenCalledWith(
        'firebase-uid',
        {
          account_type: AccountType.User,
        },
      );
    });

    it('remove usuário do Firebase quando a transação falha', async () => {
      firebase.createUser.mockResolvedValue({ uid: 'firebase-uid' });
      firebase.setCustomUserClaims.mockResolvedValue(undefined);
      prisma.$transaction.mockRejectedValueOnce(new Error('db error'));

      await expect(service.registerUser(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(firebase.deleteUser).toHaveBeenCalledWith('firebase-uid');
    });
  });

  describe('login', () => {
    it('retorna tokens do Firebase', async () => {
      const tokens = {
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      };
      firebase.signInWithEmailAndPassword.mockResolvedValue(tokens);

      await expect(
        service.login({ email: 'a@b.com', password: 'pass' }),
      ).resolves.toEqual(tokens);
    });
  });

  describe('logout', () => {
    it('revoga refresh token do usuário', async () => {
      firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
      firebase.revokeRefreshToken.mockResolvedValue(undefined);

      await service.logout('token');

      expect(firebase.verifyIdToken).toHaveBeenCalledWith('token');
      expect(firebase.revokeRefreshToken).toHaveBeenCalledWith('uid-1');
    });
  });

  describe('refreshToken', () => {
    it('delega ao Firebase', async () => {
      const refreshed = {
        idToken: 'new-id',
        refreshToken: 'new-refresh',
        expiresIn: '3600',
      };
      firebase.refreshAuthToken.mockResolvedValue(refreshed);

      await expect(service.refreshToken('refresh')).resolves.toEqual(refreshed);
    });
  });

  describe('updatePassword', () => {
    it('rejeita quando a nova senha é igual à atual', async () => {
      await expect(
        service.updatePassword('uid', 'a@b.com', 'same', 'same'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejeita quando a senha atual está incorreta', async () => {
      firebase.signInWithEmailAndPassword.mockRejectedValue(
        new Error('invalid'),
      );

      await expect(
        service.updatePassword('uid', 'a@b.com', 'wrong', 'new-pass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('atualiza senha e revoga tokens', async () => {
      firebase.signInWithEmailAndPassword.mockResolvedValue({});
      firebase.updatePassword.mockResolvedValue(undefined);
      firebase.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await service.updatePassword(
        'uid',
        'a@b.com',
        'old-pass',
        'new-pass',
      );

      expect(result.message).toBe('Password updated successfully');
      expect(firebase.updatePassword).toHaveBeenCalledWith('uid', 'new-pass');
      expect(firebase.revokeRefreshToken).toHaveBeenCalledWith('uid');
    });
  });

  describe('convertToCompany', () => {
    const dto = {
      name_company: 'Empresa X',
      cnpj: '12345678000199',
      phone_number: '11999999999',
      description: 'Desc',
      country: 'BR',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Centro',
      street: 'Rua A',
      number: '10',
      zip_code: '01001000',
    };

    it('lança NotFoundException quando auth account não existe', async () => {
      prisma.auth_accounts.findUnique.mockResolvedValue(null);

      await expect(service.convertToCompany('uid', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lança ConflictException quando usuário já possui empresa', async () => {
      prisma.auth_accounts.findUnique.mockResolvedValue({ id: 1 });
      prisma.users.findUnique.mockResolvedValue({ id: 10 });
      prisma.companies.findUnique.mockResolvedValue({ id: 99 });

      await expect(service.convertToCompany('uid', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('converte usuário em empresa com sucesso', async () => {
      prisma.auth_accounts.findUnique.mockResolvedValue({ id: 1 });
      prisma.users.findUnique.mockResolvedValue({ id: 10 });
      prisma.companies.findUnique.mockResolvedValue(null);
      prisma.companies.create.mockResolvedValue({ id: 5 });
      prisma.memberships.create.mockResolvedValue({ id: 1 });
      firebase.setCustomUserClaims.mockResolvedValue(undefined);
      prisma.auth_accounts.update.mockResolvedValue({});

      const result = await service.convertToCompany('uid', dto);

      expect(result.message).toBe('Successfully converted to company');
      expect(firebase.setCustomUserClaims).toHaveBeenCalledWith('uid', {
        account_type: AccountType.Company,
      });
    });
  });
});
