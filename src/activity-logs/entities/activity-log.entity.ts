import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Claim } from '../../claims/entities/claim.entity';
import { User } from '../../users/entities/user.entity';

export enum ActivityAction {
  CREATED = 'created',
  UPDATED = 'updated',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ClaimStatusEnum {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Claim, (claim) => claim.activityLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'claim_id' })
  claim: Claim;

  @ManyToOne(() => User, (user) => user.activityLogs, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'performed_by_id' })
  performedBy: User;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: ClaimStatusEnum,
    nullable: true,
  })
  previousStatus?: ClaimStatusEnum;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: ClaimStatusEnum,
    nullable: true,
  })
  newStatus?: ClaimStatusEnum;

  @Column({ 
    type: 'text', 
    nullable: true 
  })
  comment?: string;

  @Column({ 
    name: 'ip_address', 
    type: 'varchar',
    length: 45, 
    nullable: true 
  })
  ipAddress?: string;

  @Column({ 
    name: 'user_agent', 
    type: 'text', 
    nullable: true 
  })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}