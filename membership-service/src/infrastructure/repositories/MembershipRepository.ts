import { Membership, CreateMembershipRequest, UpdateMembershipRequest, MembershipFilters } from '@/domain/entities/Membership';
import { IMembershipRepository } from '@/domain/repositories/IMembershipRepository';
import { db } from '../database/connection';
import { Membership as PrismaMembership } from '@prisma/client';

export class MembershipRepository implements IMembershipRepository {
  async create(membershipData: CreateMembershipRequest): Promise<Membership> {
    const membership = await db.membership.create({
      data: {
        userId: membershipData.userId,
        type: membershipData.type,
        startDate: membershipData.startDate,
        endDate: membershipData.endDate,
        price: membershipData.price,
      },
    });

    return this.mapToEntity(membership);
  }

  async findById(membershipId: string): Promise<Membership | null> {
    const membership = await db.membership.findUnique({
      where: { membershipId },
    });

    return membership ? this.mapToEntity(membership) : null;
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const memberships = await db.membership.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((membership: PrismaMembership) => this.mapToEntity(membership));
  }

  async findAll(page: number, limit: number, filters?: MembershipFilters): Promise<{ memberships: Membership[], total: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.type) {
      where.type = filters.type;
    }
    
    if (filters?.search) {
      where.userId = { contains: filters.search, mode: 'insensitive' };
    }

    const [memberships, total] = await Promise.all([
      db.membership.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.membership.count({ where }),
    ]);

    return {
      memberships: memberships.map((membership: PrismaMembership) => this.mapToEntity(membership)),
      total,
    };
  }

  async update(membershipId: string, membershipData: UpdateMembershipRequest): Promise<Membership> {
    const membership = await db.membership.update({
      where: { membershipId },
      data: {
        ...(membershipData.type && { type: membershipData.type }),
        ...(membershipData.endDate && { endDate: membershipData.endDate }),
        ...(membershipData.price && { price: membershipData.price }),
        ...(membershipData.status && { status: membershipData.status }),
      },
    });

    return this.mapToEntity(membership);
  }

  async delete(membershipId: string): Promise<void> {
    await db.membership.delete({
      where: { membershipId },
    });
  }

  async findActiveByUserId(userId: string): Promise<Membership | null> {
    const membership = await db.membership.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return membership ? this.mapToEntity(membership) : null;
  }

  async findExpiringMemberships(daysAhead: number): Promise<Membership[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const memberships = await db.membership.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
    });

    return memberships.map((membership: PrismaMembership) => this.mapToEntity(membership));
  }

  async updateExpiredMemberships(): Promise<number> {
    const result = await db.membership.updateMany({
      where: {
        status: 'active',
        endDate: {
          lt: new Date(),
        },
      },
      data: {
        status: 'expired',
      },
    });

    return result.count;
  }

  async existsById(membershipId: string): Promise<boolean> {
    const membership = await db.membership.findUnique({
      where: { membershipId },
      select: { membershipId: true },
    });

    return !!membership;
  }

  async hasActiveMembership(userId: string): Promise<boolean> {
    const membership = await db.membership.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
      select: { membershipId: true },
    });

    return !!membership;
  }

  private mapToEntity(membership: PrismaMembership): Membership {
    return {
      membershipId: membership.membershipId,
      userId: membership.userId,
      type: membership.type as any,
      startDate: membership.startDate,
      endDate: membership.endDate,
      price: parseFloat(membership.price.toString()),
      status: membership.status as any,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}