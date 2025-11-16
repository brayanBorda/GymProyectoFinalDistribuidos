import { Membership, CreateMembershipRequest } from '@/domain/entities/Membership';
import { IMembershipRepository } from '@/domain/repositories/IMembershipRepository';
import { IMembershipService } from '@/domain/services/IMembershipService';
import { IUserService } from '@/domain/services/IUserService';

export class CreateMembershipUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly membershipService: IMembershipService,
    private readonly userService: IUserService
  ) {}

  async execute(membershipData: CreateMembershipRequest): Promise<Membership> {
    // Validate user exists
    const userExists = await this.userService.userExists(membershipData.userId);
    if (!userExists) {
      throw new Error('User does not exist');
    }

    // Validate membership data
    await this.membershipService.validateMembershipData(membershipData);

    // Check if user can create new membership
    const canCreate = await this.membershipService.canCreateMembership(membershipData.userId);
    if (!canCreate) {
      throw new Error('User already has an active membership');
    }

    // Auto-calculate end date and price if not provided
    const endDate = membershipData.endDate || this.membershipService.calculateEndDate(membershipData.startDate, membershipData.type);
    const price = membershipData.price || this.membershipService.calculatePrice(membershipData.type);

    // Create membership
    const newMembership = await this.membershipRepository.create({
      ...membershipData,
      endDate,
      price,
    });

    return newMembership;
  }
}