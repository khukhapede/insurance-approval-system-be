import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles(UserRole.VERIFIER, UserRole.APPROVER)
  findAll() {
    return this.activityLogsService.findAll();
  }

  @Get('claim/:claimId')
  findByClaimId(@Param('claimId') claimId: string) {
    return this.activityLogsService.findByClaimId(claimId);
  }

  @Get('my-activities')
  findMyActivities(@GetUser('userId') userId: string) {
    return this.activityLogsService.findByUserId(userId);
  }
}
