import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async registerUser(dto: RegisterUserDto) {
    const user = await this.firebaseService.createUser({
      displayName: dto.fullName,
      email: dto.email,
      password: dto.password,
    });

    if (dto.account_type?.length) {
      await this.firebaseService.setCustomUserClaims(user.uid, {
        account_type: dto.account_type,
      });
    }

    return user;
  }
}
