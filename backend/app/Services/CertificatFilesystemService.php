<?php

namespace App\Services;

use App\Models\Certificat;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CertificatFilesystemService
{
    public static function writeFilesFor(Certificat $certificat): void
    {
        $domain = $certificat->domain;
        $disk = Storage::disk('certs');

        try {
            // Create domain directory
            $disk->makeDirectory($domain);

            // Write public certificate (PEM)
            $disk->put("{$domain}/cert.crt", $certificat->certificat);

            // Decrypt and write private key
            $decryptedKey = Crypt::decryptString($certificat->cle_privee);
            $disk->put("{$domain}/cert.key", $decryptedKey);

            // Set secure permissions on key file (Linux only; Windows uses ACLs)
            if (PHP_OS_FAMILY === 'Linux') {
                $keyPath = storage_path("certs/{$domain}/cert.key");
                if (file_exists($keyPath)) {
                    @chmod($keyPath, 0600);
                }
            }

            Log::info("Certificate files written for domain: {$domain}");

            // Reload Nginx to pick up new certificates
            static::reloadNginx();

        } catch (\Exception $e) {
            Log::error("Failed to write certificate files for {$domain}: " . $e->getMessage());
            throw $e;
        }
    }

    public static function deleteFilesFor(Certificat $certificat): void
    {
        $domain = $certificat->domain;
        $disk = Storage::disk('certs');

        if ($disk->exists($domain)) {
            $disk->deleteDirectory($domain);
            Log::info("Certificate files deleted for domain: {$domain}");
        }
    }

    /**
     * Reload Nginx to apply new certificates.
     * On Windows: tries common XAMPP paths. On Linux: uses standard nginx reload.
     */
    protected static function reloadNginx(): void
    {
        if (PHP_OS_FAMILY === 'Windows') {
            $possiblePaths = [
                'C:\\xampp\\nginx\\nginx.exe',
                'C:\\nginx\\nginx.exe',
                'nginx',
            ];
            foreach ($possiblePaths as $nginx) {
                $output = @shell_exec("{$nginx} -s reload 2>&1");
                if ($output !== null) {
                    Log::info("Nginx reload triggered via: {$nginx}");
                    return;
                }
            }
            Log::warning("Nginx executable not found. Please reload manually: nginx -s reload");
        } else {
            @shell_exec('nginx -s reload 2>&1');
            Log::info("Nginx reloaded (Linux)");
        }
    }
}
