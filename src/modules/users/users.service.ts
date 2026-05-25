import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
}
