/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from '@/firebase/firebase.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ROLES_KEY } from '@/common/decorators/roles/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new ForbiddenException('Missing authorization header');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new ForbiddenException('Invalid authorization header');
    }

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      const user = await this.prisma.users.findFirst({
        where: {
          auth_account: {
            firebase_uid: decodedToken.uid,
          },
        },
        include: {
          memberships: true,
        },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const companyId = parseInt(request.params.companyId, 10);
      if (isNaN(companyId)) {
        throw new ForbiddenException('Invalid company ID');
      }

      const membership = user.memberships.find(
        (m) => m.company_id === companyId,
      );

      if (!membership) {
        throw new ForbiddenException('User is not a member of this company');
      }

      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenException('User does not have the required role');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Invalid token');
    }
  }
}
