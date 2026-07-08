import { PrismaService } from '@/database/prisma/prisma.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export type PrismaMock = {
  users: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  auth_accounts: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  companies: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  memberships: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
  };
  vehicles: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
  };
  company_services: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
  };
  service_requests: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  vehicle_locations: {
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  user_addresses: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    updateMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

export const createPrismaMock = (): PrismaMock => {
  const mock: PrismaMock = {
    users: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auth_accounts: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    companies: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    memberships: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    vehicles: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    company_services: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    service_requests: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    vehicle_locations: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user_addresses: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  mock.$transaction.mockImplementation(
    async (callback: (tx: PrismaMock) => unknown) => callback(mock),
  );

  return mock;
};

export const createFirebaseMock = () => ({
  createUser: jest.fn(),
  setCustomUserClaims: jest.fn(),
  deleteUser: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  verifyIdToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  refreshAuthToken: jest.fn(),
  updatePassword: jest.fn(),
  updateUserAccountProfile: jest.fn(),
  updateUserProfile: jest.fn(),
});

export const createCacheMock = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

export const providePrisma = (mock: PrismaMock) => ({
  provide: PrismaService,
  useValue: mock,
});

export const provideFirebase = (mock: ReturnType<typeof createFirebaseMock>) => ({
  provide: FirebaseService,
  useValue: mock,
});

export const provideCache = (mock: ReturnType<typeof createCacheMock>) => ({
  provide: CACHE_MANAGER,
  useValue: mock,
});

export const createExecutionContext = (
  headers: Record<string, string> = {},
  params: Record<string, string> = {},
) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, params, user: undefined }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as never;
