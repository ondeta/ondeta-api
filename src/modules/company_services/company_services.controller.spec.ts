import { Test, TestingModule } from '@nestjs/testing';
import { CompanyServicesController } from './company_services.controller';
import { CompanyServicesService } from './company_services.service';

describe('CompanyServicesController', () => {
  let controller: CompanyServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyServicesController],
      providers: [CompanyServicesService],
    }).compile();

    controller = module.get<CompanyServicesController>(
      CompanyServicesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
