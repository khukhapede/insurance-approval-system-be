import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Request,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { VerifyClaimDto } from './dto/verify-claim.dto';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  // ==================== USER ENDPOINTS ====================

  @Post()
  @Roles(UserRole.USER)
  create(
    @Body() createClaimDto: CreateClaimDto,
    @GetUser('userId') userId: string,
    @Request() req,
  ) {
    return this.claimsService.create(createClaimDto, userId, req);
  }

  @Get('my-claims')
  @Roles(UserRole.USER)
  findMyClaims(@GetUser('userId') userId: string) {
    return this.claimsService.findMyClaims(userId);
  }

  @Patch(':id')
  @Roles(UserRole.USER)
  update(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @GetUser('userId') userId: string,
    @Request() req,
  ) {
    return this.claimsService.update(id, updateClaimDto, userId, req);
  }

  @Put(':id/submit')
  @Roles(UserRole.USER)
  submit(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @Request() req,
  ) {
    return this.claimsService.submit(id, userId, req);
  }

  // ==================== VERIFIER ENDPOINTS ====================

  @Get('submitted')
  @Roles(UserRole.VERIFIER)
  findSubmittedClaims() {
    return this.claimsService.findSubmittedClaims();
  }

  @Put(':id/verify')
  @Roles(UserRole.VERIFIER)
  verify(
    @Param('id') id: string,
    @Body() verifyClaimDto: VerifyClaimDto,
    @GetUser('userId') userId: string,
    @Request() req,
  ) {
    return this.claimsService.verify(id, verifyClaimDto, userId, req);
  }

  // ==================== APPROVER ENDPOINTS ====================

  @Get('verified')
  @Roles(UserRole.APPROVER)
  findVerifiedClaims() {
    return this.claimsService.findVerifiedClaims();
  }

  @Put(':id/approve')
  @Roles(UserRole.APPROVER)
  approve(
    @Param('id') id: string,
    @Body() approveClaimDto: ApproveClaimDto,
    @GetUser('userId') userId: string,
    @Request() req,
  ) {
    return this.claimsService.approve(id, approveClaimDto, userId, req);
  }

  @Put(':id/reject')
  @Roles(UserRole.APPROVER)
  reject(
    @Param('id') id: string,
    @Body() rejectClaimDto: RejectClaimDto,
    @GetUser('userId') userId: string,
    @Request() req,
  ) {
    return this.claimsService.reject(id, rejectClaimDto, userId, req);
  }

  // ==================== COMMON ENDPOINTS ====================

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @GetUser('role') userRole: string,
  ) {
    return this.claimsService.findOne(id, userId, userRole);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @GetUser('role') userRole: string,
  ) {
    return this.claimsService.remove(id, userId, userRole);
  }
}
