import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Routine } from './models/routine.model';
import { Exercise } from './models/exercise.model';
import { RoutineExercise } from './models/routineExercise.model';
import dotenv from 'dotenv';

dotenv.config();

const DB_TYPE = (process.env.DB_TYPE || 'postgres').toLowerCase();
const isProduction = process.env.NODE_ENV === 'production';

// Esquema a usar en Postgres. Si no se define, TypeORM usará el esquema por defecto (public).
const DB_SCHEMA = process.env.DB_SCHEMA || undefined;

function parsePort(p: string | undefined, defaultPort: number) {
  if (!p) return defaultPort;
  const n = Number(p);
  return Number.isNaN(n) ? defaultPort : n;
}

export const AppDataSource = new DataSource({
  type: DB_TYPE as any,
  host: process.env.DB_HOST || (DB_TYPE === 'postgres' ? 'localhost' : 'localhost'),
  port: parsePort(process.env.DB_PORT, DB_TYPE === 'postgres' ? 5432 : 3306),
  username: process.env.DB_USER || (DB_TYPE === 'postgres' ? 'postgres' : 'root'),
  password: process.env.DB_PASSWORD || (DB_TYPE === 'postgres' ? 'postgres' : 'root'),
  database: process.env.DB_NAME || 'gym_routines',
  // Si DB_SCHEMA está definida, la pasamos para que TypeORM use ese esquema por defecto.
  schema: DB_SCHEMA,
  synchronize: !isProduction, // sincroniza en desarrollo, usa migrations en producción
  logging: false,
  entities: [Routine, Exercise, RoutineExercise],
  migrations: ['dist/migrations/*.js'],
});
