import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AgencyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.agency_id) {
            return false;
        }

        // Inject agencyId into request for downstream use
        request.agencyId = user.agency_id;
        return true;
    }
}
