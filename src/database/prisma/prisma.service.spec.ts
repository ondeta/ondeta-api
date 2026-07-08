jest.mock('generated/prisma/client', () => ({
  PrismaClient: class PrismaClientMock {
    constructor() {}
  },
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeAll(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('instancia PrismaService', () => {
    expect(new PrismaService()).toBeInstanceOf(PrismaService);
  });
});
