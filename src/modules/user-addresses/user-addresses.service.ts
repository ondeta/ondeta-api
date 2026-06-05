import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Injectable()
export class UserAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(firebaseUid: string, data: CreateUserAddressDto) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    const isDefault = data.is_default ?? false;

    if (isDefault) {
      await this.clearDefaultAddresses(user.id);
    }

    return this.prisma.user_addresses.create({
      data: {
        user_id: user.id,
        label: data.label,
        country: data.country,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        street: data.street,
        number: data.number,
        zip_code: data.zip_code,
        latitude: data.latitude,
        longitude: data.longitude,
        is_default: isDefault,
      },
    });
  }

  async findByUser(firebaseUid: string) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    return this.prisma.user_addresses.findMany({
      where: { user_id: user.id },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });
  }

  async findById(firebaseUid: string, addressId: number) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    const address = await this.getAddressOrThrow(addressId);
    this.validateAddressOwnership(user.id, address);
    return address;
  }

  async update(
    firebaseUid: string,
    addressId: number,
    data: UpdateUserAddressDto,
  ) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    const address = await this.getAddressOrThrow(addressId);
    this.validateAddressOwnership(user.id, address);

    if (data.is_default === true) {
      await this.clearDefaultAddresses(user.id, addressId);
    }

    return this.prisma.user_addresses.update({
      where: { id: addressId },
      data: {
        label: data.label ?? address.label,
        country: data.country ?? address.country,
        state: data.state ?? address.state,
        city: data.city ?? address.city,
        neighborhood: data.neighborhood ?? address.neighborhood,
        street: data.street ?? address.street,
        number: data.number ?? address.number,
        zip_code: data.zip_code ?? address.zip_code,
        latitude: data.latitude ?? address.latitude,
        longitude: data.longitude ?? address.longitude,
        is_default: data.is_default ?? address.is_default,
      },
    });
  }

  async delete(firebaseUid: string, addressId: number) {
    const user = await this.getUserByFirebaseUid(firebaseUid);
    const address = await this.getAddressOrThrow(addressId);
    this.validateAddressOwnership(user.id, address);

    return this.prisma.user_addresses.delete({
      where: { id: addressId },
    });
  }

  private async getAddressOrThrow(addressId: number) {
    const address = await this.prisma.user_addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  private validateAddressOwnership(
    userId: number,
    address: { user_id: number },
  ) {
    if (address.user_id !== userId) {
      throw new ForbiddenException('You can only access your own addresses');
    }
  }

  private async clearDefaultAddresses(
    userId: number,
    exceptAddressId?: number,
  ) {
    await this.prisma.user_addresses.updateMany({
      where: {
        user_id: userId,
        is_default: true,
        ...(exceptAddressId !== undefined
          ? { id: { not: exceptAddressId } }
          : {}),
      },
      data: { is_default: false },
    });
  }

  private async getUserByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        auth_account: {
          firebase_uid: firebaseUid,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
