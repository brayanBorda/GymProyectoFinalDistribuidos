import { Membership, CreateMembershipRequest, UpdateMembershipRequest, MembershipFilters } from '../entities/Membership';

export interface IMembershipRepository {
  // CRUD operations
  create(membershipData: CreateMembershipRequest): Promise<Membership>;
  findById(membershipId: string): Promise<Membership | null>;
  findByUserId(userId: string): Promise<Membership[]>;
  findAll(page: number, limit: number, filters?: MembershipFilters): Promise<{ memberships: Membership[], total: number }>;
  update(membershipId: string, membershipData: UpdateMembershipRequest): Promise<Membership>;
  delete(membershipId: string): Promise<void>;
  
  // Business operations
  findActiveByUserId(userId: string): Promise<Membership | null>;
  findExpiringMemberships(daysAhead: number): Promise<Membership[]>;
  updateExpiredMemberships(): Promise<number>;
  
  // Validation operations
  existsById(membershipId: string): Promise<boolean>;
  hasActiveMembership(userId: string): Promise<boolean>;
}