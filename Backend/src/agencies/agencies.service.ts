import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgenciesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllPublic() {
        const agencies = await this.prisma.organization.findMany({
            where: { isVerified: true, type: 'AGENCY' },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                bannerUrl: true,
                phone: true,
                email: true,
                city: true,
                country: true,
                licenseNumber: true,
                isVerified: true,
                contactChannels: true,
                _count: {
                    select: {
                        candidates: { where: { isPublished: true } },
                        vacancies: { where: { status: 'ACTIVE' } },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return { data: agencies };
    }

    async findOnePublic(id: string) {
        const agency = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                contactChannels: true,
                settings: true,
                candidates: {
                    where: { isPublished: true, isAvailable: true },
                    take: 6,
                    include: { category: true },
                },
                vacancies: {
                    where: { status: 'ACTIVE' },
                    take: 6,
                    include: { category: true },
                },
            },
        });

        if (!agency) throw new NotFoundException('Agency not found');
        return { data: agency };
    }
}

