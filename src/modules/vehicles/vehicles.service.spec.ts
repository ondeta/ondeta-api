import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { createPrismaMock, providePrisma } from '@/test/mocks';

describe('VehiclesService', () => {
  let service: VehiclesService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiclesService, providePrisma(prisma)],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    jest.clearAllMocks();
  });

  const mockCompanyAccess = () => {
    prisma.users.findFirst.mockResolvedValue({ id: 1 });
    prisma.memberships.findUnique.mockResolvedValue({
      user_id: 1,
      company_id: 10,
      company: { id: 10 },
    });
  };

  describe('create', () => {
    const dto = {
      name_vehicle: 'Van 01',
      plate: 'ABC1D23',
      device_identifier: ' device-1 ',
    };

    it('cria veículo quando dados são válidos', async () => {
      mockCompanyAccess();
      prisma.vehicles.findUnique.mockResolvedValue(null);
      prisma.companies.findUnique.mockResolvedValue({ id: 10 });
      prisma.vehicles.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create('uid', 10, dto);

      expect(prisma.vehicles.create).toHaveBeenCalledWith({
        data: {
          company_id: 10,
          name_vehicle: dto.name_vehicle,
          plate: dto.plate,
          device_identifier: 'device-1',
        },
      });
      expect(result.id).toBe(1);
    });

    it('lança ConflictException quando placa já existe', async () => {
      mockCompanyAccess();
      prisma.vehicles.findUnique.mockResolvedValue({ id: 99 });

      await expect(service.create('uid', 10, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('lança NotFoundException quando veículo não existe', async () => {
      prisma.vehicles.findUnique.mockResolvedValue(null);

      await expect(service.findById('uid', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lança ForbiddenException quando usuário não tem acesso', async () => {
      prisma.vehicles.findUnique.mockResolvedValue({
        id: 1,
        company_id: 10,
      });
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.memberships.findUnique.mockResolvedValue(null);

      await expect(service.findById('uid', 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('remove veículo e localizações associadas', async () => {
      mockCompanyAccess();
      prisma.vehicles.findUnique.mockResolvedValue({
        id: 1,
        company_id: 10,
      });
      prisma.vehicles.delete.mockResolvedValue({ id: 1 });

      await service.delete('uid', 1);

      expect(prisma.vehicle_locations.deleteMany).toHaveBeenCalledWith({
        where: { vehicle_id: 1 },
      });
      expect(prisma.service_requests.updateMany).toHaveBeenCalled();
    });
  });
});
