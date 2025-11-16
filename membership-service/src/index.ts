import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { DatabaseConnection } from './infrastructure/database/connection';

// Import dependencies
import { MembershipRepository } from './infrastructure/repositories/MembershipRepository';
import { MembershipService } from './infrastructure/services/MembershipService';
import { UserService } from './infrastructure/services/UserService';
import { CreateMembershipUseCase } from './application/useCases/CreateMembershipUseCase';
import { GetMembershipsUseCase } from './application/useCases/GetMembershipsUseCase';
import { UpdateMembershipUseCase } from './application/useCases/UpdateMembershipUseCase';
import { CheckAccessUseCase } from './application/useCases/CheckAccesUseCase';
import { MembershipController } from './infrastructure/controllers/MembershipController';
import { ErrorHandler } from './infrastructure/middleware/errorHandler';
import createRoutes from './infrastructure/routes';

// Load environment variables
dotenv.config();

class Application {
  public app: express.Application;
  //private membershipRepository: MembershipRepository;
  private membershipRepository!: MembershipRepository;

  constructor() {
    this.app = express();
    this.initializeDependencies();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeScheduledTasks();
  }

  private initializeDependencies(): void {
    // Initialize database connection
    const db = DatabaseConnection.getInstance();

    // Initialize repositories
    this.membershipRepository = new MembershipRepository();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }));

    
    this.app.use(morgan('combined'));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private initializeRoutes(): void {
    // Initialize services
    const membershipService = new MembershipService(this.membershipRepository);
    const userService = new UserService();

    // Initialize use cases
    const createMembershipUseCase = new CreateMembershipUseCase(
      this.membershipRepository,
      membershipService,
      userService
    );
    const getMembershipsUseCase = new GetMembershipsUseCase(this.membershipRepository);
    const updateMembershipUseCase = new UpdateMembershipUseCase(
      this.membershipRepository,
      membershipService
    );
    const checkAccessUseCase = new CheckAccessUseCase(membershipService);

    // Initialize controllers
    const membershipController = new MembershipController(
      createMembershipUseCase,
      getMembershipsUseCase,
      updateMembershipUseCase,
      checkAccessUseCase,
      this.membershipRepository
    );

    // Initialize routes
    const routes = createRoutes(membershipController);
    
    // API prefix
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Membership Service API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(ErrorHandler.notFound);

    // Global error handler
    this.app.use(ErrorHandler.handle);
  }

  private initializeScheduledTasks(): void {
    // Update expired memberships every day at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running scheduled task: Update expired memberships');
        const updatedCount = await this.membershipRepository.updateExpiredMemberships();
        console.log(`Updated ${updatedCount} expired memberships`);
      } catch (error) {
        console.error(' Error updating expired memberships:', error);
      }
    });

    // Check for memberships expiring in 7 days every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log(' Running scheduled task: Check expiring memberships');
        const expiringMemberships = await this.membershipRepository.findExpiringMemberships(7);
        console.log(` Found ${expiringMemberships.length} memberships expiring in 7 days`);
        
        // Here you could send notifications to users
        // For example: call a notification service or send emails
      } catch (error) {
        console.error(' Error checking expiring memberships:', error);
      }
    });
  }

  public async start(): Promise<void> {
    const port = process.env.PORT || 3002;

    try {
      // Test database connection
      await DatabaseConnection.getInstance().$connect();
      console.log(' Database connected successfully');

      // Start server
      this.app.listen(port, () => {
        console.log(` Membership Service running on port ${port}`);
        console.log(` Health check: http://localhost:${port}/api/health`);
        console.log(` API Documentation: http://localhost:${port}/`);
      });
    } catch (error) {
      console.error(' Failed to start server:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    console.log(' Shutting down Membership Service...');
    await DatabaseConnection.disconnect();
    console.log(' Membership Service shut down successfully');
  }
}

// Handle graceful shutdown
const app = new Application();

process.on('SIGTERM', async () => {
  console.log(' SIGTERM received');
  await app.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log(' SIGINT received');
  await app.shutdown();
  process.exit(0);
});

// Start the application
if (require.main === module) {
  app.start().catch((error) => {
    console.error(' Failed to start application:', error);
    process.exit(1);
  });
}

export default app;