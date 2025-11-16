import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

export class ValidationMiddleware {
  static validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map(detail => detail.message);
        throw createError('Validation failed', 400);
      }

      req.body = value;
      next();
    };
  };

  static validateQuery = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map(detail => detail.message);
        throw createError('Query validation failed', 400);
      }

      req.query = value;
      next();
    };
  };

  static validateParams = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map(detail => detail.message);
        throw createError('Parameters validation failed', 400);
      }

      req.params = value;
      next();
    };
  };
}

// Common validation schemas
export const commonSchemas = {
  membershipId: Joi.string().required().messages({
    'string.empty': 'Membership ID is required',
    'any.required': 'Membership ID is required',
  }),

  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  membershipFilters: Joi.object({
    userId: Joi.string(),
    status: Joi.string().valid('active', 'expired', 'cancelled'),
    type: Joi.string().valid('monthly', 'quarterly', 'yearly'),
    search: Joi.string().min(1).max(100),
  }),
};