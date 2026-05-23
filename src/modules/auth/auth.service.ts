/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

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
