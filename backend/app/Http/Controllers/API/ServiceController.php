<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index()
    {
        $services = Service::withCount('certificats')->get();

        return response()->json([
            'success' => true,
            'data' => ServiceResource::collection($services),
        ]);
    }

    /**
     * Store a new service.
     */
    public function store(StoreServiceRequest $request)
    {
        $service = Service::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Service créé avec succès',
            'data' => new ServiceResource($service),
        ], 201);
    }

    /**
     * Display a specific service.
     */
    public function show($id)
    {
        $service = Service::with('certificats')->find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service non trouvé',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ServiceResource($service),
        ]);
    }

    /**
     * Update a service.
     */
    public function update(StoreServiceRequest $request, $id)
    {
        $service = Service::find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service non trouvé',
            ], 404);
        }

        $service->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Service modifié avec succès',
            'data' => new ServiceResource($service),
        ]);
    }

    /**
     * Delete a service.
     */
    public function destroy($id)
    {
        $service = Service::find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service non trouvé',
            ], 404);
        }

        // Check if service has certificates
        if ($service->certificats()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer : ce service possède des certificats.',
            ], 422);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service supprimé avec succès',
        ]);
    }
}
