<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CourseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_section_id',
        'title',
        'description',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'storage_disk',
        'sort_order',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::deleting(function (self $material): void {
            if (! $material->file_path) {
                return;
            }

            $disk = $material->storage_disk ?: config('filesystems.default', 'public');
            Storage::disk($disk)->delete($material->file_path);
        });
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'course_section_id');
    }
}
