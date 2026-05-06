<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use App\Services\CertificateService;
use Illuminate\Support\Facades\Log;

class CertificatPrivateKeyController extends Controller
{
    protected CertificateService $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    public function show(Certificat $certificat)
    {
        try {
            $decryptedKey = $this->certificateService->decryptPrivateKey($certificat->cle_privee);

            if (!$decryptedKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Échec du déchiffrement de la clé privée',
                ], 500);
            }

            return response($decryptedKey)
                ->header('Content-Type', 'application/x-pem-file')
                ->header('Content-Disposition', 'attachment; filename="' . $certificat->domain . '.key"');

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de la clé privée : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
            ], 500);
        }
    }
}
