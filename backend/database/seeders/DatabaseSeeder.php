<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use App\Models\Certificat;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Create service user
        User::create([
            'name' => 'Service User',
            'email' => 'service@example.com',
            'password' => Hash::make('service123'),
            'role' => 'service',
        ]);

        // Create sample services
        $service1 = Service::create([
            'nom' => 'API Gateway',
            'description' => 'Main API gateway for microservices',
        ]);

        $service2 = Service::create([
            'nom' => 'Auth Service',
            'description' => 'Authentication and authorization service',
        ]);

        $service3 = Service::create([
            'nom' => 'Payment Service',
            'description' => 'Payment processing service',
        ]);

        // Sample certificate content (self-signed for testing)
        $sampleCert = '-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUK5LJ7K5mZ5lZ5lZ5lZ5lZ5lZ5l8wDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNDA1MDExMjAwMDBaFw0yNTA1
MDExMjAwMDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us8cKjMzEfYyjiWA4/4ggCnqqBZ+RCAZCT
-----END CERTIFICATE-----';

        $sampleKey = '-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAu1SU1LfVLfXCozMxH2Mo4lgOP+IJAp6qgWfkQgGQk7pqq9Us
-----END RSA PRIVATE KEY-----';

        // Create sample certificates
        Certificat::create([
            'service_id' => $service1->id,
            'certificat' => $sampleCert,
            'cle_privee' => Crypt::encryptString($sampleKey),
            'date_creation' => now(),
            'date_expiration' => now()->addYear(),
            'statut' => 'actif',
        ]);

        Certificat::create([
            'service_id' => $service2->id,
            'certificat' => $sampleCert,
            'cle_privee' => Crypt::encryptString($sampleKey),
            'date_creation' => now(),
            'date_expiration' => now()->addMonths(2),
            'statut' => 'actif',
        ]);

        Certificat::create([
            'service_id' => $service3->id,
            'certificat' => $sampleCert,
            'cle_privee' => Crypt::encryptString($sampleKey),
            'date_creation' => now(),
            'date_expiration' => now()->addMonths(-1),
            'statut' => 'expire',
        ]);
    }
}
