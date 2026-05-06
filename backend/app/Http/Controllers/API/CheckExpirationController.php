<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use App\Services\CertificateService;

class CheckExpirationController extends Controller
{
    protected CertificateService $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Check all certificates for expiration.
     */
    public function checkAll()
    {
        $certificats = Certificat::all();
        $expired = 0;
        $expiringSoon = 0;
        $active = 0;
        $revoked = 0;

        foreach ($certificats as $certificat) {
            $status = $this->certificateService->checkExpiration($certificat);

            switch ($status) {
                case 'expire':
                    $expired++;
                    break;
                case 'expiring_soon':
                    $expiringSoon++;
                    break;
                case 'revoque':
                    $revoked++;
                    break;
                default:
                    $active++;
                    break;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Vérification des expirations terminée',
            'data' => [
                'total' => $certificats->count(),
                'active' => $active,
                'expiring_soon' => $expiringSoon,
                'expired' => $expired,
                'revoked' => $revoked,
            ],
        ]);
    }
}
