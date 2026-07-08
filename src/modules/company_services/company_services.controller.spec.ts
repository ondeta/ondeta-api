import { Test, TestingModule } from '@nestjs/testing';
import { CompanyServicesController } from './company_services.controller';
import { CompanyServicesService } from './company_services.service';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('CompanyServicesController', () => {
  let controller: CompanyServicesController;
  const companyServicesService = {
    create: jest.fn(),
    findAllCatalogByCompanyId: jest.fn(),
    findOneCatalog: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyServicesController],
      providers: [
        { provide: CompanyServicesService, useValue: companyServicesService },
        { provide: FirebaseService, useValue: firebase },
        providePrisma(prisma),
      ],
    }).compile();

    controller = module.get<CompanyServicesController>(
      CompanyServicesController,
    );
    jest.clearAllMocks();
  });

  it('cria um serviço da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companyServicesService.create.mockResolvedValue({ id: 1 });

    await expect(
      controller.create('token', 10, { name_service: 'Lavagem' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('lista serviços por empresa', async () => {
    companyServicesService.findAllCatalogByCompanyId.mockResolvedValue([
      { id: 1 },
    ]);

    await expect(controller.listByCompany(10)).resolves.toEqual([{ id: 1 }]);
  });

  it('busca serviço por id', async () => {
    companyServicesService.findOneCatalog.mockResolvedValue({ id: 1 });

    await expect(controller.findById(10, 1)).resolves.toEqual({ id: 1 });
  });

  it('atualiza serviço da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companyServicesService.update.mockResolvedValue({ id: 1 });

    await expect(
      controller.update('token', 10, 1, { name_service: 'Novo' } as never),
    ).resolves.toEqual({ id: 1 });
  });

  it('remove serviço da empresa', async () => {
    firebase.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });
    companyServicesService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('token', 10, 1)).resolves.toBeUndefined();
  });
});
