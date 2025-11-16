import { PrismaClient } from '@prisma/client';

export class DatabaseConnection {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      });
    }

    return DatabaseConnection.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
    }
  }
}

export const db = DatabaseConnection.getInstance();