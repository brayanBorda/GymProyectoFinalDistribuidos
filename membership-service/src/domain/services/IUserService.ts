export interface IUserService {
  // User validation for memberships
  validateUser(userId: string): Promise<boolean>;
  getUserRole(userId: string): Promise<string>;
  userExists(userId: string): Promise<boolean>;
}