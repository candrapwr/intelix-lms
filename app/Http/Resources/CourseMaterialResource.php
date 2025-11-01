<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CourseMaterialResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $disk = $this->storage_disk ?? config('filesystems.default');
        $fileUrl = null;

        if ($this->file_path && Storage::disk($disk)->exists($this->file_path)) {
            $fileUrl = Storage::disk($disk)->url($this->file_path);
        }

        return [
            'id' => $this->id,
            'section_id' => $this->course_section_id,
            'title' => $this->title ?: $this->file_name,
            'description' => $this->description,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'file_size' => (int) $this->file_size,
            'sort_order' => $this->sort_order,
            'file_url' => $fileUrl,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
