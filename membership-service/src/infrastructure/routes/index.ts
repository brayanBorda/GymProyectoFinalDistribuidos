import { Router } from 'express';
import createMembershipRoutes from './memberships';
import { MembershipController } from '../controllers/MembershipController';

const createRoutes = (membershipController: MembershipController): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      service: 'membership-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  router.use('/memberships', createMembershipRoutes(membershipController));

  return router;
};

export default createRoutes;