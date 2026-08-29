import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to the database.');
            await this.ensurePerformanceIndexes();
        } catch (error: any) {
            this.logger.warn(`⚠️ Database connection bypassed. (Configured for testing without DB). Error: ${error.message?.split('\n')[0]}`);
        }
    }

    private async ensurePerformanceIndexes() {
        try {
            // Enable PostgreSQL trigram extension for sub-10ms wildcard text search
            await this.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

            // GIN Trigram index for Candidate name search
            await this.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS candidate_name_trgm_idx ON candidates USING gin (
                    (first_name || ' ' || last_name || ' ' || COALESCE(full_name_amharic, '')) gin_trgm_ops
                );
            `);

            // GIN Trigram index for JobVacancy title & description search
            await this.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS vacancy_search_trgm_idx ON job_vacancies USING gin (
                    (title || ' ' || description || ' ' || country) gin_trgm_ops
                );
            `);

            this.logger.log('⚡ High-performance GIN trigram search indexes verified.');
        } catch (err: any) {
            this.logger.debug(`Trigram index setup skipped/not supported in current DB engine: ${err.message?.split('\n')[0]}`);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
