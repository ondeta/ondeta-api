import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VehicleLocationsService } from './vehicle-locations.service';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('VehicleLocationsService', () => {
  let service: VehicleLocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleLocationsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehicleLocationsService>(VehicleLocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
