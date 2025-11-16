export interface Membership {
  membershipId: string;
  userId: string;
  type: MembershipType;
  startDate: Date;
  endDate: Date;
  price: number;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MembershipType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface CreateMembershipRequest {
  userId: string;
  type: MembershipType;
  startDate: Date;
  endDate: Date;
  price: number;
}

export interface UpdateMembershipRequest {
  type?: MembershipType;
  endDate?: Date;
  price?: number;
  status?: MembershipStatus;
}

export interface MembershipFilters {
  userId?: string;
  status?: MembershipStatus;
  type?: MembershipType;
  search?: string;
}

export interface MembershipPlan {
  type: MembershipType;
  name: string;
  duration: number; // in days
  price: number;
  features: string[];
}

export interface AccessCheckResponse {
  hasAccess: boolean;
  membership?: {
    membershipId: string;
    type: MembershipType;
    endDate: Date;
    status: MembershipStatus;
  };
  reason?: 'membership_expired' | 'membership_cancelled' | 'no_membership';
}