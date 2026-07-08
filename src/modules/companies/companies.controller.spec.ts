import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '../auth/auth.service';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  const companiesService = {
    getCompanyProfile: jest.fn(),
    updateCompanyProfile: jest.fn(),
    updateCompanyAddress: jest.fn(),
    transferOwnership: jest.fn(),
    deleteCompany: jest.fn(),
    findAllCatalog: jest.fn(),
    findOneCatalog: jest.fn(),
  };
  const authService = {
    updatePassword: jest.fn(),
  };
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: companiesService },
        { provide: AuthService, useValue: authService },
        providePrisma(prisma),
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    jest.clearAllMocks();
  });

  it('retorna perfil da empresa autenticada', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companiesService.getCompanyProfile.mockResolvedValue({ id: 1 });

    await expect(controller.profile('token')).resolves.toEqual({
      firebase: { uid: 'uid-1' },
      profile: { id: 1 },
    });
  });

  it('atualiza perfil da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companiesService.updateCompanyProfile.mockResolvedValue({ id: 1 });

    await expect(
      controller.updateProfile('token', { name_company: 'Nova' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('atualiza endereço da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companiesService.updateCompanyAddress.mockResolvedValue({ id: 1 });

    await expect(
      controller.updateAddress('token', { city: 'SP' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('atualiza senha da conta da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    prisma.users.findFirst.mockResolvedValue({
      auth_account: { email: 'company@example.com' },
    });
    authService.updatePassword.mockResolvedValue({ message: 'ok' });

    await expect(
      controller.updatePassword('token', {
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      } as never),
    ).resolves.toEqual({ message: 'ok' });
  });

  it('rejeita atualização de senha quando as senhas não coincidem', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    prisma.users.findFirst.mockResolvedValue({
      auth_account: { email: 'company@example.com' },
    });

    await expect(
      controller.updatePassword('token', {
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'different',
      } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('transfere ownership da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companiesService.transferOwnership.mockResolvedValue({ message: 'ok' });

    await expect(
      controller.transferOwnership('token', { user_id: 2 } as never),
    ).resolves.toEqual({ message: 'ok' });
  });

  it('exclui empresa autenticada', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companiesService.deleteCompany.mockResolvedValue(undefined);

    await expect(controller.deleteCompany('token')).resolves.toBeUndefined();
  });

  it('lista empresas', async () => {
    companiesService.findAllCatalog.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }]);
  });

  it('busca empresa por id', async () => {
    companiesService.findOneCatalog.mockResolvedValue({ id: 1 });

    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
  });
});
