/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FirebaseService } from '@/firebase/firebase.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';

export function AccountTypeGuard(...allowedTypes: string[]): Type<CanActivate> {
  @Injectable()
  class AccountTypeGuardMixin implements CanActivate {
    constructor(private readonly firebaseService: FirebaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        return false;
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        return false;
      }

      try {
        const decodedToken = await this.firebaseService.verifyIdToken(token);
        const accountType = decodedToken.account_type;
        return allowedTypes.includes(accountType);
      } catch {
        return false;
      }
    }
  }

  return mixin(AccountTypeGuardMixin);
}
