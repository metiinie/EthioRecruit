import { Module } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { AdminVacanciesController } from './admin-vacancies.controller';

@Module({
    controllers: [VacanciesController, AdminVacanciesController],
    providers: [VacanciesService],
    exports: [VacanciesService],
})
export class VacanciesModule { }
