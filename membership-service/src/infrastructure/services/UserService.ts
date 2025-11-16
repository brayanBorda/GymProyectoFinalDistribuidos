import axios from 'axios';
import { IUserService } from '@/domain/services/IUserService';

export class UserService implements IUserService {
  private readonly user_service_url: string;
  private readonly apiKey: string;

  constructor() {
    this.user_service_url = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    this.apiKey = process.env.API_KEY || '';
  }

  async validateUser(userId: string): Promise<boolean> {
    // MODO DESARROLLO: Saltar validación si está habilitado
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_USER_VALIDATION === 'true') {
      console.log(`⚠️  User validation skipped for development - userId: ${userId}`);
      return true;
    }

    try {
      const response = await axios.get(
        `${this.user_service_url}/api/users/validate/${userId}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
          timeout: 5000,
        }
      );

      return response.status === 200;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error validating user ${userId}:`, errorMessage);
      return false;
    }
  }

  async getUserRole(userId: string): Promise<string> {
    // MODO DESARROLLO: Retornar rol por defecto si está habilitado
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_USER_VALIDATION === 'true') {
      console.log(`⚠️  User role check skipped for development - userId: ${userId}`);
      return 'user';
    }

    try {
      const response = await axios.get(
        `${this.user_service_url}/api/users/validate/${userId}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
          timeout: 5000,
        }
      );

      return response.data.data?.role || 'unknown';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error getting user role ${userId}:`, errorMessage);
      return 'unknown';
    }
  }

  async userExists(userId: string): Promise<boolean> {
    return await this.validateUser(userId);
  }
}