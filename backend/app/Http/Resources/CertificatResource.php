<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $daysUntilExpiration = now()->diffInDays($this->date_expiration, false);

        // Calculate status dynamically based on expiration
        $calculatedStatus = $this->statut;
        if ($this->statut !== 'revoque') {
            if ($daysUntilExpiration < 0) {
                $calculatedStatus = 'expire';
            } elseif ($daysUntilExpiration <= 30) {
                $calculatedStatus = 'expiring_soon';
            } elseif ($this->statut === 'expire') {
                $calculatedStatus = 'actif';
            }
        }

        return [
            'id' => $this->id,
            'domain' => $this->domain,
            'service_id' => $this->service_id,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'certificat' => $this->certificat,
            'date_creation' => $this->date_creation,
            'date_expiration' => $this->date_expiration,
            'statut' => $calculatedStatus,
            'days_until_expiration' => $daysUntilExpiration,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
