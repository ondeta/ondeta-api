import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DemandAnalyticsService } from './demand-analytics.service';
import { DemandAnalyticsQueryDto } from './dto/demand-analytics-query.dto';
import { DemandAnalyticsResponseDto } from './dto/demand-analytics-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IdToken } from '../auth/id-token.decorator';
import { FirebaseService } from '@/firebase/firebase.service';

@Controller('companies/:companyId/analytics')
export class DemandAnalyticsController {
  constructor(
    private readonly demandAnalyticsService: DemandAnalyticsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('demand')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get aggregated demand analytics for a company',
  })
  async getDemand(
    @IdToken() token: string,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query() query: DemandAnalyticsQueryDto,
  ): Promise<DemandAnalyticsResponseDto> {
    const firebaseData = await this.firebaseService.verifyIdToken(token);
    return this.demandAnalyticsService.getDemand(
      firebaseData.uid,
      companyId,
      query,
    );
  }
}
