import { Router } from 'express';
import { MembershipController } from '../controllers/MembershipController';
import { ValidationMiddleware, commonSchemas } from '../middleware/validation';
import Joi from 'joi';

const createMembershipRoutes = (membershipController: MembershipController): Router => {
  const router = Router();

  // Validation schemas
  const createMembershipSchema = Joi.object({
    userId: Joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required',
    }),
    type: Joi.string().valid('monthly', 'quarterly', 'yearly').required().messages({
      'any.only': 'Type must be one of: monthly, quarterly, yearly',
      'any.required': 'Type is required',
    }),
    startDate: Joi.date().iso().required().messages({
      'date.format': 'Start date must be a valid ISO date',
      'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
      'date.format': 'End date must be a valid ISO date',
      'date.min': 'End date must be after start date',
    }),
    price: Joi.number().positive().optional().messages({
      'number.positive': 'Price must be a positive number',
    }),
  });

  const updateMembershipSchema = Joi.object({
    type: Joi.string().valid('monthly', 'quarterly', 'yearly').optional(),
    endDate: Joi.date().iso().optional().messages({
      'date.format': 'End date must be a valid ISO date',
    }),
    price: Joi.number().positive().optional().messages({
      'number.positive': 'Price must be a positive number',
    }),
    status: Joi.string().valid('active', 'expired', 'cancelled').optional(),
  });

  const paginationSchema = commonSchemas.pagination.keys({
    userId: Joi.string().optional(),
    status: Joi.string().valid('active', 'expired', 'cancelled').optional(),
    type: Joi.string().valid('monthly', 'quarterly', 'yearly').optional(),
    search: Joi.string().min(1).max(100).optional(),
  });

  // Param validation schemas
  const membershipIdParamSchema = Joi.object({
    membershipId: commonSchemas.membershipId,
  });

  const userIdParamSchema = Joi.object({
    userId: commonSchemas.userId,
  });

  // Routes
  router.post(
    '/',
    ValidationMiddleware.validate(createMembershipSchema),
    membershipController.createMembership
  );

  router.get(
    '/',
    ValidationMiddleware.validateQuery(paginationSchema),
    membershipController.getMemberships
  );

  router.get(
    '/plans',
    membershipController.getPlans
  );

  router.get(
    '/:membershipId',
    ValidationMiddleware.validateParams(membershipIdParamSchema),
    membershipController.getMembershipById
  );

  router.put(
    '/:membershipId',
    ValidationMiddleware.validateParams(membershipIdParamSchema),
    ValidationMiddleware.validate(updateMembershipSchema),
    membershipController.updateMembership
  );

  router.delete(
    '/:membershipId',
    ValidationMiddleware.validateParams(membershipIdParamSchema),
    membershipController.deleteMembership
  );

  router.get(
    '/user/:userId',
    ValidationMiddleware.validateParams(userIdParamSchema),
    membershipController.getMembershipsByUserId
  );

  router.get(
    '/check-access/:userId',
    ValidationMiddleware.validateParams(userIdParamSchema),
    membershipController.checkAccess
  );

  return router;
};

export default createMembershipRoutes;