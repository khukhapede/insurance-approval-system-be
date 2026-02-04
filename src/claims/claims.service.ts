import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Claim, ClaimStatus } from './entities/claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { VerifyClaimDto } from './dto/verify-claim.dto';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import {
  ActivityAction,
  ClaimStatusEnum,
} from '../activity-logs/entities/activity-log.entity';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimsRepository: Repository<Claim>,
    private activityLogsService: ActivityLogsService,
    private dataSource: DataSource,
  ) {}

  async create(
    createClaimDto: CreateClaimDto,
    userId: string,
    req: any,
  ): Promise<Claim> {
    const claim = this.claimsRepository.create({
      ...createClaimDto,
      createdBy: { id: userId } as any,
      status: ClaimStatus.DRAFT,
    });

    const savedClaim = await this.claimsRepository.save(claim);

    // Log activity
    await this.activityLogsService.create({
      claimId: savedClaim.id,
      performedById: userId,
      action: ActivityAction.CREATED,
      newStatus: ClaimStatusEnum.DRAFT,
      comment: 'Claim created',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const createdClaim = await this.claimsRepository.findOne({
      where: { id: savedClaim.id },
      relations: ['createdBy'],
    });

    if (!createdClaim) {
      throw new NotFoundException('Claim not found');
    }

    return createdClaim;
  }

  async findMyClaims(userId: string): Promise<Claim[]> {
    return await this.claimsRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy', 'verifiedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSubmittedClaims(): Promise<Claim[]> {
    return await this.claimsRepository.find({
      where: { status: ClaimStatus.SUBMITTED },
      relations: ['createdBy'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findVerifiedClaims(): Promise<Claim[]> {
    return await this.claimsRepository.find({
      where: { status: ClaimStatus.VERIFIED },
      relations: ['createdBy', 'verifiedBy'],
      order: { verifiedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Claim> {
    const claim = await this.claimsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'verifiedBy', 'approvedBy'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    // Check authorization - users can only see their own claims
    if (userRole === 'user' && claim.createdBy.id !== userId) {
      throw new ForbiddenException('Not authorized to view this claim');
    }

    return claim;
  }

  async update(
    id: string,
    updateClaimDto: UpdateClaimDto,
    userId: string,
    req: any,
  ): Promise<Claim> {
    const claim = await this.claimsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.createdBy.id !== userId) {
      throw new ForbiddenException('Not authorized to update this claim');
    }

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException('Can only update claims in draft status');
    }

    Object.assign(claim, updateClaimDto);
    await this.claimsRepository.save(claim);

    // Log activity
    await this.activityLogsService.create({
      claimId: claim.id,
      performedById: userId,
      action: ActivityAction.UPDATED,
      previousStatus: ClaimStatusEnum.DRAFT,
      newStatus: ClaimStatusEnum.DRAFT,
      comment: 'Claim details updated',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const updatedClaim = await this.claimsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!updatedClaim) {
      throw new NotFoundException('Claim not found');
    }

    return updatedClaim;
  }

  async submit(id: string, userId: string, req: any): Promise<Claim> {
    // Use transaction with pessimistic lock to prevent race conditions
    return await this.dataSource.transaction(async (manager) => {
      const claim = await manager.findOne(Claim, {
        where: { id },
        relations: ['createdBy'],
        // lock: { mode: 'pessimistic_write' }, // 🔒 Row-level lock
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.createdBy.id !== userId) {
        throw new ForbiddenException('Not authorized to submit this claim');
      }

      if (claim.status !== ClaimStatus.DRAFT) {
        throw new BadRequestException('Can only submit claims in draft status');
      }

      claim.status = ClaimStatus.SUBMITTED;
      claim.submittedAt = new Date();
      await manager.save(claim);

      // Log activity within transaction
      await this.activityLogsService.create({
        claimId: claim.id,
        performedById: userId,
        action: ActivityAction.SUBMITTED,
        previousStatus: ClaimStatusEnum.DRAFT,
        newStatus: ClaimStatusEnum.SUBMITTED,
        comment: 'Claim submitted for verification',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return claim;
    });
  }

  async verify(
    id: string,
    verifyClaimDto: VerifyClaimDto,
    userId: string,
    req: any,
  ): Promise<Claim> {
    // Use transaction with pessimistic lock
    return await this.dataSource.transaction(async (manager) => {
      const claim = await manager.findOne(Claim, {
        where: { id },
        relations: ['createdBy', 'verifiedBy'],
        // lock: { mode: 'pessimistic_write' },
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.status !== ClaimStatus.SUBMITTED) {
        throw new BadRequestException(
          'Can only verify claims in submitted status',
        );
      }

      claim.status = ClaimStatus.VERIFIED;
      claim.verifiedBy = { id: userId } as any;
      claim.verifiedAt = new Date();
      await manager.save(claim);

      // Log activity
      await this.activityLogsService.create({
        claimId: claim.id,
        performedById: userId,
        action: ActivityAction.VERIFIED,
        previousStatus: ClaimStatusEnum.SUBMITTED,
        newStatus: ClaimStatusEnum.VERIFIED,
        comment: verifyClaimDto.comment || 'Claim verified',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return claim;
    });
  }

  async approve(
    id: string,
    approveClaimDto: ApproveClaimDto,
    userId: string,
    req: any,
  ): Promise<Claim> {
    return await this.dataSource.transaction(async (manager) => {
      const claim = await manager.findOne(Claim, {
        where: { id },
        relations: ['createdBy', 'verifiedBy', 'approvedBy'],
        // lock: { mode: 'pessimistic_write' },
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.status !== ClaimStatus.VERIFIED) {
        throw new BadRequestException(
          'Can only approve claims in verified status',
        );
      }

      claim.status = ClaimStatus.APPROVED;
      claim.approvedBy = { id: userId } as any;
      claim.approvedAt = new Date();
      await manager.save(claim);

      // Log activity
      await this.activityLogsService.create({
        claimId: claim.id,
        performedById: userId,
        action: ActivityAction.APPROVED,
        previousStatus: ClaimStatusEnum.VERIFIED,
        newStatus: ClaimStatusEnum.APPROVED,
        comment: approveClaimDto.comment || 'Claim approved',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return claim;
    });
  }

  async reject(
    id: string,
    rejectClaimDto: RejectClaimDto,
    userId: string,
    req: any,
  ): Promise<Claim> {
    return await this.dataSource.transaction(async (manager) => {
      const claim = await manager.findOne(Claim, {
        where: { id },
        relations: ['createdBy', 'verifiedBy', 'approvedBy'],
        // lock: { mode: 'pessimistic_write' },
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.status !== ClaimStatus.VERIFIED) {
        throw new BadRequestException(
          'Can only reject claims in verified status',
        );
      }

      claim.status = ClaimStatus.REJECTED;
      claim.approvedBy = { id: userId } as any;
      claim.rejectedAt = new Date();
      claim.rejectionReason = rejectClaimDto.reason;
      await manager.save(claim);

      // Log activity
      await this.activityLogsService.create({
        claimId: claim.id,
        performedById: userId,
        action: ActivityAction.REJECTED,
        previousStatus: ClaimStatusEnum.VERIFIED,
        newStatus: ClaimStatusEnum.REJECTED,
        comment: rejectClaimDto.reason,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return claim;
    });
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const claim = await this.claimsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.createdBy.id !== userId && userRole !== 'approver') {
      throw new ForbiddenException('Not authorized to delete this claim');
    }

    if (claim.status !== ClaimStatus.DRAFT && userRole !== 'approver') {
      throw new BadRequestException('Can only delete claims in draft status');
    }

    await this.claimsRepository.remove(claim);
  }
}
