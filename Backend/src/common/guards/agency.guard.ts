import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AgencyGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User authentication context required.');
        }

        // 1. Check direct agency_id / agencyId property (from AdminJwtStrategy)
        if (user.agency_id) {
            request.agencyId = user.agency_id;
            return true;
        }

        if (user.agencyId) {
            request.agencyId = user.agencyId;
            return true;
        }

        // 2. Resolve via user ID or sub (from UserJwtStrategy)
        const userId = user.id || user.sub;
        if (userId) {
            // Check AdminUser table by userId or user record
            const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
            if (dbUser && dbUser.email) {
                const adminUser = await this.prisma.adminUser.findFirst({
                    where: { email: dbUser.email },
                });
                if (adminUser) {
                    request.agencyId = adminUser.agencyId;
                    return true;
                }
            }

            // Check OrganizationMember link
            const orgMember = await this.prisma.organizationMember.findFirst({
                where: { userId },
            });
            if (orgMember) {
                request.agencyId = orgMember.organizationId;
                return true;
            }
        }

        throw new ForbiddenException('Agency context required. User is not associated with an active agency workspace.');
    }
}
