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
import { UserMode, OtpPurpose } from '@prisma/client';

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
        await this.generateAndSendOtp(dto.phone, OtpPurpose.registration);

        const token = this.signUserToken(user.id, user.preferredMode);

        return {
            data: {
                user: this.sanitizeUser(user),
                token,
            },
        };
    }

    // ── User Login ─────────────────────────────────
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
            include: { jobseekerProfile: true, employerProfile: true },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid phone or password');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid phone or password');
        }

        const token = this.signUserToken(user.id, user.preferredMode);

        return {
            data: {
                user: this.sanitizeUser(user),
                token,
            },
        };
    }

    // ── OTP Send ───────────────────────────────────
    async sendOtp(dto: OtpSendDto) {
        await this.generateAndSendOtp(dto.phone, dto.purpose || OtpPurpose.registration);
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
    async switchMode(userId: string, mode: UserMode) {
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

    // ── Admin Login ────────────────────────────────
    async adminLogin(dto: AdminLoginDto) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { email: dto.email },
            include: { organization: true },
        });

        if (!admin || !admin.isActive) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.signAdminToken(admin.id, admin.role, admin.organizationId);

        return {
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role,
                    organizationId: admin.organizationId,
                    organization: {
                        id: admin.organization.id,
                        name: admin.organization.name,
                        logoUrl: admin.organization.logoUrl,
                    },
                },
                token,
            },
        };
    }

    // ── Private Helpers ────────────────────────────
    private signUserToken(userId: string, mode: UserMode): string {
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

    private async generateAndSendOtp(phone: string, purpose: OtpPurpose): Promise<void> {
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

        // TODO: Integrate SMSEthiopia HTTP API
        this.logger.log(`[DEV] OTP for ${phone}: ${code}`);
    }

    private sanitizeUser(user: any) {
        const { password, ...rest } = user;
        return rest;
    }
}
