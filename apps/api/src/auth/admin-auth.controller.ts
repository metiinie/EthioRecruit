import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
export class AdminAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    adminLogin(@Body() dto: AdminLoginDto) {
        return this.authService.adminLogin(dto);
    }
}
