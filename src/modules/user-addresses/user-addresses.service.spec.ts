import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { createPrismaMock, providePrisma } from '@/test/mocks';

describe('UserAddressesService', () => {
  let service: UserAddressesService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAddressesService, providePrisma(prisma)],
    }).compile();

    service = module.get<UserAddressesService>(UserAddressesService);
    jest.clearAllMocks();
  });

  const baseDto = {
    label: 'Casa',
    country: 'BR',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Centro',
    street: 'Rua A',
    number: '10',
    zip_code: '01001000',
    latitude: -23.5,
    longitude: -46.6,
  };

  describe('create', () => {
    it('cria endereço para o usuário autenticado', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.user_addresses.create.mockResolvedValue({ id: 1, ...baseDto });

      const result = await service.create('uid', baseDto);

      expect(result.id).toBe(1);
      expect(prisma.user_addresses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ user_id: 1 }),
        }),
      );
    });

    it('remove default de outros endereços ao criar um default', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.user_addresses.create.mockResolvedValue({ id: 2 });

      await service.create('uid', { ...baseDto, is_default: true });

      expect(prisma.user_addresses.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user_id: 1, is_default: true }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('lança ForbiddenException para endereço de outro usuário', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.user_addresses.findUnique.mockResolvedValue({
        id: 10,
        user_id: 99,
      });

      await expect(service.findById('uid', 10)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('remove endereço do usuário', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.user_addresses.findUnique.mockResolvedValue({
        id: 10,
        user_id: 1,
      });
      prisma.user_addresses.delete.mockResolvedValue({ id: 10 });

      await expect(service.delete('uid', 10)).resolves.toEqual({ id: 10 });
    });

    it('lança NotFoundException quando endereço não existe', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.user_addresses.findUnique.mockResolvedValue(null);

      await expect(service.delete('uid', 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
