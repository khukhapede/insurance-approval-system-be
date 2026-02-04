import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityAction } from './entities/activity-log.entity';
import { ClaimStatusEnum } from './entities/activity-log.entity';

export interface CreateActivityLogDto {
  claimId: string;
  performedById: string;
  action: ActivityAction;
  previousStatus?: ClaimStatusEnum;
  newStatus?: ClaimStatusEnum;
  comment?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogsRepository: Repository<ActivityLog>,
  ) {}

async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
  const activityLog = this.activityLogsRepository.create({
    action: createActivityLogDto.action,
    previousStatus: createActivityLogDto.previousStatus,
    newStatus: createActivityLogDto.newStatus,
    comment: createActivityLogDto.comment,
    ipAddress: createActivityLogDto.ipAddress,
    userAgent: createActivityLogDto.userAgent,
  });

  // Set relations separately
  activityLog.claim = { id: createActivityLogDto.claimId } as any;
  activityLog.performedBy = { id: createActivityLogDto.performedById } as any;

  return await this.activityLogsRepository.save(activityLog);
}
  async findByClaimId(claimId: string): Promise<ActivityLog[]> {
    return await this.activityLogsRepository.find({
      where: { claim: { id: claimId } },
      relations: ['performedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<ActivityLog[]> {
    return await this.activityLogsRepository.find({
      where: { performedBy: { id: userId } },
      relations: ['claim', 'performedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<ActivityLog[]> {
    return await this.activityLogsRepository.find({
      relations: ['claim', 'performedBy'],
      order: { createdAt: 'DESC' },
    });
  }
}