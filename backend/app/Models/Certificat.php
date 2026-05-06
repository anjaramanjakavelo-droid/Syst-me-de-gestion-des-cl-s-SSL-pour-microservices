<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'domain',
        'service_id',
        'certificat',
        'cle_privee',
        'date_creation',
        'date_expiration',
        'statut',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_creation' => 'datetime',
        'date_expiration' => 'datetime',
    ];

    /**
     * Get the service that owns the certificate.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the renewals for the certificate.
     */
    public function renouvellements()
    {
        return $this->hasMany(Renouvellement::class);
    }
}
