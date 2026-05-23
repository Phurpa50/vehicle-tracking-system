# TrackNet Backend API

A RESTful API for the TrackNet vehicle tracking system, built with Express.js, TypeScript, and MySQL.

## Features

- 🔐 JWT-based authentication
- 🚗 Vehicle management (CRUD operations)
- 📍 Real-time location tracking
- 🔄 WebSocket support for live updates
- 🛡️ Security middleware (helmet, rate limiting, CORS)
- ✅ Input validation with express-validator

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=tracknet
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   PORT=3001
   FRONTEND_URL=http://localhost:9003
   ```

4. **Set up MySQL database:**
   - Create a MySQL database named `tracknet`
   - Or update the `DB_NAME` in your `.env` file

5. **Run database migrations:**

   ```bash
   npm run db:migrate
   ```

6. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

### Running the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Vehicles (Protected Routes)

All vehicle routes require authentication (Bearer token in Authorization header).

- `GET /api/vehicles` - Get all user's vehicles
- `GET /api/vehicles/:id` - Get specific vehicle
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `PUT /api/vehicles/:id/location` - Update vehicle location
- `GET /api/vehicles/:id/history` - Get location history

### Health Check

- `GET /health` - Server health status

## WebSocket Events

The server supports real-time updates via Socket.IO:

- `join-vehicle-room` - Join a vehicle's real-time update room
- `leave-vehicle-room` - Leave a vehicle's real-time update room

## Data Models

### User

```typescript
{
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Vehicle

```typescript
{
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  status: 'active' | 'idle' | 'stopped' | 'offline';
  lat: number;
  lng: number;
  last_location_update?: Date;
  created_at: Date;
  updated_at: Date;
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run typecheck` - Run TypeScript type checking

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   └── vehicles.ts          # Vehicle routes
│   ├── services/
│   │   ├── userService.ts       # User business logic
│   │   └── vehicleService.ts    # Vehicle business logic
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   └── auth.ts              # Authentication utilities
│   ├── scripts/
│   │   ├── migrate.ts           # Database migration script
│   │   └── seed.ts              # Database seeding script
│   └── server.ts                # Main server file
├── schema.sql                   # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation with express-validator

## License

This project is part of the TrackNet vehicle tracking system.
