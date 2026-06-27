/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FirebaseService } from '@/firebase/firebase.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConvertToCompanyDto } from './dto/convert-to-company.dto';
import { AccountType, Roles } from '@/shared/enums';

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

  async convertToCompany(firebaseUid: string, dto: ConvertToCompanyDto) {
    const authAccount = await this.prisma.auth_accounts.findUnique({
      where: { firebase_uid: firebaseUid },
    });

    if (!authAccount) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.users.findUnique({
      where: { auth_account_id: authAccount.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verifica se o user já é owner de uma empresa
    const existingOwnedCompany = await this.prisma.companies.findUnique({
      where: { owner_user_id: user.id },
    });

    if (existingOwnedCompany) {
      throw new ConflictException('User already owns a company');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Criar a empresa
        const company = await tx.companies.create({
          data: {
            owner_user_id: user.id,
            name_company: dto.name_company,
            cnpj: dto.cnpj,
            phone_number: dto.phone_number,
            description: dto.description,
            country: dto.country,
            state: dto.state,
            city: dto.city,
            neighborhood: dto.neighborhood,
            street: dto.street,
            number: dto.number,
            zip_code: dto.zip_code,
            latitude: dto.latitude ? Number(dto.latitude) : null,
            longitude: dto.longitude ? Number(dto.longitude) : null,
          },
        });

        // Criar membership com role owner
        const membership = await tx.memberships.create({
          data: {
            user_id: user.id,
            company_id: company.id,
            role: Roles.Owner,
          },
        });

        // Atualizar account_type em Firebase
        await this.firebaseService.setCustomUserClaims(firebaseUid, {
          account_type: AccountType.Company,
        });

        // Atualizar account_type no banco
        await tx.auth_accounts.update({
          where: { id: authAccount.id },
          data: {
            account_type: AccountType.Company,
          },
        });

        return {
          user,
          company,
          membership,
        };
      });

      return {
        message: 'Successfully converted to company',
        data: result,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to convert to company');
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
