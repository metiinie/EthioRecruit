import { IsEnum } from 'class-validator';
import { PreferredMode } from '@prisma/client';

export class ModeSwitchDto {
    @IsEnum(PreferredMode)
    mode!: PreferredMode;
}

