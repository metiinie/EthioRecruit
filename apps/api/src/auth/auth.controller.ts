import { Controller, Post, Put, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpSendDto } from './dto/otp-send.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { ModeSwitchDto } from './dto/mode-switch.dto';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('otp/send')
    sendOtp(@Body() dto: OtpSendDto) {
        return this.authService.sendOtp(dto);
    }

    @Post('otp/verify')
    verifyOtp(@Body() dto: OtpVerifyDto) {
        return this.authService.verifyOtp(dto);
    }

    @Put('mode')
    @UseGuards(UserJwtGuard)
    switchMode(
        @CurrentUser('id') userId: string,
        @Body() dto: ModeSwitchDto,
    ) {
        return this.authService.switchMode(userId, dto.mode);
    }
}
