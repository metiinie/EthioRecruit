import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidatesModule } from './candidates/candidates.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ApplicationsModule } from './applications/applications.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { AgenciesModule } from './agencies/agencies.module';
import { SettingsModule } from './settings/settings.module';
import { StaffModule } from './staff/staff.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SavedModule } from './saved/saved.module';
import { MediaModule } from './media/media.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
    imports: [
        // Global config from .env
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Global Cache Module (2 min default TTL)
        CacheModule.register({
            isGlobal: true,
            ttl: 120000,
        }),

        // Rate limiting: 60 requests per 15 minutes globally
        ThrottlerModule.forRoot([{
            ttl: 900000, // 15 minutes in ms
            limit: 60,
        }]),

        // Database
        PrismaModule,

        // Feature modules
        AuthModule,
        UsersModule,
        CandidatesModule,
        VacanciesModule,
        PipelineModule,
        ApplicationsModule,
        InquiriesModule,
        AgenciesModule,
        SettingsModule,
        StaffModule,
        NotificationsModule,
        SavedModule,
        MediaModule,
        ConversationsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
