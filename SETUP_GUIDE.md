# SSL Certificate Management System - Setup Guide

A complete microservices SSL certificate management platform built with Laravel backend and React frontend.

## 📋 Prerequisites

- PHP 8.2+ (with OpenSSL extension)
- Node.js 18+ and npm
- MySQL 8.0+
- Composer
- XAMPP (for local development)

## 🚀 Quick Start

### 1. Backend Setup (Laravel)

#### Step 1: Install Dependencies
```bash
cd backend
composer install
```

#### Step 2: Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Update .env with your database credentials (XAMPP default):
# DB_HOST=localhost
# DB_PORT=3306
# DB_DATABASE=gestion_microservice
# DB_USERNAME=root
# DB_PASSWORD=
```

#### Step 3: Database Setup
```bash
# Create database in MySQL
# CREATE DATABASE gestion_microservice;

# Run migrations
php artisan migrate

# Seed sample data
php artisan db:seed
```

#### Step 4: Start the Server
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

### 2. Frontend Setup (React)

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Environment Setup
```bash
# Create .env file
cp .env.example .env

# Verify API configuration
# VITE_API_BASE_URL=http://localhost:8000/api
```

#### Step 3: Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 Demo Credentials

### Admin User
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** Full access to all features (create, read, update, delete)

### Service User
- **Email:** service@example.com
- **Password:** service123
- **Role:** Read-only access to services and certificates

## 📊 Features

### Backend Features

#### Authentication & Authorization
- Sanctum-based token authentication
- Role-based access control (Admin / Service)
- Secure token management

#### Services Management
- Create, read, update, delete services
- Associate certificates with services
- Admin-only modification

#### Certificate Management
- Generate self-signed SSL certificates using OpenSSL
- Encrypt private keys before storage
- Track certificate expiration dates
- Renew expiring certificates
- Revoke compromised certificates
- Monitor certificate status

#### Certificate Monitoring
- Check certificate expiration status
- Get statistics on certificate states
- Track certificates expiring within 30 days
- Automatic status updates

### Frontend Features

#### Dashboard
- Overview of certificate statistics (admin only)
- Quick access to main features
- User information display
- Certificate status at a glance

#### Services View
- Browse all services
- Create new services (admin only)
- Delete services (admin only)
- View associated certificates

#### Certificates View
- List all certificates with status indicators
- Filter by certificate status
- Generate new certificates (admin only)
- Renew active certificates (admin only)
- Revoke certificates (admin only)
- Delete certificates (admin only)
- View expiration countdown

## 🔧 API Endpoints

### Authentication
```
POST   /api/login              - Login and get token
POST   /api/logout             - Logout and revoke token
GET    /api/user               - Get current user info
```

### Services
```
GET    /api/services           - List all services
GET    /api/services/{id}      - Get service details
POST   /api/services           - Create service (admin only)
PUT    /api/services/{id}      - Update service (admin only)
DELETE /api/services/{id}      - Delete service (admin only)
```

### Certificates
```
GET    /api/certificats        - List certificates (with filters)
GET    /api/certificats/{id}   - Get certificate details
POST   /api/certificats        - Generate certificate (admin only)
POST   /api/certificats/{id}/renew   - Renew certificate (admin only)
POST   /api/certificats/{id}/revoke  - Revoke certificate (admin only)
DELETE /api/certificats/{id}   - Delete certificate (admin only)
```

### Monitoring
```
GET    /api/check-expiration   - Check all certificates expiration (admin only)
```

## 🗄️ Database Schema

### users
- `id` - Primary key
- `name` - User name
- `email` - User email (unique)
- `password` - Hashed password
- `role` - 'admin' or 'service'
- `created_at` - Creation timestamp

### services
- `id` - Primary key
- `nom` - Service name
- `description` - Service description
- `created_at` / `updated_at` - Timestamps

### certificats
- `id` - Primary key
- `service_id` - Foreign key to services
- `certificat` - PEM-encoded certificate
- `cle_privee` - Encrypted private key
- `date_creation` - Certificate creation date
- `date_expiration` - Certificate expiration date
- `statut` - Status (actif, expire, revoque)
- `created_at` / `updated_at` - Timestamps

### renouvellements
- `id` - Primary key
- `certificat_id` - Foreign key to certificats
- `date_renouvellement` - Renewal date
- `ancienne_date_expiration` - Previous expiration date
- `nouvelle_date_expiration` - New expiration date
- `created_at` / `updated_at` - Timestamps

## 🔒 Security Features

### Encryption
- Private keys are encrypted using Laravel's Crypt facade (AES-128/256)
- Stored encrypted in database
- Decrypted only when needed and immediately after use

### Authentication
- Laravel Sanctum provides stateless API authentication
- Tokens are hashed and stored in database
- Token can be revoked on logout

### Authorization
- Role-based middleware for sensitive operations
- Admin-only endpoints for certificate generation and modification
- Service role for read-only access

### Input Validation
- All inputs validated on backend
- Email and domain validation
- Certificate validity period validation (1-3650 days)

## 🐛 Troubleshooting

### Backend Issues

**"SQLSTATE[HY000] [2002] Connection refused"**
- Ensure MySQL server is running in XAMPP
- Check DB credentials in .env file

**"Specified key was too long" error during migration**
- Run: `php artisan migrate:refresh --seed`
- Ensure MySQL charset is set to utf8mb4 in config/database.php

**"Class not found" errors**
- Run: `composer dump-autoload`
- Run: `php artisan config:cache`

### Frontend Issues

**"Cannot GET /dashboard" after login**
- Ensure frontend dev server is running (`npm run dev`)
- Check that react-router-dom is installed

**API returns 401 Unauthorized**
- Clear browser localStorage and try logging in again
- Check that backend token generation is working

**"Failed to fetch" errors**
- Verify backend is running on http://localhost:8000
- Check CORS headers in backend (should allow localhost:5173)

## 📝 Development Workflow

### Backend Development
1. Create/modify models in `app/Models/`
2. Create migrations for schema changes in `database/migrations/`
3. Create controllers in `app/Http/Controllers/API/`
4. Define routes in `routes/api.php`
5. Test endpoints with Postman or similar tool

### Frontend Development
1. Create pages in `src/pages/`
2. Create reusable components in `src/components/`
3. Update API service in `src/services/api.js`
4. Update routing in `src/App.jsx`
5. Test components in browser dev tools

## 🧪 Testing the Application

### Manual Testing Flow

1. **Login Test**
   - Navigate to http://localhost:5173
   - Login with admin credentials
   - Verify dashboard loads with statistics

2. **Services Management**
   - Create a new service
   - View service details
   - Verify certificate count

3. **Certificate Generation**
   - Go to Certificates page
   - Click "Generate Certificate"
   - Select a service and domain
   - Generate certificate
   - Verify certificate appears in list

4. **Certificate Renewal**
   - Find a certificate
   - Click "Renew" button
   - Verify new expiration date is updated

5. **Role-Based Access**
   - Login as service user
   - Verify create/delete/renew buttons are not visible
   - Logout and try accessing admin endpoints

## 📦 Deployment Notes

### Production Build

#### Backend
```bash
# Set environment to production
APP_ENV=production
APP_DEBUG=false

# Run migrations
php artisan migrate

# Optimize application
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Frontend
```bash
# Build for production
npm run build

# Deploy dist/ folder to web server
```

### Environment Variables Checklist
- [ ] APP_KEY is set (run: php artisan key:generate)
- [ ] APP_URL points to correct domain
- [ ] DB credentials are secure
- [ ] MAIL configuration if needed
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured

## 📞 Support

For issues or questions, check:
1. Application logs: `storage/logs/laravel.log`
2. Browser console: F12 → Console tab
3. Network requests: F12 → Network tab

## 📄 License

This project is provided as-is for educational purposes.

## 🎯 Next Steps

1. **Add Docker support** - Create Dockerfile and docker-compose.yml
2. **Add automated certificate monitoring** - Create Laravel command for background checks
3. **Add Nginx HTTPS configuration** - Create example nginx.conf for HTTPS setup
4. **Add automated tests** - Create PHPUnit and Jest test suites
5. **Add API documentation** - Generate OpenAPI/Swagger documentation
6. **Add email notifications** - Setup email alerts for expiring certificates

---

Built with ❤️ using Laravel, React, and Vite
