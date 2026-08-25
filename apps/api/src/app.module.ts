import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        // Global config from .env
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate limiting: 10 requests per 15 minutes on auth routes
        ThrottlerModule.forRoot([{
            ttl: 900000, // 15 minutes in ms
            limit: 60,   // Global default — auth routes override to 10
        }]),

        // Database
        PrismaModule,

        // Feature modules
        AuthModule,
        UsersModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
