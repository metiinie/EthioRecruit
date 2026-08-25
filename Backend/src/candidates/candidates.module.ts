import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { AdminCandidatesController } from './admin-candidates.controller';

@Module({
    controllers: [CandidatesController, AdminCandidatesController],
    providers: [CandidatesService],
    exports: [CandidatesService],
})
export class CandidatesModule { }
