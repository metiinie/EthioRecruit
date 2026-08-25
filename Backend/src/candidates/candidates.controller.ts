import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidateFiltersDto } from './dto/candidate.dto';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('candidates')
@UseGuards(UserJwtGuard)
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    findAll(@Query() filters: CandidateFiltersDto) {
        return this.candidatesService.findAllPublic(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.candidatesService.findOnePublic(id);
    }

    @Post(':id/inquiry')
    createInquiry(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() body: any,
    ) {
        return this.candidatesService.createInquiry(id, userId, body);
    }
}
