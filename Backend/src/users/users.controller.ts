import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Body,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(UserJwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getMe(@CurrentUser('id') userId: string) {
        return this.usersService.getMe(userId);
    }

    @Put('me/jobseeker-profile')
    updateJobseekerProfile(
        @CurrentUser('id') userId: string,
        @Body() data: any,
    ) {
        return this.usersService.updateJobseekerProfile(userId, data);
    }

    @Put('me/employer-profile')
    updateEmployerProfile(
        @CurrentUser('id') userId: string,
        @Body() data: any,
    ) {
        return this.usersService.updateEmployerProfile(userId, data);
    }

    @Post('me/device-token')
    registerDeviceToken(
        @CurrentUser('id') userId: string,
        @Body() body: { token: string; platform?: string },
    ) {
        return this.usersService.registerDeviceToken(userId, body.token, body.platform);
    }

    @Delete('me/device-token')
    removeDeviceToken(@Body() body: { token: string }) {
        return this.usersService.removeDeviceToken(body.token);
    }
}
