import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { FirebaseService } from '@/firebase/firebase.service';

@Controller('user-addresses')
export class UserAddressesController {
  constructor(
    private readonly userAddressesService: UserAddressesService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new address for the authenticated user' })
  async create(
    @IdToken() token: string,
    @Body() data: CreateUserAddressDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.userAddressesService.create(firebaseData.uid, data);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List addresses of the authenticated user' })
  async findByUser(@IdToken() token: string) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.userAddressesService.findByUser(firebaseData.uid);
  }

  @Get(':addressId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a user address' })
  async findById(
    @IdToken() token: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.userAddressesService.findById(firebaseData.uid, addressId);
  }

  @Patch(':addressId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user address' })
  async update(
    @IdToken() token: string,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() data: UpdateUserAddressDto,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.userAddressesService.update(firebaseData.uid, addressId, data);
  }

  @Delete(':addressId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a user address' })
  async delete(
    @IdToken() token: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.userAddressesService.delete(firebaseData.uid, addressId);
  }
}
