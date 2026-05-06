<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RenouvellementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'certificat_id' => $this->certificat_id,
            'certificat' => new CertificatResource($this->whenLoaded('certificat')),
            'date_renouvellement' => $this->date_renouvellement,
            'ancienne_date_expiration' => $this->ancienne_date_expiration,
            'nouvelle_date_expiration' => $this->nouvelle_date_expiration,
            'created_at' => $this->created_at,
        ];
    }
}
