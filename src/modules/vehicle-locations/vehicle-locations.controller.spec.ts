import { Test, TestingModule } from '@nestjs/testing';
import { VehicleLocationsController } from './vehicle-locations.controller';
import { VehicleLocationsService } from './vehicle-locations.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';

describe('VehicleLocationsController', () => {
  let controller: VehicleLocationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleLocationsController],
      providers: [
        {
          provide: VehicleLocationsService,
          useValue: {},
        },
        {
          provide: ServiceRequestsService,
          useValue: {},
        },
        {
          provide: FirebaseService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<VehicleLocationsController>(
      VehicleLocationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
