# Menu Tree Backend

RESTful API for hierarchical menu tree management built with NestJS + PostgreSQL.

## Tech Stack
- NestJS (TypeScript)
- PostgreSQL
- TypeORM
- Swagger/OpenAPI

## Prerequisites
- Node.js >= 18
- PostgreSQL

## Setup

### 1. Clone repository
git clone <your-repo-url>
cd menu-tree-backend

### 2. Install dependencies
npm install

### 3. Setup environment
cp .env.example .env
# Edit .env sesuai kredensial database kamu

### 4. Setup database
# Buat database di PostgreSQL, lalu jalankan SQL berikut:
CREATE TABLE menus (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  parent_id   INTEGER NULL REFERENCES menus(id) ON DELETE CASCADE,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

### 5. Run development
npm run start:dev

## API Documentation
Swagger UI tersedia di:
http://localhost:3000/api/docs

## API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | /api/menus                | Get all menus (tree structure)     |
| GET    | /api/menus/:id            | Get single menu                    |
| POST   | /api/menus                | Create new menu                    |
| PUT    | /api/menus/:id            | Update menu                        |
| DELETE | /api/menus/:id            | Delete menu and its children       |
| PATCH  | /api/menus/:id/move       | Move menu to different parent      |
| PATCH  | /api/menus/:id/reorder    | Reorder menu within same level     |

## Architecture
- **Controller** — handle HTTP request/response
- **Service** — business logic
- **Entity** — database model (TypeORM)
- **DTO** — input validation