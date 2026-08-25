import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface UserJwtPayload {
    sub: string;
    type: 'user';
    mode: 'JOB_SEEKER' | 'EMPLOYER';
    iat: number;
    exp: number;
}

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-user-key',
        });
    }

    async validate(payload: UserJwtPayload) {
        if (payload.type !== 'user') {
            throw new UnauthorizedException('Invalid token type');
        }
        return {
            id: payload.sub,
            type: payload.type,
            mode: payload.mode,
        };
    }
}
