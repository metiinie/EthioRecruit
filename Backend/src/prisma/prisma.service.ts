import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to the database.');
        } catch (error: any) {
            this.logger.warn(`⚠️ Database connection bypassed. (Configured for testing without DB). Error: ${error.message?.split('\n')[0]}`);
            // We intentionally do not throw here to allow the server to boot up for scanning
            // the UI, even if data endpoints will fail when accessed.
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
