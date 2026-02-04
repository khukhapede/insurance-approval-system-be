import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { ClaimType } from '../entities/claim.entity';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0, { message: 'Claim amount must be at least 0' })
  claimAmount: number;

  @IsEnum(ClaimType, { message: 'Invalid claim type' })
  claimType: ClaimType;
}
