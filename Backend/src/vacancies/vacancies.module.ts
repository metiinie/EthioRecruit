import { Module } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { AdminVacanciesController } from './admin-vacancies.controller';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
    controllers: [VacanciesController, AdminVacanciesController],
    providers: [VacanciesService, SubscriptionGuard],
    exports: [VacanciesService],
})
export class VacanciesModule { }
