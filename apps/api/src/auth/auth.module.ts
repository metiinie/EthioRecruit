import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.register({}),
    ],
    controllers: [AuthController, AdminAuthController],
    providers: [AuthService, UserJwtStrategy, AdminJwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
