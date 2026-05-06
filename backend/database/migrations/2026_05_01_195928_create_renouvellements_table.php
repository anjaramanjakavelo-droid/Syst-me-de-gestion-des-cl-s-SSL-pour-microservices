<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('renouvellements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('certificat_id')->constrained()->onDelete('cascade');
        $table->dateTime('date_renouvellement');
        $table->dateTime('ancienne_date_expiration');
        $table->dateTime('nouvelle_date_expiration');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('renouvellements');
    }
};
