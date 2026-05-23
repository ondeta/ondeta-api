/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as firebaseAdmin from 'firebase-admin';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { FirebaseConfigService } from './firebase-config.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [FirebaseService],
})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const firebaseConfigProvider = {
      provide: FirebaseConfigService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('FIREBASE_API_KEY');
        if (!apiKey) {
          throw new Error(
            'FIREBASE_API_KEY is not defined in environment variables',
          );
        }

        return new FirebaseConfigService(apiKey);
      },
    };

    const firebaseProvider = {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const credentials = configService.get<string>(
          'FIREBASE_ADMIN_CREDENTIALS',
        );
        if (!credentials) {
          throw new Error(
            'FIREBASE_ADMIN_CREDENTIALS is not defined in environment variables',
          );
        }

        const serviceAccount = await JSON.parse(credentials);
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccount),
        });

        return firebaseAdmin;
      },
    };
    return {
      module: FirebaseModule,
      providers: [firebaseConfigProvider, firebaseProvider, FirebaseService],
      exports: [firebaseConfigProvider, firebaseProvider, FirebaseService],
    };
  }
}
