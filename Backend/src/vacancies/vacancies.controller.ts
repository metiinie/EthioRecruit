import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { VacancyFiltersDto } from './dto/vacancy.dto';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vacancies')
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Get()
    findAll(@Query() filters: VacancyFiltersDto) {
        return this.vacanciesService.findAllPublic(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vacanciesService.findOnePublic(id);
    }

    @Post(':id/apply')
    @UseGuards(UserJwtGuard)
    apply(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() body: any,
    ) {
        return this.vacanciesService.applyToVacancy(id, userId, body);
    }
}
