import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
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
