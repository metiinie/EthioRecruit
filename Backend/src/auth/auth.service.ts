import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpSendDto } from './dto/otp-send.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { PreferredMode } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    // ── User Registration ──────────────────────────
    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existing) {
            throw new ConflictException('Phone number already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                password: hashedPassword,
            },
        });

        // Auto-send OTP on registration
        const code = await this.generateAndSendOtp(dto.phone, 'registration');

        const token = this.signUserToken(user.id, user.preferredMode);

        return {
            data: {
                user: this.sanitizeUser(user),
                token,
            },
        };
    }

    // ── User / Unified Login (Phone or Email) ─────────────
    async login(dto: LoginDto) {
        const rawInput = dto.identifier || dto.phone || dto.email || '';
        const { isEmail, phoneFormatted, rawPhone, email } = this.resolveIdentifier(rawInput);

        if (!rawInput) {
            throw new BadRequestException('Phone number or email is required');
        }

        // 1. Try finding in standard User model
        const user = await this.prisma.user.findFirst({
            where: isEmail
                ? { email }
                : { OR: [{ phone: phoneFormatted }, { phone: rawPhone }] },
            include: { jobseekerProfile: true, employerProfile: true },
        });

        if (user) {
            const isPasswordValid = await bcrypt.compare(dto.password, user.password);
            if (isPasswordValid) {
                const token = this.signUserToken(user.id, user.preferredMode);
                return {
                    data: {
                        user: this.sanitizeUser(user),
                        token,
                    },
                };
            }
            // User found but password invalid — do NOT fall through to admin check
            throw new UnauthorizedException('Invalid phone/email or password');
        }

        // 2. Only try admin if NO regular user was found at all
        // (prevents using admin credentials on the user login endpoint)
        const admin = await this.prisma.adminUser.findFirst({
            where: isEmail
                ? { email }
                : { OR: [{ phone: phoneFormatted }, { phone: rawPhone }, { email: rawInput }] },
            include: { agency: true },
        });

        if (admin && admin.isActive) {
            const isAdminPasswordValid = await bcrypt.compare(dto.password, admin.password);
            if (isAdminPasswordValid) {
                const token = this.signAdminToken(admin.id, admin.role, admin.agencyId);
                return {
                    data: {
                        user: {
                            id: admin.id,
                            email: admin.email,
                            firstName: admin.firstName,
                            lastName: admin.lastName,
                            phone: admin.phone,
                            preferredMode: 'EMPLOYER',
                            isPlatformAdmin: true,
                            phoneVerified: true,
                        },
                        admin: {
                            id: admin.id,
                            email: admin.email,
                            firstName: admin.firstName,
                            lastName: admin.lastName,
                            role: admin.role,
                            agencyId: admin.agencyId,
                            agency: admin.agency ? {
                                id: admin.agency.id,
                                name: admin.agency.name,
                                logoUrl: admin.agency.logoUrl,
                            } : null,
                        },
                        token,
                    },
                };
            }
        }

        throw new UnauthorizedException('Invalid phone/email or password');
    }

    // ── OTP Send ───────────────────────────────────
    async sendOtp(dto: OtpSendDto) {
        await this.generateAndSendOtp(dto.phone, dto.purpose || 'registration');
        return { data: { message: 'OTP sent successfully' } };
    }

    // ── OTP Verify ─────────────────────────────────
    async verifyOtp(dto: OtpVerifyDto) {
        const otp = await this.prisma.otpVerification.findFirst({
            where: {
                phone: dto.phone,
                code: dto.code,
                verified: false,
                expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark OTP as consumed
        await this.prisma.otpVerification.update({
            where: { id: otp.id },
            data: { verified: true },
        });

        // Mark phone as verified
        const user = await this.prisma.user.update({
            where: { phone: dto.phone },
            data: { phoneVerified: true },
            include: { jobseekerProfile: true, employerProfile: true },
        });

        const token = this.signUserToken(user.id, user.preferredMode);

        return {
            data: {
                user: this.sanitizeUser(user),
                token,
                phoneVerified: true,
            },
        };
    }

    // ── Mode Switch ────────────────────────────────
    async switchMode(userId: string, mode: PreferredMode) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { preferredMode: mode },
            include: { jobseekerProfile: true, employerProfile: true },
        });

        const token = this.signUserToken(user.id, user.preferredMode);

        return {
            data: {
                user: this.sanitizeUser(user),
                token,
            },
        };
    }

    // ── Admin Login (Email or Phone) ───────────────
    async adminLogin(dto: AdminLoginDto) {
        const rawInput = dto.identifier || dto.email || dto.phone || '';
        const { isEmail, phoneFormatted, rawPhone, email } = this.resolveIdentifier(rawInput);

        if (!rawInput) {
            throw new BadRequestException('Email or phone number is required');
        }

        let admin = await this.prisma.adminUser.findFirst({
            where: isEmail
                ? { email }
                : { OR: [{ phone: phoneFormatted }, { phone: rawPhone }, { email: rawInput }] },
            include: { agency: true },
        });

        if (!admin || !admin.isActive) {
            throw new UnauthorizedException('Invalid credentials or inactive admin account');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email/phone or password');
        }

        const token = this.signAdminToken(admin.id, admin.role, admin.agencyId);

        return {
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role,
                    agencyId: admin.agencyId,
                    agency: admin.agency ? {
                        id: admin.agency.id,
                        name: admin.agency.name,
                        logoUrl: admin.agency.logoUrl,
                    } : null,
                },
                token,
            },
        };
    }

    // ── Private Helpers ────────────────────────────
    private resolveIdentifier(rawInput: string) {
        const trimmed = (rawInput || '').trim();
        if (!trimmed) {
            return { isEmail: false, phoneFormatted: '', rawPhone: '', email: '' };
        }

        if (trimmed.includes('@')) {
            return { isEmail: true, phoneFormatted: '', rawPhone: '', email: trimmed.toLowerCase() };
        }

        let digits = trimmed.replace(/\D/g, '');
        if (digits.startsWith('251')) {
            digits = digits.slice(3);
        }
        digits = digits.replace(/^0+/, '');
        const phoneFormatted = `+251${digits}`;

        return { isEmail: false, phoneFormatted, rawPhone: trimmed, email: '' };
    }

    private signUserToken(userId: string, mode: PreferredMode): string {
        return this.jwtService.sign(
            {
                sub: userId,
                type: 'user',
                mode,
            },
            {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '30d',
            },
        );
    }

    private signAdminToken(adminId: string, role: string, agencyId: string): string {
        return this.jwtService.sign(
            {
                sub: adminId,
                type: 'admin',
                role,
                agency_id: agencyId,
            },
            {
                secret: this.configService.get<string>('ADMIN_JWT_SECRET'),
                expiresIn: '8h',
            },
        );
    }

    private async generateAndSendOtp(phone: string, purpose: string): Promise<string> {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.prisma.otpVerification.create({
            data: {
                phone,
                code,
                purpose,
                expiresAt,
            },
        });

        // 1. Dispatch to Live SMS Provider if configured in environment (.env)
        const smsApiUrl = this.configService.get<string>('SMS_API_URL');
        const smsApiKey = this.configService.get<string>('SMS_API_KEY');

        if (smsApiUrl) {
            try {
                await fetch(smsApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(smsApiKey ? { Authorization: `Bearer ${smsApiKey}` } : {}),
                    },
                    body: JSON.stringify({
                        to: phone,
                        message: `Your EthioRecruit verification code is ${code}. Valid for 5 minutes.`,
                    }),
                });
                this.logger.log(`[SMS GATEWAY] Dispatched OTP to ${phone}`);
            } catch (err: any) {
                this.logger.error(`[SMS GATEWAY ERROR] Failed to send SMS to ${phone}: ${err.message}`);
            }
        } else {
            // 2. Dev mode console banner fallback
            const devBanner = `
=============================================================
  🔑 [DEV OTP VERIFICATION CODE]
  Phone:   ${phone}
  Purpose: ${purpose}
  CODE:    ${code}
=============================================================
`;
            console.log(devBanner);
            this.logger.log(`[DEV] OTP for ${phone} (${purpose}): ${code}`);
        }

        return code;
    }


    private sanitizeUser(user: any) {
        const { password, ...rest } = user;
        return rest;
    }
}
