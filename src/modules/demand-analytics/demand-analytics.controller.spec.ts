import { Test, TestingModule } from '@nestjs/testing';
import { DemandAnalyticsController } from './demand-analytics.controller';
import { DemandAnalyticsService } from './demand-analytics.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { createFirebaseMock } from '@/test/mocks';

describe('DemandAnalyticsController', () => {
  let controller: DemandAnalyticsController;
  const demandAnalyticsService = {
    getDemand: jest.fn(),
  };
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandAnalyticsController],
      providers: [
        { provide: DemandAnalyticsService, useValue: demandAnalyticsService },
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    controller = module.get<DemandAnalyticsController>(
      DemandAnalyticsController,
    );
    jest.clearAllMocks();
  });

  it('busca demanda agregada da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    demandAnalyticsService.getDemand.mockResolvedValue({ demand: [] });

    await expect(
      controller.getDemand('token', 10, { period: 'month' } as never),
    ).resolves.toEqual({ demand: [] });
  });
});
