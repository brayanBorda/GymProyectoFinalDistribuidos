import { Membership, MembershipFilters } from '@/domain/entities/Membership';
import { IMembershipRepository } from '@/domain/repositories/IMembershipRepository';

export class GetMembershipsUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository
  ) {}

  async execute(page: number, limit: number, filters?: MembershipFilters): Promise<{ memberships: Membership[], total: number }> {
    return await this.membershipRepository.findAll(page, limit, filters);
  }

  async executeById(membershipId: string): Promise<Membership | null> {
    return await this.membershipRepository.findById(membershipId);
  }

  async executeByUserId(userId: string): Promise<Membership[]> {
    return await this.membershipRepository.findByUserId(userId);
  }

  async executeActiveByUserId(userId: string): Promise<Membership | null> {
    return await this.membershipRepository.findActiveByUserId(userId);
  }
}