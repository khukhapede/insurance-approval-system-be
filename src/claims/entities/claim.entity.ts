import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ClaimType {
  MEDICAL = 'medical',
  ACCIDENT = 'accident',
  PROPERTY = 'property',
  LIFE = 'life',
  OTHER = 'other',
}

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'claim_number', unique: true, length: 50 })
  claimNumber: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({ name: 'claim_amount', type: 'decimal', precision: 15, scale: 2 })
  claimAmount: number;

  @Column({
    name: 'claim_type',
    type: 'enum',
    enum: ClaimType,
  })
  claimType: ClaimType;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.createdClaims)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.verifiedClaims, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy: User;

  @ManyToOne(() => User, (user) => user.approvedClaims, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @OneToMany(() => ActivityLog, (log) => log.claim)
  activityLogs: ActivityLog[];

  // Timestamps for workflow tracking
  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Auto-generate claim number before insert
  @BeforeInsert()
  generateClaimNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    this.claimNumber = `CLM-${year}-${random}`;
  }
}
