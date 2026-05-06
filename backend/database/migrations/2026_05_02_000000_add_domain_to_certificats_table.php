<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add domain column as nullable
        Schema::table('certificats', function (Blueprint $table) {
            $table->string('domain')->nullable()->after('id');
        });

        // Step 2: Backfill existing records from certificate CN
        $certificats = \DB::table('certificats')->get();
        foreach ($certificats as $cert) {
            $certData = openssl_x509_parse($cert->certificat);
            $domain = $certData['subject']['CN'] ?? null;
            if ($domain) {
                \DB::table('certificats')->where('id', $cert->id)->update(['domain' => $domain]);
            }
        }

        // Step 3: Make domain non-nullable and unique
        Schema::table('certificats', function (Blueprint $table) {
            $table->string('domain')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('certificats', function (Blueprint $table) {
            $table->dropColumn('domain');
        });
    }
};
