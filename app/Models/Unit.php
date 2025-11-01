<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subUnits(): HasMany
    {
        return $this->hasMany(SubUnit::class)->orderBy('name');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
