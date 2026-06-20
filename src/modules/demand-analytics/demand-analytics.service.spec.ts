import { Test, TestingModule } from '@nestjs/testing';
import { DemandAnalyticsService } from './demand-analytics.service';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('DemandAnalyticsService', () => {
  let service: DemandAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemandAnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            users: { findFirst: jest.fn() },
            memberships: { findUnique: jest.fn() },
            companies: { findUnique: jest.fn() },
            service_requests: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<DemandAnalyticsService>(DemandAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
