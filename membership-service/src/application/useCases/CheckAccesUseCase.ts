import { AccessCheckResponse } from '@/domain/entities/Membership';
import { IMembershipService } from '@/domain/services/IMembershipService';

export class CheckAccessUseCase {
  constructor(
    private readonly membershipService: IMembershipService
  ) {}

  async execute(userId: string): Promise<AccessCheckResponse> {
    return await this.membershipService.checkUserAccess(userId);
  }
}