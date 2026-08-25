import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface AdminJwtPayload {
    sub: string;
    type: 'admin';
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
    agency_id: string;
    iat: number;
    exp: number;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('ADMIN_JWT_SECRET') || 'super-secret-admin-key',
        });
    }

    async validate(payload: AdminJwtPayload) {
        if (payload.type !== 'admin') {
            throw new UnauthorizedException('Invalid token type');
        }
        return {
            id: payload.sub,
            type: payload.type,
            role: payload.role,
            agency_id: payload.agency_id,
        };
    }
}
