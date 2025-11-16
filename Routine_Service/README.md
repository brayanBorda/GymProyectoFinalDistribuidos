# Routine Service (GYM)

Microservicio `routine-service` para gestionar rutinas y ejercicios. Está escrito en TypeScript (Express + TypeORM) y persiste en PostgreSQL.

Este README contiene instrucciones para ejecutar el servicio localmente y con Docker, ejemplos de requests y comandos útiles para inspeccionar la base de datos.

## Requisitos
- Node 18+ (desarrollo local)
- Docker + Docker Compose (para ejecutar el stack en contenedores)

## Variables de entorno (principales)
- DB_TYPE (postgres)
- DB_HOST (p. ej. `postgres` en compose)
- DB_PORT (5432)
- DB_USER, DB_PASSWORD
- DB_NAME (p. ej. `gym_routines` o `membership_db` si usas el compose raíz)
- PORT (por defecto 4002)
- NODE_ENV (`development` | `production`)

Guarda credenciales fuera del repo (usa `.env` o `env_file` en compose).

## Ejecutar en desarrollo (local)
1) Instala dependencias:

```powershell
npm ci
```

2) Ejecuta en modo desarrollo (hot-reload):

```powershell
npm run dev
```

3) Compilar y ejecutar producción localmente:

```powershell
npm run build
npm start
```

> Importante: TypeORM usa `synchronize` en development. No lo uses en producción; usa migraciones.

## Ejecutar con Docker
Tienes dos formas de correrlo:

Opcion 1
- Levantar solo este servicio (desde `Routine_Service`):

```powershell
cd Routine_Service
docker compose up --build -d
```
Opcion 2 (recomendado)
- Levantar todo el proyecto (desde la raíz del repo). Esto orquesta `postgres`, `user-service` y `routine-service` y crea la BD `membership_db`:

```powershell
cd <repo-root>
docker compose up --build -d
```

Parar y limpiar volúmenes:

```powershell
docker compose down -v
```

Notas:
- En el compose raíz la DB se llama `membership_db`. `user-service` usa el schema `users` (su DATABASE_URL contiene `?schema=users`) y `routine-service` crea tablas en `public` por defecto.
- Si quieres un schema separado para rutinas, añade `DB_SCHEMA` y configura TypeORM (`schema` en DataSource).

## API — endpoints y ejemplos de body (JSON)
Base URL: `http://localhost:4002`

1) Health
- GET /health
- Respuesta: 200 `{ "status": "ok", "service": "routine-service", "timestamp": "..." }`

2) Exercises
- GET /api/exercises — listar
- GET /api/exercises/:id — obtener
- POST /api/exercises — crear

Ejemplo POST /api/exercises:

```json
{
  "name": "Back Squat",
  "muscle_group": "piernas",
  "description": "Sentadilla trasera con barra",
  "equipment": "barra",
  "calories_burned_avg": 45.5
}
```

Respuesta esperada: 201 y `{ success: true, data: { ... } }` con el `exercise_id`.

3) Routines
- GET /api/routines/:id — por id (incluye ejercicios anidados)
- GET /api/routines/user/:userId — por usuario
- POST /api/routines — crear rutina

El servicio acepta aliases en el body: `userId` o `clientId`, `name` o `routineName`, `type` o `difficulty`.

Ejemplo POST /api/routines:

```json
{
  "userId": 1,
  "trainerId": 2,
  "name": "Fuerza pierna 6 semanas",
  "goal": "Hipertrofia",
  "type": "fuerza",
  "durationWeeks": 6,
  "status": "active",
  "exercises": [
    { "exerciseId": 1, "sets": 4, "reps": 6, "weight": 80.0, "rest_time_sec": 120, "orderInRoutine": 1 }
  ]
}
```

Respuesta esperada: 201 `{ success: true, data: { ... } }` con la rutina y sus ejercicios.

Errores comunes:
- 400 si no envías `userId`/`clientId`.
- 400/500 por FK violation si algún `exerciseId` no existe — crea los exercises primero con `POST /api/exercises`.

## Probar con Postman
- En el repo ya hay una colección: `Routine_Service/postman_collection_routine_service.postman_collection.json`.
- Secuencia sugerida: POST /api/exercises → GET /api/exercises (copiar ids) → POST /api/routines (usar esos exerciseId) → GET /api/routines/user/:userId.

---

## Inspección de la base de datos (psql)
Si usas el compose raíz (membership_db):

```powershell
docker compose exec postgres psql -U postgres -d membership_db
\dt public.*
\dt users.*
SELECT * FROM public.exercises LIMIT 10;
SELECT * FROM public.routines LIMIT 10;
SELECT * FROM public.routine_exercises LIMIT 10;
\q
```

Si prefieres crear objetos DB por SQL al arranque, añade tus scripts a `init-scripts/` y móntalos en `/docker-entrypoint-initdb.d` (se ejecutan solo en el primer arranque cuando el volumen está vacío).

## Producción y migraciones
- No uses `synchronize: true` en producción.
- Genera y aplica migraciones TypeORM o SQL y ejecútalas en el deploy pipeline.

---

Si quieres, puedo:
- añadir tests automatizados (Jest) para endpoints básicos,
- añadir validaciones (Joi/Zod) en la capa de controlador,
- o crear migraciones de ejemplo para las entidades.

Fin.
