<?php

namespace App\Observers;

use App\Models\Certificat;
use App\Services\CertificatFilesystemService;

class CertificatObserver
{
    /**
     * Handle the Certificat "created" event.
     */
    public function created(Certificat $certificat): void
    {
        CertificatFilesystemService::writeFilesFor($certificat);
    }

    /**
     * Handle the Certificat "updated" event.
     */
    public function updated(Certificat $certificat): void
    {
        // Only sync if certificate data changed
        if ($certificat->isDirty('certificat', 'cle_privee', 'domain')) {
            CertificatFilesystemService::writeFilesFor($certificat);
        }
    }

    /**
     * Handle the Certificat "deleted" event.
     */
    public function deleted(Certificat $certificat): void
    {
        CertificatFilesystemService::deleteFilesFor($certificat);
    }
}
