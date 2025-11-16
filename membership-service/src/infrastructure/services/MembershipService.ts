import { Membership, CreateMembershipRequest, MembershipPlan, AccessCheckResponse, MembershipType, MembershipStatus } from '@/domain/entities/Membership';
import { IMembershipService } from '@/domain/services/IMembershipService';
import { IMembershipRepository } from '@/domain/repositories/IMembershipRepository';

export class MembershipService implements IMembershipService {
  private readonly plans: MembershipPlan[] = [
    {
      type: MembershipType.MONTHLY,
      name: 'Mensual',
      duration: 30,
      price: parseFloat(process.env.MONTHLY_PRICE || '29.99'),
      features: ['Acceso completo', 'Horario regular'],
    },
    {
      type: MembershipType.QUARTERLY,
      name: 'Trimestral',
      duration: 90,
      price: parseFloat(process.env.QUARTERLY_PRICE || '79.99'),
      features: ['Acceso completo', 'Horario extendido', '10% descuento'],
    },
    {
      type: MembershipType.YEARLY,
      name: 'Anual',
      duration: 365,
      price: parseFloat(process.env.YEARLY_PRICE || '299.99'),
      features: ['Acceso completo', 'Horario ilimitado', '20% descuento', 'Sesión personal gratis'],
    },
  ];

  constructor(
    private readonly membershipRepository: IMembershipRepository
  ) {}

  async validateMembershipData(membershipData: CreateMembershipRequest): Promise<void> {
    // Validate dates
    if (membershipData.startDate >= membershipData.endDate) {
      throw new Error('End date must be after start date');
    }

    // Validate start date is not in the past
    if (membershipData.startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // Validate membership type
    if (!Object.values(MembershipType).includes(membershipData.type)) {
      throw new Error('Invalid membership type');
    }

    //Validate price
    if (membershipData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    


    // Validate user ID format
    if (!membershipData.userId || membershipData.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }

  calculateEndDate(startDate: Date, type: string): Date {
    const plan = this.plans.find(p => p.type === type);
    if (!plan) {
      throw new Error('Invalid membership type');
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);
    return endDate;
  }

  calculatePrice(type: string): number {
    const plan = this.plans.find(p => p.type === type);
    if (!plan) {
      throw new Error('Invalid membership type');
    }

    return plan.price;
  }

  getAvailablePlans(): MembershipPlan[] {
    return this.plans;
  }

  async checkUserAccess(userId: string): Promise<AccessCheckResponse> {
    const activeMembership = await this.membershipRepository.findActiveByUserId(userId);

    if (!activeMembership) {
      return {
        hasAccess: false,
        reason: 'no_membership',
      };
    }

    if (activeMembership.status === MembershipStatus.CANCELLED) {
      return {
        hasAccess: false,
        reason: 'membership_cancelled',
      };
    }

    if (this.isMembershipExpired(activeMembership)) {
      return {
        hasAccess: false,
        reason: 'membership_expired',
      };
    }

    return {
      hasAccess: true,
      membership: {
        membershipId: activeMembership.membershipId,
        type: activeMembership.type,
        endDate: activeMembership.endDate,
        status: activeMembership.status,
      },
    };
  }

  async canCreateMembership(userId: string): Promise<boolean> {
    const hasActiveMembership = await this.membershipRepository.hasActiveMembership(userId);
    return !hasActiveMembership;
  }

  canUpgradeMembership(currentType: string, newType: string): boolean {
    const typeOrder = {
      [MembershipType.MONTHLY]: 1,
      [MembershipType.QUARTERLY]: 2,
      [MembershipType.YEARLY]: 3,
    };

    const currentLevel = typeOrder[currentType as MembershipType] || 0;
    const newLevel = typeOrder[newType as MembershipType] || 0;

    return newLevel >= currentLevel;
  }

  isMembershipExpired(membership: Membership): boolean {
    return new Date() > membership.endDate;
  }

  getDaysUntilExpiry(membership: Membership): number {
    const now = new Date();
    const endDate = new Date(membership.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}