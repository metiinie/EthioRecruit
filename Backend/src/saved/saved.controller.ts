import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
} from '@nestjs/common';
import { SavedService } from './saved.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('saved')
@UseGuards(UserJwtGuard)
export class SavedController {
    constructor(private readonly savedService: SavedService) { }

    @Get('candidates')
    getSavedCandidates(@CurrentUser('id') userId: string) {
        return this.savedService.getSavedCandidates(userId);
    }

    @Post('candidates/:candidateId')
    saveCandidate(
        @CurrentUser('id') userId: string,
        @Param('candidateId') candidateId: string,
    ) {
        return this.savedService.saveCandidate(userId, candidateId);
    }

    @Delete('candidates/:candidateId')
    unsaveCandidate(
        @CurrentUser('id') userId: string,
        @Param('candidateId') candidateId: string,
    ) {
        return this.savedService.unsaveCandidate(userId, candidateId);
    }

    @Get('vacancies')
    getSavedVacancies(@CurrentUser('id') userId: string) {
        return this.savedService.getSavedVacancies(userId);
    }

    @Post('vacancies/:vacancyId')
    saveVacancy(
        @CurrentUser('id') userId: string,
        @Param('vacancyId') vacancyId: string,
    ) {
        return this.savedService.saveVacancy(userId, vacancyId);
    }

    @Delete('vacancies/:vacancyId')
    unsaveVacancy(
        @CurrentUser('id') userId: string,
        @Param('vacancyId') vacancyId: string,
    ) {
        return this.savedService.unsaveVacancy(userId, vacancyId);
    }
}
