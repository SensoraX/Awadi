<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyRequest extends Model
{
    protected $table = 'emergency_requests';

    protected $fillable = [
        'sender',
        'mobile',
        'raw_message',
        'location',
        'urgency',
        'needs',
        'summary',
        'status',
        'assigned_to',
        'assisted_at',
    ];

    protected $casts = [
        'needs' => 'array',
        'assisted_at' => 'datetime',
    ];
}