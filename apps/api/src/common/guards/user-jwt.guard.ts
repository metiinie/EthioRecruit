import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserJwtGuard extends AuthGuard('user-jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
}
