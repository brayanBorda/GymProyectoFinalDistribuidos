import { Membership, UpdateMembershipRequest } from '@/domain/entities/Membership';
import { IMembershipRepository } from '@/domain/repositories/IMembershipRepository';
import { IMembershipService } from '@/domain/services/IMembershipService';

export class UpdateMembershipUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly membershipService: IMembershipService
  ) {}

  async execute(membershipId: string, updateData: UpdateMembershipRequest): Promise<Membership> {
    // Get existing membership
    const existingMembership = await this.membershipRepository.findById(membershipId);
    if (!existingMembership) {
      throw new Error('Membership not found');
    }

    // Validate upgrade if changing type
    if (updateData.type && updateData.type !== existingMembership.type) {
      const canUpgrade = this.membershipService.canUpgradeMembership(
        existingMembership.type,
        updateData.type
      );
      if (!canUpgrade) {
        throw new Error('Cannot downgrade membership type');
      }
    }

    // Auto-calculate price if type is changing
    if (updateData.type && !updateData.price) {
      updateData.price = this.membershipService.calculatePrice(updateData.type);
    }

    // Auto-calculate end date if type is changing
    if (updateData.type && !updateData.endDate) {
      updateData.endDate = this.membershipService.calculateEndDate(
        existingMembership.startDate,
        updateData.type
      );
    }

    // Update membership
    const updatedMembership = await this.membershipRepository.update(membershipId, updateData);

    return updatedMembership;
  }
}