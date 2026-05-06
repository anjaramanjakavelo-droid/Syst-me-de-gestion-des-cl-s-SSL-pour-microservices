# Backend - Laravel API

RESTful API for SSL Certificate Management System built with Laravel 12 and Sanctum.

## Quick Start

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API: `http://localhost:8000/api`

## Key Features

- **Sanctum Authentication**: Token-based API authentication
- **Role-Based Access Control**: Admin and Service user roles
- **OpenSSL Integration**: Generate, renew, revoke SSL certificates
- **Private Key Encryption**: AES-256 encryption for stored private keys
- **Certificate Monitoring**: Track expiration and automatic status updates
- **RESTful API**: Full CRUD operations on services and certificates

## Project Structure

```
app/Models/              - Eloquent models (User, Service, Certificat, Renouvellement)
app/Http/Controllers/   - API controllers with business logic
app/Http/Middleware/    - Authorization middleware (AdminRole, ServiceRole)
database/migrations/    - Database schema
database/seeders/       - Test data seeding
routes/api.php          - API routes with authentication
```

## API Endpoints

See [API_REFERENCE.md](../API_REFERENCE.md) for complete documentation.

### Authentication
- `POST /api/login` - Get auth token
- `POST /api/logout` - Revoke token
- `GET /api/user` - Current user info

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create (admin)
- `GET /api/services/{id}` - Show details
- `PUT /api/services/{id}` - Update (admin)
- `DELETE /api/services/{id}` - Delete (admin)

### Certificates
- `GET /api/certificats` - List certificates
- `POST /api/certificats` - Generate (admin)
- `GET /api/certificats/{id}` - Show details
- `POST /api/certificats/{id}/renew` - Renew (admin)
- `POST /api/certificats/{id}/revoke` - Revoke (admin)
- `DELETE /api/certificats/{id}` - Delete (admin)

### Monitoring
- `GET /api/check-expiration` - Certificate statistics (admin)

## Database Models

**User** - id, name, email, password, role (admin/service)
**Service** - id, nom, description
**Certificat** - id, service_id, certificat (PEM), cle_privee (encrypted), date_creation, date_expiration, statut
**Renouvellement** - id, certificat_id, dates and renewal info

## Security

- Private keys encrypted with AES-256-CBC
- Passwords hashed with Bcrypt
- API tokens hashed via Sanctum
- Role-based middleware for sensitive operations
- Input validation on all endpoints

## Environment Setup

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed sample data
php artisan db:seed

# Server
php artisan serve
```

## Demo Credentials

- **Admin**: admin@example.com / admin123
- **Service**: service@example.com / service123

## Documentation

- [Laravel Docs](https://laravel.com/docs)
- [Sanctum](https://laravel.com/docs/sanctum)
- [Eloquent ORM](https://laravel.com/docs/eloquent)

---

For complete setup guide, see [SETUP_GUIDE.md](../SETUP_GUIDE.md)


We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
