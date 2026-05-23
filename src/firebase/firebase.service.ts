import * as firebaseAdmin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { CreateRequest, UserRecord } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  async createUser(props: CreateRequest): Promise<UserRecord> {
    return await firebaseAdmin.auth().createUser(props);
  }
}
