import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import {
  ServiceRequestsController,
  CompanyServiceRequestsController,
} from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '@/common/guards';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('ServiceRequestsController', () => {
  let controller: ServiceRequestsController;
  let companyController: CompanyServiceRequestsController;
  const serviceRequestsService = {
    create: jest.fn(),
    findByCompany: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    updateByUser: jest.fn(),
    cancelByUser: jest.fn(),
    acceptByCompany: jest.fn(),
    finishByCompany: jest.fn(),
    refuseByCompany: jest.fn(),
  };
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();
  const authGuard = { canActivate: jest.fn().mockResolvedValue(true) };
  const rolesGuard = { canActivate: jest.fn().mockResolvedValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        ServiceRequestsController,
        CompanyServiceRequestsController,
      ],
      providers: [
        { provide: ServiceRequestsService, useValue: serviceRequestsService },
        { provide: FirebaseService, useValue: firebase },
        providePrisma(prisma),
        { provide: AuthGuard, useValue: authGuard },
        { provide: RolesGuard, useValue: rolesGuard },
      ],
    }).compile();

    controller = module.get<ServiceRequestsController>(
      ServiceRequestsController,
    );
    companyController = module.get<CompanyServiceRequestsController>(
      CompanyServiceRequestsController,
    );
    jest.clearAllMocks();
  });

  it('lista solicitações do usuário autenticado', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.findByUser.mockResolvedValue([{ id: 1 }]);

    await expect(controller.listByUser('token')).resolves.toEqual([{ id: 1 }]);
  });

  it('busca uma solicitação do usuário por id', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.findById.mockResolvedValue({ id: 1 });

    await expect(controller.findById('token', 1)).resolves.toEqual({ id: 1 });
  });

  it('atualiza uma solicitação do usuário', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.updateByUser.mockResolvedValue({ id: 1 });

    await expect(
      controller.update('token', 1, { notes: 'Novo' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('cancela uma solicitação do usuário', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.cancelByUser.mockResolvedValue({ id: 1 });

    await expect(controller.cancel('token', 1)).resolves.toEqual({ id: 1 });
  });

  it('lista solicitações da empresa autenticada', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.findByCompany.mockResolvedValue([{ id: 1 }]);

    await expect(companyController.listByCompany('token', 10)).resolves.toEqual(
      [{ id: 1 }],
    );
  });

  it('busca uma solicitação da empresa e valida o vínculo', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.findById.mockResolvedValue({
      id: 1,
      company_id: 10,
    });

    await expect(
      companyController.findByIdForCompany('token', 10, 1),
    ).resolves.toEqual({
      id: 1,
      company_id: 10,
    });
  });

  it('rejeita quando a solicitação não pertence à empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.findById.mockResolvedValue({
      id: 1,
      company_id: 99,
    });

    await expect(
      companyController.findByIdForCompany('token', 10, 1),
    ).rejects.toThrow(ForbiddenException);
  });

  it('aceita uma solicitação da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.acceptByCompany.mockResolvedValue({ id: 1 });

    await expect(
      companyController.accept('token', 10, 1, { vehicle_id: 1 } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('finaliza uma solicitação da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.finishByCompany.mockResolvedValue({ id: 1 });

    await expect(companyController.finish('token', 10, 1)).resolves.toEqual({
      id: 1,
    });
  });

  it('recusa uma solicitação da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    serviceRequestsService.refuseByCompany.mockResolvedValue({ id: 1 });

    await expect(companyController.refuse('token', 10, 1)).resolves.toEqual({
      id: 1,
    });
  });
});
