# Membership Service

Microservicio de gestión de membresías para sistema de gimnasio desarrollado con Node.js, TypeScript, Express y PostgreSQL.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [API Endpoints](#api-endpoints)
- [Tareas Programadas](#tareas-programadas)
- [Reglas de Negocio](#reglas-de-negocio)
- [Manejo de Errores](#manejo-de-errores)

## 🚀 Requisitos Previos

- Node.js (v18 o superior)
- Docker y Docker Compose
- npm o yarn

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd membership-service
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar PostgreSQL con Docker**
```bash
docker-compose up -d
```

4. **Verificar que PostgreSQL está corriendo**
```bash
docker ps
```

5. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Server
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/membership_db"

# CORS
CORS_ORIGIN=*

# User Service
USER_SERVICE_URL=http://localhost:3001
API_KEY=alex

# Membership Prices (COP)
MONTHLY_PRICE=30000.00
QUARTERLY_PRICE=75000.00
YEARLY_PRICE=324000.00

# Development Settings (Skip user validation)
SKIP_USER_VALIDATION=true
```

6. **Generar el cliente de Prisma**
```bash
npm run prisma:generate
```

7. **Ejecutar migraciones**
```bash
npm run prisma:migrate
```

## ⚙️ Configuración

### Precios de Membresías

Los precios están configurados en pesos colombianos (COP):

| Tipo | Duración | Precio |
|------|----------|---------|
| Mensual | 30 días | $30,000 |
| Trimestral | 90 días | $75,000 |
| Anual | 365 días | $324,000 |

### Base de Datos

psql -h localhost -p 5432 -U postgres -d membership_db


El servicio utiliza PostgreSQL en Docker. Las credenciales por defecto son:
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: membership_db
- **Puerto**: 5432

## 🏃 Ejecución

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm run build
npm start
```

### Comandos Útiles

```bash
# Ver interfaz visual de la base de datos
npm run prisma:studio

# Detener PostgreSQL
docker-compose down

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Reiniciar base de datos (elimina todos los datos)
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```
# REINICIO DESDE 0 DE CONTENEDORES Y CONFIGURACIONES 
- docker-compose down
- docker-compose build --no-cache
- docker-compose up -d

# IMPORTANTE CAMBIAR DE ESQUEMA EN LA BASE DE DATOS
- public: SET search_path TO public;
- users: SET search_path TO users;
- visualizar esquemas disponibles en la bd: SELECT schema_name FROM information_schema.schemata;

## 📡 API Endpoints

### Base URL
```
http://localhost:3002/api
```

### 1. **Obtener Información del Servicio**

```http
GET /
```

**Respuesta:**
```json
{
  "message": "Membership Service API",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. **Obtener Planes Disponibles**

```http
GET /api/memberships/plans
```

**Respuesta:**
```json
{
  "message": "Plans retrieved successfully",
  "data": {
    "plans": [
      {
        "type": "monthly",
        "name": "Mensual",
        "duration": 30,
        "price": 30000.00,
        "features": ["Acceso completo", "Horario regular"]
      },
      {
        "type": "quarterly",
        "name": "Trimestral",
        "duration": 90,
        "price": 75000.00,
        "features": ["Acceso completo", "Horario extendido", "10% descuento"]
      },
      {
        "type": "yearly",
        "name": "Anual",
        "duration": 365,
        "price": 324000.00,
        "features": ["Acceso completo", "Horario ilimitado", "20% descuento", "Sesión personal gratis"]
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. **Crear Membresía**

```http
POST /api/memberships
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user123",
  "type": "monthly",
  "startDate": "2025-10-27T00:00:00.000Z",
  "endDate": "2025-11-26T23:59:59.999Z",
  "price": 30000.00
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Membership created successfully",
  "data": {
    "membership": {
      "membershipId": "clx123abc",
      "userId": "user123",
      "type": "monthly",
      "startDate": "2025-10-27T00:00:00.000Z",
      "endDate": "2025-11-26T23:59:59.999Z",
      "price": 30000.00,
      "status": "active",
      "createdAt": "2025-10-27T22:30:00.000Z",
      "updatedAt": "2025-10-27T22:30:00.000Z"
    }
  },
  "timestamp": "2025-10-27T22:30:00.000Z"
}
```

**Errores Comunes:**
- `400`: Usuario ya tiene una membresía activa
- `400`: Fecha de inicio en el pasado
- `400`: Fecha de fin antes de la fecha de inicio

---

### 4. **Obtener Todas las Membresías (con Paginación)**

```http
GET /api/memberships?page=1&limit=10&status=active&type=monthly&userId=user123&search=user
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página (default: 1) |
| limit | number | No | Elementos por página (default: 10) |
| status | string | No | Filtrar por estado: active, expired, cancelled |
| type | string | No | Filtrar por tipo: monthly, quarterly, yearly |
| userId | string | No | Filtrar por ID de usuario |
| search | string | No | Búsqueda por texto |

**Respuesta:**
```json
{
  "message": "Memberships retrieved successfully",
  "data": {
    "memberships": [
      {
        "membershipId": "clx123abc",
        "userId": "user123",
        "type": "monthly",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2024-02-14T23:59:59.999Z",
        "price": 30000.00,
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 5. **Obtener Membresía por ID**

```http
GET /api/memberships/:membershipId
```

**Respuesta (200):**
```json
{
  "message": "Membership retrieved successfully",
  "data": {
    "membership": {
      "membershipId": "clx123abc",
      "userId": {},
      "type": "monthly",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-02-14T23:59:59.999Z",
      "price": 30000.00,
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error (404):**
```json
{
  "error": "Membership not found",
  "message": "Membership with ID clx123abc not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/memberships/clx123abc"
}
```

---

### 6. **Obtener Membresías de un Usuario**

```http
GET /api/memberships/user/:userId
```

**Respuesta:**
```json
{
  "message": "User memberships retrieved successfully",
  "data": {
    "memberships": [
      {
        "membershipId": "clx123abc",
        "userId": "user123",
        "type": "monthly",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2024-02-14T23:59:59.999Z",
        "price": 30000.00,
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 7. **Actualizar Membresía**

```http
PUT /api/memberships/:membershipId
```

**Body:**
```json
{
  "type": "yearly",
  "endDate": "2025-01-14T23:59:59.999Z",
  "price": 324000.00,
  "status": "active"
}
```

**Respuesta (200):**
```json
{
  "message": "Membership updated successfully",
  "data": {
    "membership": {
      "membershipId": "clx123abc",
      "userId": "user123",
      "type": "yearly",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2025-01-14T23:59:59.999Z",
      "price": 324000.00,
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

### 8. **Eliminar Membresía**

```http
DELETE /api/memberships/:membershipId
```

**Respuesta (204 No Content)**

**Error (404):**
```json
{
  "error": "Membership not found",
  "message": "Membership with ID clx123abc not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/memberships/clx123abc"
}
```

---

### 9. **Verificar Acceso de Usuario**

```http
GET /api/memberships/check-access/:userId
```

**Respuesta:**
```json
{
  "message": "Access check completed",
  "data": {
    "hasAccess": true,
    "membership": {
      "membershipId": "clx123abc",
      "type": "monthly",
      "status": "active",
      "endDate": "2024-02-14T23:59:59.999Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ⏰ Tareas Programadas

El servicio incluye tareas programadas automáticas:

### Actualización de Membresías Expiradas
- **Frecuencia**: Diariamente a medianoche (00:00)
- **Función**: Cambia el estado de membresías activas con fecha de fin pasada a `expired`
- **Log**: Se registra la cantidad de membresías actualizadas

### Verificación de Membresías por Expirar
- **Frecuencia**: Diariamente a las 9 AM
- **Función**: Identifica membresías que expirarán en los próximos 7 días
- **Log**: Se registra la cantidad de membresías próximas a expirar
- **Uso**: Puede integrarse con un sistema de notificaciones

---

## 📋 Reglas de Negocio

### Creación de Membresías

1. **Membresía Única Activa**
   - Un usuario no puede tener múltiples membresías activas simultáneamente
   - Si intenta crear una nueva, se rechaza con error 400

2. **Validación de Fechas**
   - La fecha de inicio no puede ser en el pasado
   - La fecha de fin debe ser posterior a la fecha de inicio
   - Las fechas deben estar en formato ISO 8601
   - Ejemplo válido: `2025-10-27T00:00:00.000Z`

3. **Validación de Usuario**
   - El usuario debe existir en el servicio de usuarios (si `SKIP_USER_VALIDATION=false`)
   - En modo desarrollo, se puede saltar esta validación con `SKIP_USER_VALIDATION=true`

### Actualización de Membresías

1. **Upgrade de Tipo**
   - No se permite degradar el tipo de membresía (ej: anual → mensual)
   - Solo se permiten upgrades o mantener el mismo tipo

2. **Recálculo Automático**
   - Si se cambia el tipo, se recalcula automáticamente el precio y duración
   - Los precios se obtienen de las variables de entorno

3. **Estados Válidos**
   - `active`: Membresía activa y vigente
   - `expired`: Membresía vencida
   - `cancelled`: Membresía cancelada manualmente

### Precios y Duración

| Tipo | Duración | Precio (COP) |
|------|----------|--------------|
| Mensual | 30 días | $30,000.00 |
| Trimestral | 90 días | $75,000.00 |
| Anual | 365 días | $324,000.00 |

---

## ⚠️ Manejo de Errores

El servicio utiliza un manejo de errores centralizado con los siguientes códigos HTTP:

### Códigos de Estado

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `204` | No Content | Recurso eliminado exitosamente |
| `400` | Bad Request | Solicitud inválida o datos incorrectos |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error interno del servidor |

### Formato de Respuesta de Error

```json
{
  "error": "Tipo de error",
  "message": "Descripción detallada del error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/memberships/123"
}
```

### Errores Comunes

**400 - Bad Request**
```json
{
  "error": "Failed to create membership",
  "message": "User already has an active membership",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/memberships"
}
```

**404 - Not Found**
```json
{
  "error": "Membership not found",
  "message": "Membership with ID clx123abc not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/memberships/clx123abc"
}
```

**500 - Internal Server Error**
```json
{
  "error": "Failed to retrieve memberships",
  "message": "Database connection error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/memberships"
}
```

---

## 🧪 Pruebas con cURL

### Obtener planes
```bash
curl http://localhost:3002/api/memberships/plans
```

### Crear membresía mensual
```bash
curl -X POST http://localhost:3002/api/memberships \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "monthly",
    "startDate": "2025-10-27T00:00:00.000Z",
    "endDate": "2025-11-26T23:59:59.999Z",
    "price": 30000.00
  }'
```

### Crear membresía trimestral
```bash
curl -X POST http://localhost:3002/api/memberships \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user456",
    "type": "quarterly",
    "startDate": "2025-10-27T00:00:00.000Z",
    "endDate": "2026-01-25T23:59:59.999Z",
    "price": 75000.00
  }'
```

### Crear membresía anual
```bash
curl -X POST http://localhost:3002/api/memberships \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user789",
    "type": "yearly",
    "startDate": "2025-10-27T00:00:00.000Z",
    "endDate": "2026-10-27T23:59:59.999Z",
    "price": 324000.00
  }'
```

### Obtener todas las membresías
```bash
curl "http://localhost:3002/api/memberships?page=1&limit=10"
```

### Obtener membresías por usuario
```bash
curl http://localhost:3002/api/memberships/user/user123
```

### Verificar acceso
```bash
curl http://localhost:3002/api/memberships/check-access/user123
```

### Actualizar membresía
```bash
curl -X PUT http://localhost:3002/api/memberships/clx123abc \
  -H "Content-Type: application/json" \
  -d '{
    "type": "yearly",
    "endDate": "2026-10-27T23:59:59.999Z",
    "price": 324000.00
  }'
```

### Eliminar membresía
```bash
curl -X DELETE http://localhost:3002/api/memberships/clx123abc
```

---

## 💡 Notas Importantes

### Modo Desarrollo

El servicio incluye una configuración especial para desarrollo que permite crear membresías sin validar usuarios contra el User Service:

```env
SKIP_USER_VALIDATION=true
```

Cuando esta opción está habilitada:
- ✅ No se requiere que el User Service esté corriendo
- ✅ Se acepta cualquier `userId` sin validación
- ⚠️ Solo debe usarse en desarrollo/testing
- ⚠️ En producción, debe estar en `false` o removerse

### Fechas Importantes

Recuerda que las fechas deben ser actuales o futuras:
- ❌ **Incorrecto**: `"startDate": "2024-01-15T00:00:00.000Z"` (fecha pasada)
- ✅ **Correcto**: `"startDate": "2025-10-27T00:00:00.000Z"` (fecha actual/futura)

### Cálculo de Fechas por Tipo

| Tipo | Duración | Ejemplo startDate | Ejemplo endDate |
|------|----------|-------------------|-----------------|
| monthly | 30 días | 2025-10-27 | 2025-11-26 |
| quarterly | 90 días | 2025-10-27 | 2026-01-25 |
| yearly | 365 días | 2025-10-27 | 2026-10-27 |

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime
- **TypeScript** - Lenguaje
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **Docker** - Contenedores
- **Joi** - Validación de datos
- **node-cron** - Tareas programadas

---

## 📝 Licencia

MIT

---

## 👥 Autor

Gym Management System Team