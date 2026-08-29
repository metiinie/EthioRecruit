import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const agencyId = request.agencyId;

        if (!agencyId) {
            throw new ForbiddenException('Agency context required to verify subscription.');
        }

        const org = await this.prisma.organization.findUnique({
            where: { id: agencyId },
            select: {
                id: true,
                name: true,
                subscriptionPlan: true,
                subscriptionStatus: true,
                subscriptionEndsAt: true,
                isActive: true,
            },
        });

        if (!org || !org.isActive) {
            throw new ForbiddenException('Agency workspace is inactive or suspended.');
        }

        const status = (org.subscriptionStatus || 'ACTIVE').toUpperCase();
        if (status === 'EXPIRED' || status === 'CANCELED' || status === 'SUSPENDED') {
            throw new ForbiddenException(
                `Agency subscription is ${status}. Please renew your subscription to perform this action.`,
            );
        }

        if (org.subscriptionEndsAt && new Date(org.subscriptionEndsAt) < new Date()) {
            throw new ForbiddenException(
                'Agency subscription plan has expired. Please upgrade or renew your plan to continue.',
            );
        }

        request.organization = org;
        return true;
    }
}
