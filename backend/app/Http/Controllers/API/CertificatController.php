<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCertificatRequest;
use App\Http\Resources\CertificatResource;
use App\Models\Certificat;
use App\Models\Renouvellement;
use App\Services\CertificateService;
use App\Services\CertificatFilesystemService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CertificatController extends Controller
{
    protected CertificateService $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Display a listing of certificates.
     */
    public function index(Request $request)
    {
        $query = Certificat::with('service');

        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $certificats = $query->orderBy('date_expiration', 'asc')->get();

        foreach ($certificats as $certificat) {
            $this->certificateService->checkExpiration($certificat);
        }

        return response()->json([
            'success' => true,
            'data' => CertificatResource::collection($certificats),
        ]);
    }

    /**
     * Generate and store a new certificate.
     */
    public function store(StoreCertificatRequest $request)
    {
        try {
            $days = $request->input('days', 365);
            $domain = $request->input('domain');
            $certData = $this->certificateService->generateCertificate($domain, $days);

            $encryptedPrivateKey = $this->certificateService->encryptPrivateKey($certData['private_key']);

            $certificat = Certificat::create([
                'domain' => $domain,
                'service_id' => $request->service_id,
                'certificat' => $certData['certificate'],
                'cle_privee' => $encryptedPrivateKey,
                'date_creation' => $certData['valid_from'],
                'date_expiration' => $certData['valid_to'],
                'statut' => 'actif',
            ]);

            $certificat->load('service');

            return response()->json([
                'success' => true,
                'message' => 'Certificat généré avec succès',
                'data' => new CertificatResource($certificat),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Échec de la génération du certificat : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Échec de la génération : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific certificate.
     */
    public function show($id)
    {
        $certificat = Certificat::with('service')->find($id);

        if (! $certificat) {
            return response()->json([
                'success' => false,
                'message' => 'Certificat non trouvé',
            ], 404);
        }

        $this->certificateService->checkExpiration($certificat);

        return response()->json([
            'success' => true,
            'data' => new CertificatResource($certificat),
        ]);
    }

    /**
     * Renew a certificate.
     */
    public function renew($id)
    {
        $certificat = Certificat::find($id);

        if (! $certificat) {
            return response()->json([
                'success' => false,
                'message' => 'Certificat non trouvé',
            ], 404);
        }

        try {
            $oldExpiration = $certificat->date_expiration;
            $domain = $certificat->domain;
            $certData = $this->certificateService->generateCertificate($domain, 365);

            $encryptedPrivateKey = $this->certificateService->encryptPrivateKey($certData['private_key']);

            $certificat->update([
                'certificat' => $certData['certificate'],
                'cle_privee' => $encryptedPrivateKey,
                'date_expiration' => $certData['valid_to'],
                'statut' => 'actif',
            ]);

            Renouvellement::create([
                'certificat_id' => $certificat->id,
                'date_renouvellement' => now(),
                'ancienne_date_expiration' => $oldExpiration,
                'nouvelle_date_expiration' => $certData['valid_to'],
            ]);

            $certificat->load('service');

            return response()->json([
                'success' => true,
                'message' => 'Certificat renouvelé avec succès',
                'data' => new CertificatResource($certificat),
            ]);

        } catch (\Exception $e) {
            Log::error('Échec du renouvellement : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Échec du renouvellement : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke a certificate.
     */
    public function revoke($id)
    {
        $certificat = Certificat::find($id);

        if (! $certificat) {
            return response()->json([
                'success' => false,
                'message' => 'Certificat non trouvé',
            ], 404);
        }

        $certificat->update(['statut' => 'revoque']);

        return response()->json([
            'success' => true,
            'message' => 'Certificat révoqué avec succès',
            'data' => new CertificatResource($certificat),
        ]);
    }

    /**
     * Delete a certificate.
     */
    public function destroy($id)
    {
        $certificat = Certificat::find($id);

        if (! $certificat) {
            return response()->json([
                'success' => false,
                'message' => 'Certificat non trouvé',
            ], 404);
        }

        $certificat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Certificat supprimé avec succès',
        ]);
    }
}
