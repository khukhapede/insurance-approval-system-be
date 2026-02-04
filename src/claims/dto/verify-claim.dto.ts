import { IsString, IsOptional } from 'class-validator';

export class VerifyClaimDto {
  @IsString()
  @IsOptional()
  comment?: string;
}
