# Medtrum-admin (NestJS + MongoDB)

Admin para insumos, pacientes, reclamos y organizaciones. Incluye:
- Auth JWT
- Roles: `superadmin`, `admin`, `patient`
- Módulos: users, organizations, patients, supplies, claims
- Export a Excel (exceljs)

## Setup
```bash
cp .env.example .env
npm i
npm run start:dev
```
Conéctate a `process.env.MONGO_URI` (MongoDB Atlas o local).

## Endpoints clave
- `POST /auth/login` — email + password → JWT
- `POST /users` — crea usuario (requiere `admin` o `superadmin`)
- `POST /supplies/:id/deliver` — asigna insumos a paciente
- `POST /claims` — crea reclamo (paciente)
- `PATCH /claims/:id/status` — aprueba/rechaza reclamo (admin)
- `GET /patients/export` — Excel de pacientes
