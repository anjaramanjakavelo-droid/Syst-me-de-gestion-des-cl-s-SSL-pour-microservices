# API Reference

Base URL: `http://localhost:8000/api`

## Authentication

### Login
```
POST /login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "1|xxxxxxxxxxx"
}
```

### Logout
```
POST /logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
```
GET /user
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    ...
  }
}
```

## Services

### List Services
```
GET /services
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "API Gateway",
      "description": "Main API gateway for microservices",
      "created_at": "2024-05-01T12:00:00.000000Z",
      "updated_at": "2024-05-01T12:00:00.000000Z"
    }
  ]
}
```

### Get Service Details
```
GET /services/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "API Gateway",
    "description": "Main API gateway for microservices",
    "certificats": [
      {
        "id": 1,
        "service_id": 1,
        "date_expiration": "2025-05-01",
        "statut": "actif",
        ...
      }
    ],
    "created_at": "2024-05-01T12:00:00.000000Z"
  }
}
```

### Create Service (Admin Only)
```
POST /services
Authorization: Bearer {token}
Content-Type: application/json

{
  "nom": "New Service",
  "description": "Service description"
}

Response:
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": 3,
    "nom": "New Service",
    "description": "Service description",
    ...
  }
}
```

### Update Service (Admin Only)
```
PUT /services/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nom": "Updated Name",
  "description": "Updated description"
}

Response:
{
  "success": true,
  "message": "Service updated successfully",
  "data": {...}
}
```

### Delete Service (Admin Only)
```
DELETE /services/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Service deleted successfully"
}
```

## Certificates

### List Certificates
```
GET /certificats[?service_id={id}&statut={status}]
Authorization: Bearer {token}

Filters:
- service_id: Filter by service ID
- statut: Filter by status (actif, expire, revoque)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "service_id": 1,
      "certificat": "-----BEGIN CERTIFICATE-----...",
      "cle_privee": "[encrypted]",
      "date_creation": "2024-05-01",
      "date_expiration": "2025-05-01",
      "statut": "actif",
      "service": {
        "id": 1,
        "nom": "API Gateway"
      },
      "created_at": "2024-05-01T12:00:00.000000Z"
    }
  ]
}
```

### Get Certificate Details
```
GET /certificats/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "service_id": 1,
    "certificat": "-----BEGIN CERTIFICATE-----...",
    "cle_privee": "[encrypted]",
    "decrypted_private_key": "-----BEGIN RSA PRIVATE KEY-----...",
    "date_creation": "2024-05-01",
    "date_expiration": "2025-05-01",
    "statut": "actif",
    ...
  }
}
```

### Generate Certificate (Admin Only)
```
POST /certificats
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_id": 1,
  "domain": "api.example.com",
  "days": 365
}

Response:
{
  "success": true,
  "message": "Certificate generated successfully",
  "data": {
    "id": 2,
    "service_id": 1,
    "certificat": "-----BEGIN CERTIFICATE-----...",
    "cle_privee": "[encrypted]",
    "date_creation": "2024-05-02",
    "date_expiration": "2025-05-02",
    "statut": "actif",
    ...
  }
}
```

### Renew Certificate (Admin Only)
```
POST /certificats/{id}/renew
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Certificate renewed successfully",
  "data": {
    "id": 1,
    "service_id": 1,
    "date_expiration": "2026-05-01",
    "statut": "actif",
    ...
  }
}
```

### Revoke Certificate (Admin Only)
```
POST /certificats/{id}/revoke
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": {
    "id": 1,
    "statut": "revoque",
    ...
  }
}
```

### Delete Certificate (Admin Only)
```
DELETE /certificats/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Certificate deleted successfully"
}
```

## Monitoring

### Check Certificate Expiration (Admin Only)
```
GET /check-expiration
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Expiration check completed",
  "data": {
    "total": 10,
    "active": 7,
    "expiring_soon": 2,
    "expired": 1,
    "revoked": 0
  }
}
```

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized",
  "status": 401
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Admin role required.",
  "status": 403
}
```

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Service not found",
  "status": 404
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to generate certificate: [error details]",
  "status": 500
}
```

## Example Requests using curl

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Generate Certificate
```bash
curl -X POST http://localhost:8000/api/certificats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 1,
    "domain": "api.example.com",
    "days": 365
  }'
```

### List Certificates
```bash
curl -X GET "http://localhost:8000/api/certificats?statut=actif" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Renew Certificate
```bash
curl -X POST http://localhost:8000/api/certificats/1/renew \
  -H "Authorization: Bearer YOUR_TOKEN"
```
