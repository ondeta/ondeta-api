import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async registerUser(dto: RegisterUserDto) {
    return await this.firebaseService.createUser({
      displayName: dto.fullName,
      email: dto.email,
      password: dto.password,
    });
  }
}
