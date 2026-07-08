import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { Roles } from '@/shared/enums';
import { createPrismaMock, providePrisma } from '@/test/mocks';

describe('MembershipsService', () => {
  let service: MembershipsService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipsService, providePrisma(prisma)],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
    jest.clearAllMocks();
  });

  const adminAccessMocks = () => {
    prisma.users.findFirst.mockResolvedValue({ id: 1 });
    prisma.memberships.findUnique.mockResolvedValue({
      user_id: 1,
      company_id: 10,
      role: Roles.Admin,
      company: { id: 10, owner_user_id: 99 },
    });
  };

  describe('create', () => {
    it('rejeita quando company_id do body difere da URL', async () => {
      await expect(
        service.create('uid', 10, { company_id: 20, user_id: 2, role: Roles.Member }),
      ).rejects.toThrow(BadRequestException);
    });

    it('cria membership quando dados são válidos', async () => {
      adminAccessMocks();
      prisma.users.findUnique.mockResolvedValue({ id: 2 });
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.memberships.findUnique
        .mockResolvedValueOnce({
          user_id: 1,
          company_id: 10,
          role: Roles.Admin,
          company: { id: 10, owner_user_id: 99 },
        })
        .mockResolvedValueOnce(null);
      prisma.memberships.create.mockResolvedValue({ id: 1 });

      const result = await service.create('uid', 10, {
        company_id: 10,
        user_id: 2,
        role: Roles.Member,
      });

      expect(result).toEqual({ id: 1 });
    });

    it('lança ConflictException quando usuário já é membro', async () => {
      adminAccessMocks();
      prisma.users.findUnique.mockResolvedValue({ id: 2 });
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.memberships.findUnique
        .mockResolvedValueOnce({
          user_id: 1,
          company_id: 10,
          role: Roles.Admin,
          company: { id: 10, owner_user_id: 99 },
        })
        .mockResolvedValueOnce({ id: 99 });

      await expect(
        service.create('uid', 10, {
          company_id: 10,
          user_id: 2,
          role: Roles.Member,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUserId', () => {
    it('retorna memberships do próprio usuário', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 5 });
      prisma.users.findUnique.mockResolvedValue({ id: 5 });
      prisma.memberships.findMany.mockResolvedValue([{ id: 1 }]);

      await expect(service.findByUserId('uid', 5)).resolves.toEqual([{ id: 1 }]);
    });

    it('lança ForbiddenException ao consultar memberships de outro usuário', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 5 });

      await expect(service.findByUserId('uid', 99)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findById', () => {
    it('lança NotFoundException quando membership não existe', async () => {
      prisma.memberships.findUnique.mockResolvedValue(null);

      await expect(service.findById('uid', 10, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('impede remoção do owner da empresa', async () => {
      prisma.memberships.findUnique.mockResolvedValue({
        id: 1,
        user_id: 99,
        company_id: 10,
        role: Roles.Owner,
        company: { owner_user_id: 99 },
      });

      await expect(service.remove('uid', 10, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
