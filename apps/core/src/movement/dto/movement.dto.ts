// create-movement.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(['entry', 'exit', 'adjustment'])
  type: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  reason?: string;

  @IsString()
  createdBy?: string;
}
