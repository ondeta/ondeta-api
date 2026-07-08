import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { VehicleLocationsController } from './vehicle-locations.controller';
import { VehicleLocationsService } from './vehicle-locations.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { createFirebaseMock } from '@/test/mocks';

describe('VehicleLocationsController', () => {
  let controller: VehicleLocationsController;
  const vehicleLocationsService = {
    reportLocation: jest.fn(),
    getLatestByServiceRequest: jest.fn(),
    findHistoryByServiceRequest: jest.fn(),
  };
  const serviceRequestsService = {
    startRouteByDevice: jest.fn(),
  };
  const firebase = createFirebaseMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleLocationsController],
      providers: [
        { provide: VehicleLocationsService, useValue: vehicleLocationsService },
        { provide: ServiceRequestsService, useValue: serviceRequestsService },
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    controller = module.get<VehicleLocationsController>(
      VehicleLocationsController,
    );
    jest.clearAllMocks();
  });

  it('inicia rota a partir do identificador do dispositivo', async () => {
    serviceRequestsService.startRouteByDevice.mockResolvedValue({ id: 1 });

    await expect(controller.startRoute('device-1')).resolves.toEqual({ id: 1 });
  });

  it('rejeita startRoute sem identificador de dispositivo', async () => {
    await expect(controller.startRoute(null)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('registra localização do veículo', async () => {
    vehicleLocationsService.reportLocation.mockResolvedValue({ id: 1 });

    await expect(
      controller.track('device-1', { latitude: 1 } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('busca última localização da solicitação', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehicleLocationsService.getLatestByServiceRequest.mockResolvedValue({
      id: 1,
    });

    await expect(controller.getLatest('token', 1)).resolves.toEqual({ id: 1 });
  });

  it('busca histórico da solicitação', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    vehicleLocationsService.findHistoryByServiceRequest.mockResolvedValue([
      { id: 1 },
    ]);

    await expect(controller.getHistory('token', 1, 50)).resolves.toEqual([
      { id: 1 },
    ]);
  });
});
