<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\CertificatController;
use App\Http\Controllers\API\CheckExpirationController;
use App\Http\Controllers\API\CertificatPrivateKeyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Service routes (admin only for create, update, delete)
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::middleware('admin')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
    });

    // Certificate routes
    Route::get('/certificats', [CertificatController::class, 'index']);
    Route::get('/certificats/{id}', [CertificatController::class, 'show']);
    Route::middleware('admin')->group(function () {
        Route::post('/certificats', [CertificatController::class, 'store']);
        Route::post('/certificats/{id}/renew', [CertificatController::class, 'renew']);
        Route::post('/certificats/{id}/revoke', [CertificatController::class, 'revoke']);
        Route::delete('/certificats/{id}', [CertificatController::class, 'destroy']);
        // Admin-only private key endpoint
        Route::get('/certificats/{certificat}/private-key', [CertificatPrivateKeyController::class, 'show']);
    });

    // Expiration check (admin only)
    Route::middleware('admin')->get('/check-expiration', [CheckExpirationController::class, 'checkAll']);
});
