/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UserRecord } from 'firebase-admin/auth';

@Injectable()
export class UsersService {
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

    if (dto.account_type?.length) {
      await this.firebaseService.setCustomUserClaims(firebaseUser.uid, {
        account_type: dto.account_type,
      });
    }

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const authAccount = await tx.auth_accounts.create({
          data: {
            firebase_uid: this.getFirebaseUserUid(firebaseUser),
            email: dto.email,
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

      return user;
    } catch {
      await this.firebaseService.deleteUser(
        this.getFirebaseUserUid(firebaseUser),
      );
      throw new Error('Failed to create user');
    }
  }

  async getUserProfile(firebaseUid: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
      include: {
        auth_account: {
          select: {
            email: true,
            is_active: true,
            created_at: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private getFirebaseUserUid(firebaseUser: UserRecord): string {
    return firebaseUser.uid;
  }
}
