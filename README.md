# Menu Tree API

A hierarchical menu management system built with NestJS and PostgreSQL. The API provides endpoints for creating, updating, reordering, and moving menu items within a tree structure.

## Features

- **Hierarchical Menu Management**: Create nested menu structures with parent-child relationships
- **Smart Ordering**: Automatic order management with conflict handling and sibling rearrangement
- **RESTful API**: Clean endpoints for all CRUD operations
- **Tree Structure**: Retrieve menus as an organized tree with nested children
- **Validation**: Built-in request validation using class-validator
- **API Documentation**: Interactive Swagger UI for testing endpoints

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Installation

### 1. Clone repository
```bash
git clone <your-repo-url>
cd nest_js_CRUD
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=menu_tree_db
```

### 4. Create database
```bash
createdb menu_tree_db
```

### 5. Run migrations
```bash
npm run typeorm migration:run
```

### 6. Start development server
```bash
npm run start:dev
```

The server runs on `http://localhost:5000` by default.

## Database Schema

The `menus` table:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Menu item identifier |
| name | VARCHAR(255) | NOT NULL | Menu display name |
| parent_id | INTEGER | FOREIGN KEY (nullable) | Reference to parent menu |
| order | INTEGER | NOT NULL, DEFAULT 0 | Display order among siblings |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

## API Endpoints

### Get all menus
```
GET /api/menus
```

Returns all menus organized as a tree structure.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Home",
    "order": 1,
    "parent_id": null,
    "children": [
      {
        "id": 2,
        "name": "About",
        "order": 1,
        "parent_id": 1,
        "children": []
      }
    ]
  }
]
```

### Get single menu
```
GET /api/menus/:id
```

### Create menu
```
POST /api/menus
Content-Type: application/json

{
  "name": "Products",
  "parent_id": 1,
  "order": 2
}
```

**Notes:**
- `parent_id` is optional (null for root menus)
- `order` is optional (defaults to last position)
- If `order` conflicts with existing siblings, they shift automatically

### Update menu
```
PUT /api/menus/:id
Content-Type: application/json

{
  "name": "Services"
}
```

### Move menu to different parent
```
PATCH /api/menus/:id/move
Content-Type: application/json

{
  "parentId": 3,
  "order": 2
}
```

**Behavior:**
- If `order` is not provided, item is placed at the end
- If siblings exist at target parent and order is specified, reorder logic applies
- If no siblings exist, order is set to 1

### Reorder menu among siblings
```
PATCH /api/menus/:id/reorder
Content-Type: application/json

{
  "order": 1
}
```

**Notes:**
- Order is 1-based (minimum is 1, cannot be 0)
- Siblings at or after the new position shift down by 1

### Delete menu
```
DELETE /api/menus/:id
```

Deletes the menu and all its descendants.

## Ordering Logic

### When Creating with Specified Order
If creating a menu with `order: 2` when 3 siblings exist:
- Item 1 (order 1) → stays at order 1
- Item 2 (order 2) → shifts to order 3
- Item 3 (order 3) → shifts to order 4
- New item → placed at order 2

### When Moving Between Parents
- No siblings in target: order becomes 1
- With siblings + order specified: reorder logic applies
- With siblings, no order: item placed at last position

### When Reordering
Menu 3 reordered to order 1 when 3 siblings exist:
- Menu 3 → order 1
- Menu 1 → order 2
- Menu 2 → order 3

## API Documentation

Interactive API docs available at:
```
http://localhost:5000/api/docs
```

## Available Scripts

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Debugging
npm run start:debug

# Testing
npm test
npm run test:watch
npm run test:cov

# Code quality
npm run lint
npm run format
```

## Project Structure

```
src/
├── database/
│   └── migrations/          # Database migrations
├── menus/
│   ├── dto/
│   │   ├── create-menu.dto.ts
│   │   ├── update-menu.dto.ts
│   │   └── reorder-menu.dto.ts
│   ├── menu.entity.ts       # TypeORM entity
│   ├── menu.service.ts      # Business logic
│   ├── menucontroller.ts    # HTTP handlers
│   └── menu.module.ts       # Module definition
├── app.module.ts
└── main.ts
```

## Error Responses

The API returns standard HTTP status codes:

- `200` — Success
- `201` — Created
- `400` — Bad request (validation error, invalid operation)
- `404` — Not found
- `500` — Server error

Error response example:
```json
{
  "message": "Menu #5 not found",
  "statusCode": 404
}
```

## License

UNLICENSED