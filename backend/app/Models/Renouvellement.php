<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Renouvellement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'certificat_id',
        'date_renouvellement',
        'ancienne_date_expiration',
        'nouvelle_date_expiration',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_renouvellement' => 'datetime',
        'ancienne_date_expiration' => 'datetime',
        'nouvelle_date_expiration' => 'datetime',
    ];

    /**
     * Get the certificate for the renewal.
     */
    public function certificat()
    {
        return $this->belongsTo(Certificat::class);
    }
}
