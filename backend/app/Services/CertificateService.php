<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class CertificateService
{
    private ?string $opensslConf = null;

    public function __construct()
    {
        // Try multiple possible locations for openssl.cnf on Windows/XAMPP
        $possiblePaths = [
            'C:\\xampp\\apache\\conf\\openssl.cnf',
            'C:/xampp/apache/conf/openssl.cnf',
            'C:\\xampp\\apache\\conf\\openssl.conf',
            'C:/xampp/apache/conf/openssl.conf',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $this->opensslConf = str_replace('/', '\\', $path); // Normalize to Windows backslashes
                Log::debug("OpenSSL config found at: {$this->opensslConf}");
                break;
            }
        }

        // If not found, try to get the path from PHP's openssl config
        if ($this->opensslConf === null) {
            $defaultConfig = \openssl_get_cert_locations();
            if (isset($defaultConfig['ini_cafile']) && file_exists($defaultConfig['ini_cafile'])) {
                $this->opensslConf = $defaultConfig['ini_cafile'];
            } elseif (isset($defaultConfig['ini_capath']) && file_exists($defaultConfig['ini_capath'] . DIRECTORY_SEPARATOR . 'openssl.cnf')) {
                $this->opensslConf = $defaultConfig['ini_capath'] . DIRECTORY_SEPARATOR . 'openssl.cnf';
            }
        }

        // Set environment variable if we found a config
        if ($this->opensslConf !== null) {
            putenv("OPENSSL_CONF={$this->opensslConf}");
            Log::debug("Set OPENSSL_CONF to: {$this->opensslConf}");
        } else {
            Log::warning("Could not find OpenSSL configuration file");
        }
    }

    /**
     * Generate an SSL certificate using OpenSSL CLI (more reliable on Windows).
     */
    public function generateCertificate(string $domain, int $days = 365): array
    {
        try {
            // Define temp directory
            $tempDir = storage_path('certificates_temp');
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Generate unique filenames
            $timestamp = time();
            $keyFile = "{$tempDir}/key_{$timestamp}.pem";
            $csrFile = "{$tempDir}/csr_{$timestamp}.pem";
            $certFile = "{$tempDir}/cert_{$timestamp}.pem";

            // Step 1: Generate private key using OpenSSL CLI
            $keyCommand = $this->getOpenSSLPath() . " genrsa -out " . escapeshellarg($keyFile) . " 2048 2>&1";
            exec($keyCommand, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception("Échec de la génération de la clé privée: " . implode(" ", $output));
            }

            if (!file_exists($keyFile)) {
                throw new \Exception("Fichier de clé privée non créé");
            }

            // Step 2: Create CSR config
            $subj = "/C=FR/ST=State/L=City/O=Organization/CN={$domain}";
            $csrCommand = $this->getOpenSSLPath() . " req -new -key " . escapeshellarg($keyFile) . 
                          " -out " . escapeshellarg($csrFile) . " -subj " . escapeshellarg($subj) . " 2>&1";
            exec($csrCommand, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception("Échec de la génération du CSR: " . implode(" ", $output));
            }

            if (!file_exists($csrFile)) {
                throw new \Exception("Fichier CSR non créé");
            }

            // Step 3: Self-sign the certificate
            $certCommand = $this->getOpenSSLPath() . " x509 -req -days {$days} " .
                           "-in " . escapeshellarg($csrFile) .
                           " -signkey " . escapeshellarg($keyFile) .
                           " -out " . escapeshellarg($certFile) . " 2>&1";
            exec($certCommand, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception("Échec de la signature du certificat: " . implode(" ", $output));
            }

            if (!file_exists($certFile)) {
                throw new \Exception("Fichier certificat non créé");
            }

            // Read the generated files
            $privateKey = file_get_contents($keyFile);
            $certificate = file_get_contents($certFile);

            if (!$privateKey || !$certificate) {
                throw new \Exception("Impossible de lire les fichiers générés");
            }

            // Parse certificate to get dates
            $certData = \openssl_x509_read($certificate);
            if (!$certData) {
                throw new \Exception("Impossible de parser le certificat généré");
            }

            $certInfo = \openssl_x509_parse($certData);
            \openssl_x509_free($certData);

            // Clean up temp files
            @unlink($keyFile);
            @unlink($csrFile);
            @unlink($certFile);

            Log::info("Certificate generated successfully for domain: {$domain}");

            return [
                'certificate' => $certificate,
                'private_key' => $privateKey,
                'valid_from' => date('Y-m-d H:i:s', $certInfo['validFrom_time_t']),
                'valid_to' => date('Y-m-d H:i:s', $certInfo['validTo_time_t']),
            ];

        } catch (\Exception $e) {
            Log::error("Certificate generation error: " . $e->getMessage());
            // Clean up any temp files that might have been created
            if (isset($tempDir)) {
                @array_map('unlink', glob("{$tempDir}/*_{$timestamp}*") ?: []);
            }
            throw $e;
        }
    }

    /**
     * Get the path to the OpenSSL executable
     */
    private function getOpenSSLPath(): string
    {
        // Try common locations on Windows
        $possiblePaths = [
            'C:\\xampp\\apache\\bin\\openssl.exe',
            'C:\\xampp\\php\\openssl.exe',
            'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
            'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe',
            'openssl', // Try system PATH
        ];

        foreach ($possiblePaths as $path) {
            if (@file_exists($path) || trim(shell_exec("where " . escapeshellarg($path) . " 2>&1")) !== '') {
                return $path;
            }
        }

        throw new \Exception("OpenSSL executable not found on the system");
    }

    /**
     * Extract domain from an existing certificate.
     */
    public function extractDomainFromCertificate(string $certificateText): string
    {
        $certData = \openssl_x509_read($certificateText);
        if (!$certData) {
            return 'localhost';
        }

        $certInfo = \openssl_x509_parse($certData);
        \openssl_x509_free($certData);

        return $certInfo['subject']['CN'] ?? 'localhost';
    }

    /**
     * Encrypt the private key for storage.
     */
    public function encryptPrivateKey(string $privateKey): string
    {
        return Crypt::encryptString($privateKey);
    }

    /**
     * Decrypt the private key for viewing.
     */
    public function decryptPrivateKey(string $encryptedKey): ?string
    {
        try {
            return Crypt::decryptString($encryptedKey);
        } catch (\Exception $e) {
            Log::error('Échec du déchiffrement de la clé privée: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check and update certificate expiration status.
     */
    public function checkExpiration($certificat): string
    {
        $now = now();
        $expiration = \Carbon\Carbon::parse($certificat->date_expiration);
        $daysUntilExpiration = $now->diffInDays($expiration, false);

        if ($certificat->statut === 'revoque') {
            return 'revoque';
        }

        if ($daysUntilExpiration < 0) {
            $certificat->statut = 'expire';
            $certificat->save();
            return 'expire';
        } elseif ($daysUntilExpiration <= 30) {
            return 'expiring_soon';
        }

        // If status was expired but now valid
        if ($certificat->statut === 'expire' && $daysUntilExpiration > 0) {
            $certificat->statut = 'actif';
            $certificat->save();
            return 'actif';
        }

        return $certificat->statut;
    }
}
