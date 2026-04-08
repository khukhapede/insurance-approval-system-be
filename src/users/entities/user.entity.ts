import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Claim } from '../../claims/entities/claim.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';

export enum UserRole {
  USER = 'user',
  VERIFIER = 'verifier',
  APPROVER = 'approver',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Claim, (claim) => claim.createdBy)
  createdClaims: Claim[];

  @OneToMany(() => Claim, (claim) => claim.verifiedBy)
  verifiedClaims: Claim[];

  @OneToMany(() => Claim, (claim) => claim.approvedBy)
  approvedClaims: Claim[];

  @OneToMany(() => ActivityLog, (log) => log.performedBy)
  activityLogs: ActivityLog[];
}
