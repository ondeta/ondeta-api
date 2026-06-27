import { Test, TestingModule } from '@nestjs/testing';
import {
  ServiceRequestsController,
  CompanyServiceRequestsController,
} from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { FirebaseService } from '@/firebase/firebase.service';

describe('ServiceRequestsController', () => {
  let controller: ServiceRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceRequestsController, CompanyServiceRequestsController],
      providers: [
        {
          provide: ServiceRequestsService,
          useValue: {},
        },
        {
          provide: FirebaseService,
          useValue: { verifyIdToken: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ServiceRequestsController>(ServiceRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
