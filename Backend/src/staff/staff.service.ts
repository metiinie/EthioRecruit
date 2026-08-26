import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(agencyId: string) {
        const staff = await this.prisma.adminUser.findMany({
            where: { agencyId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                title: true,
                department: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return { data: staff };
    }

    async createStaff(agencyId: string, dto: any) {
        const { email, firstName, lastName, phone, title, department, role, password } = dto;
        if (!email || !firstName || !password) {
            throw new BadRequestException('Email, first name, and password are required');
        }

        const existing = await this.prisma.adminUser.findUnique({ where: { email } });
        if (existing) {
            throw new BadRequestException('Email already registered for a staff account');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const staff = await this.prisma.adminUser.create({
            data: {
                agencyId,
                email,
                firstName,
                lastName: lastName || '',
                phone: phone || null,
                title: title || 'Placement Officer',
                department: department || 'General Recruitment',
                password: hashedPassword,
                role: role || 'ADMIN',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                title: true,
                department: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        return { data: staff };
    }

    async toggleActive(id: string, agencyId: string, isActive: boolean) {
        const staff = await this.prisma.adminUser.findUnique({ where: { id } });
        if (!staff || staff.agencyId !== agencyId) {
            throw new NotFoundException('Staff member not found');
        }

        const updated = await this.prisma.adminUser.update({
            where: { id },
            data: { isActive },
            select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
        });
        return { data: updated };
    }
}
