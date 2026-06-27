import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserProfile(firebaseUid: string, data: UpdateUserProfileDto) {
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
      include: {
        auth_account: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.full_name || data.email) {
      await this.firebaseService.updateUserAccountProfile(firebaseUid, {
        displayName: data.full_name,
        email: data.email,
      });
    }

    const userUpdateData: {
      full_name?: string;
      cpf?: string;
      phone_number?: string;
    } = {};

    if (data.full_name !== undefined) {
      userUpdateData.full_name = data.full_name;
    }

    if (data.cpf !== undefined) {
      userUpdateData.cpf = data.cpf;
    }

    if (data.phone_number !== undefined) {
      userUpdateData.phone_number = data.phone_number;
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.email !== undefined) {
        await tx.auth_accounts.update({
          where: { id: user.auth_account_id },
          data: { email: data.email },
        });
      }

      return tx.users.update({
        where: { id: user.id },
        data: userUpdateData,
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
    });
  }
}
