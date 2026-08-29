import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { AdminCandidatesController } from './admin-candidates.controller';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
    controllers: [CandidatesController, AdminCandidatesController],
    providers: [CandidatesService, SubscriptionGuard],
    exports: [CandidatesService],
})
export class CandidatesModule { }
