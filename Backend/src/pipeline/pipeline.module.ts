import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PipelineController } from './pipeline.controller';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
    controllers: [PipelineController],
    providers: [PipelineService, SubscriptionGuard],
    exports: [PipelineService],
})
export class PipelineModule { }
