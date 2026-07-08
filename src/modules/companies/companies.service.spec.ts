import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  createFirebaseMock,
  createPrismaMock,
  provideFirebase,
  providePrisma,
} from '@/test/mocks';

describe('CompaniesService', () => {
  let service: CompaniesService;
  const prisma = createPrismaMock();
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        providePrisma(prisma),
        provideFirebase(firebase),
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    jest.clearAllMocks();
  });

  describe('findAllCatalog', () => {
    it('retorna lista de empresas', async () => {
      const companies = [{ id: 1, name_company: 'Empresa A' }];
      prisma.companies.findMany.mockResolvedValue(companies);

      await expect(service.findAllCatalog()).resolves.toEqual(companies);
    });
  });

  describe('findOneCatalog', () => {
    it('retorna empresa quando encontrada', async () => {
      const company = { id: 1, name_company: 'Empresa A' };
      prisma.companies.findUnique.mockResolvedValue(company);

      await expect(service.findOneCatalog(1)).resolves.toEqual(company);
    });

    it('lança NotFoundException quando empresa não existe', async () => {
      prisma.companies.findUnique.mockResolvedValue(null);

      await expect(service.findOneCatalog(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCompanyProfile', () => {
    it('retorna perfil da empresa do owner', async () => {
      const user = {
        id: 10,
        auth_account: { email: 'owner@example.com', is_active: true },
      };
      const company = { id: 5, name_company: 'Empresa' };

      prisma.users.findFirst.mockResolvedValue(user);
      prisma.companies.findUnique.mockResolvedValue(company);

      const result = await service.getCompanyProfile('uid');

      expect(result.company).toEqual(company);
      expect(result.user_email).toBe('owner@example.com');
    });

    it('lança NotFoundException quando usuário não possui empresa', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 10, auth_account: {} });
      prisma.companies.findUnique.mockResolvedValue(null);

      await expect(service.getCompanyProfile('uid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCompanyProfile', () => {
    it('lança ForbiddenException quando usuário não é owner', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 10 });
      prisma.companies.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCompanyProfile('uid', { name_company: 'Nova' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteCompany', () => {
    it('exclui empresa e atualiza claims no Firebase', async () => {
      const user = {
        id: 10,
        auth_account: { firebase_uid: 'uid' },
      };
      const company = { id: 5 };

      prisma.users.findFirst.mockResolvedValue(user);
      prisma.companies.findUnique.mockResolvedValue(company);
      prisma.companies.delete.mockResolvedValue(company);
      firebase.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await service.deleteCompany('uid');

      expect(result.message).toBe('Company deleted successfully');
      expect(firebase.setCustomUserClaims).toHaveBeenCalledWith('uid', {
        account_type: 'user',
      });
    });
  });
});
