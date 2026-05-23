/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const firebaseUser = await this.firebaseService.createUser({
      displayName: dto.full_name,
      email: dto.email,
      password: dto.password,
    });

    await this.firebaseService.setCustomUserClaims(firebaseUser.uid, {
      account_type: 'user',
    });

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const authAccount = await tx.auth_accounts.create({
          data: {
            firebase_uid: firebaseUser.uid,
            email: dto.email,
            account_type: 'user',
          },
        });

        return await tx.users.create({
          data: {
            auth_account_id: authAccount.id,
            full_name: dto.full_name,
            cpf: dto.cpf,
            phone_number: dto.phone_number,
          },
          include: {
            auth_account: true,
          },
        });
      });

      return {
        message: 'User registered successfully',
        data: user,
      };
    } catch {
      await this.firebaseService.deleteUser(firebaseUser.uid);
      throw new BadRequestException('Failed to create user account');
    }
  }

  async registerCompany(dto: RegisterCompanyDto) {
    const firebaseUser = await this.firebaseService.createUser({
      displayName: dto.name_company,
      email: dto.email,
      password: dto.password,
    });

    await this.firebaseService.setCustomUserClaims(firebaseUser.uid, {
      account_type: 'company',
    });

    try {
      const company = await this.prisma.$transaction(async (tx) => {
        const authAccount = await tx.auth_accounts.create({
          data: {
            firebase_uid: firebaseUser.uid,
            email: dto.email,
            account_type: 'company',
          },
        });

        return await tx.companies.create({
          data: {
            auth_account_id: authAccount.id,
            name_company: dto.name_company,
            cnpj: dto.cnpj,
            phone_number: dto.phone_number,
            description: dto.description,
          },
          include: {
            auth_account: true,
          },
        });
      });

      return {
        message: 'Company registered successfully',
        data: company,
      };
    } catch {
      await this.firebaseService.deleteUser(firebaseUser.uid);
      throw new BadRequestException('Failed to create company account');
    }
  }

  async login({ email, password }: LoginDto) {
    const { idToken, refreshToken, expiresIn } =
      await this.firebaseService.signInWithEmailAndPassword(email, password);
    return {
      idToken,
      refreshToken,
      expiresIn,
    };
  }

  async logout(token: string) {
    const { uid } = await this.firebaseService.verifyIdToken(token);
    return await this.firebaseService.revokeRefreshToken(uid);
  }

  async refreshToken(refreshToken: string) {
    return await this.firebaseService.refreshAuthToken(refreshToken);
  }
}
