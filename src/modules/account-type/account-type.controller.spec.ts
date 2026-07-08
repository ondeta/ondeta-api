import { Test, TestingModule } from '@nestjs/testing';
import { AccountTypeController } from './account-type.controller';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  createFirebaseMock,
  createPrismaMock,
  providePrisma,
} from '@/test/mocks';

describe('AccountTypeController', () => {
  let controller: AccountTypeController;
  const firebase = createFirebaseMock();
  const prisma = createPrismaMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountTypeController],
      providers: [
        { provide: FirebaseService, useValue: firebase },
        providePrisma(prisma),
      ],
    }).compile();

    controller = module.get<AccountTypeController>(AccountTypeController);
  });

  it('retorna mensagem de tipo user', () => {
    expect(controller.user()).toBe('User account type');
  });

  it('retorna mensagem de tipo company', () => {
    expect(controller.company()).toBe('Company account type');
  });

  it('retorna mensagem de owner', () => {
    expect(controller.testOwnerRole(10)).toBe(
      'User has Owner role in company 10',
    );
  });

  it('retorna mensagem de admin', () => {
    expect(controller.testAdminRole(10)).toBe(
      'User has Admin or Owner role in company 10',
    );
  });

  it('retorna mensagem de member', () => {
    expect(controller.testMemberRole(10)).toBe(
      'User has any role in company 10',
    );
  });
});
