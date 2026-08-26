import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtGuard extends AuthGuard(['admin-jwt', 'user-jwt']) {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
}
