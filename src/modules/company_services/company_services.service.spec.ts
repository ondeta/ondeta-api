import { Test, TestingModule } from '@nestjs/testing';
import { CompanyServicesService } from './company_services.service';

describe('CompanyServicesService', () => {
  let service: CompanyServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyServicesService],
    }).compile();

    service = module.get<CompanyServicesService>(CompanyServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
