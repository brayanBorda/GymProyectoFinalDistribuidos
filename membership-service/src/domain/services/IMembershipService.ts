import { Membership, CreateMembershipRequest, MembershipPlan, AccessCheckResponse } from '../entities/Membership';

export interface IMembershipService {
  // Membership validation
  validateMembershipData(membershipData: CreateMembershipRequest): Promise<void>;
  calculateEndDate(startDate: Date, type: string): Date;
  calculatePrice(type: string): number;
  
  // Membership plans
  getAvailablePlans(): MembershipPlan[];
  
  // Access control
  checkUserAccess(userId: string): Promise<AccessCheckResponse>;
  
  // Business rules
  canCreateMembership(userId: string): Promise<boolean>;
  canUpgradeMembership(currentType: string, newType: string): boolean;
  
  // Date operations
  isMembershipExpired(membership: Membership): boolean;
  getDaysUntilExpiry(membership: Membership): number;
}