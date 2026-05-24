/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { AccountType } from '@/shared/enums';

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
      account_type: AccountType.User,
    });

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const authAccount = await tx.auth_accounts.create({
          data: {
            firebase_uid: firebaseUser.uid,
            email: dto.email,
            account_type: AccountType.User,
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
      account_type: AccountType.Company,
    });

    try {
      const company = await this.prisma.$transaction(async (tx) => {
        const authAccount = await tx.auth_accounts.create({
          data: {
            firebase_uid: firebaseUser.uid,
            email: dto.email,
            account_type: AccountType.Company,
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

  async updatePassword(
    firebaseUid: string,
    email: string,
    currentPassword: string,
    newPassword: string,
  ) {
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different');
    }

    // Validar credenciais atuais
    try {
      await this.firebaseService.signInWithEmailAndPassword(
        email,
        currentPassword,
      );
    } catch {
      throw new BadRequestException('Current password is incorrect');
    }

    // Atualizar senha
    await this.firebaseService.updatePassword(firebaseUid, newPassword);

    // Revogar tokens (logout em todos os dispositivos)
    await this.firebaseService.revokeRefreshToken(firebaseUid);

    return { message: 'Password updated successfully' };
  }
}
