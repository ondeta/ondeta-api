import { Test, TestingModule } from '@nestjs/testing';
import { DemandAnalyticsController } from './demand-analytics.controller';
import { DemandAnalyticsService } from './demand-analytics.service';
import { FirebaseService } from '@/firebase/firebase.service';

describe('DemandAnalyticsController', () => {
  let controller: DemandAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandAnalyticsController],
      providers: [
        {
          provide: DemandAnalyticsService,
          useValue: {},
        },
        {
          provide: FirebaseService,
          useValue: { verifyIdToken: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<DemandAnalyticsController>(
      DemandAnalyticsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
