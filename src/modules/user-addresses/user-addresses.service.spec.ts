import { Test, TestingModule } from '@nestjs/testing';
import { UserAddressesService } from './user-addresses.service';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('UserAddressesService', () => {
  let service: UserAddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAddressesService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserAddressesService>(UserAddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
