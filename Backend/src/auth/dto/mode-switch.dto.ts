import { IsEnum } from 'class-validator';
import { UserMode } from '@prisma/client';

export class ModeSwitchDto {
    @IsEnum(UserMode)
    mode: UserMode;
}
