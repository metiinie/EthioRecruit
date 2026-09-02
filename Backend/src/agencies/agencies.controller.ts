import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@Controller('agencies')
export class AgenciesController {
    constructor(private readonly agenciesService: AgenciesService) { }

    @Get()
    findAll() {
        return this.agenciesService.findAllPublic();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.agenciesService.findOnePublic(id);
    }
}
