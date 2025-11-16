import { Request, Response } from 'express';
import { CreateMembershipUseCase } from '@/application/useCases/CreateMembershipUseCase';
import { GetMembershipsUseCase } from '@/application/useCases/GetMembershipsUseCase';
import { UpdateMembershipUseCase } from '@/application/useCases/UpdateMembershipUseCase';
//import { CheckAccessUseCase } from '@/application/useCases/CheckAccessUseCase';
import { CheckAccessUseCase } from '@/application/useCases/CheckAccesUseCase';
import { CreateMembershipRequest, UpdateMembershipRequest, MembershipFilters } from '@/domain/entities/Membership';
import { MembershipRepository } from '../repositories/MembershipRepository';

export class MembershipController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly getMembershipsUseCase: GetMembershipsUseCase,
    private readonly updateMembershipUseCase: UpdateMembershipUseCase,
    private readonly checkAccessUseCase: CheckAccessUseCase,
    private readonly membershipRepository: MembershipRepository
  ) {}

  createMembership = async (req: Request, res: Response): Promise<void> => {
    try {
      const membershipData: CreateMembershipRequest = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };

      const membership = await this.createMembershipUseCase.execute(membershipData);

      res.status(201).json({
        message: 'Membership created successfully',
        data: { membership },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to create membership',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  getMemberships = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: MembershipFilters = {};
      
      if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }
      
      if (req.query.status) {
        filters.status = req.query.status as any;
      }
      
      if (req.query.type) {
        filters.type = req.query.type as any;
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const result = await this.getMembershipsUseCase.execute(page, limit, filters);

      res.status(200).json({
        message: 'Memberships retrieved successfully',
        data: {
          memberships: result.memberships,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            hasNext: page * limit < result.total,
            hasPrev: page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve memberships',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  getMembershipById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { membershipId } = req.params;
      const membership = await this.getMembershipsUseCase.executeById(membershipId);

      if (!membership) {
        res.status(404).json({
          error: 'Membership not found',
          message: `Membership with ID ${membershipId} not found`,
          timestamp: new Date().toISOString(),
          path: req.path,
        });
        return;
      }

      res.status(200).json({
        message: 'Membership retrieved successfully',
        data: { membership },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve membership',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  getMembershipsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const memberships = await this.getMembershipsUseCase.executeByUserId(userId);

      res.status(200).json({
        message: 'User memberships retrieved successfully',
        data: { memberships },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve user memberships',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  updateMembership = async (req: Request, res: Response): Promise<void> => {
    try {
      const { membershipId } = req.params;
      const updateData: UpdateMembershipRequest = {
        ...req.body,
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
      };

      const membership = await this.updateMembershipUseCase.execute(membershipId, updateData);

      res.status(200).json({
        message: 'Membership updated successfully',
        data: { membership },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to update membership',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  deleteMembership = async (req: Request, res: Response): Promise<void> => {
    try {
      const { membershipId } = req.params;

      // Check if membership exists
      const existingMembership = await this.membershipRepository.findById(membershipId);
      if (!existingMembership) {
        res.status(404).json({
          error: 'Membership not found',
          message: `Membership with ID ${membershipId} not found`,
          timestamp: new Date().toISOString(),
          path: req.path,
        });
        return;
      }

      await this.membershipRepository.delete(membershipId);

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete membership',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  checkAccess = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const accessCheck = await this.checkAccessUseCase.execute(userId);

      res.status(200).json({
        message: 'Access check completed',
        data: accessCheck,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to check access',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };

  getPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      // This would typically come from the membership service
      const plans = [
        {
          type: 'monthly',
          name: 'Mensual',
          duration: 30,
          price: parseFloat(process.env.MONTHLY_PRICE || '30000.00'),
          features: ['Acceso completo', 'Horario regular'],
        },
        {
          type: 'quarterly',
          name: 'Trimestral',
          duration: 90,
          price: parseFloat(process.env.QUARTERLY_PRICE || '75000.00'),
          features: ['Acceso completo', 'Horario extendido', '10% descuento'],
        },
        {
          type: 'yearly',
          name: 'Anual',
          duration: 365,
          price: parseFloat(process.env.YEARLY_PRICE || '324000.00'),
          features: ['Acceso completo', 'Horario ilimitado', '20% descuento', 'Sesión personal gratis'],
        },
      ];

      res.status(200).json({
        message: 'Plans retrieved successfully',
        data: { plans },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to retrieve plans',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };
}