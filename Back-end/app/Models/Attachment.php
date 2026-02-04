<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $table = 'attachments';
    public $timestamps = false;

    protected $fillable = [
        'card_id',
        'fileName',
        'fileType',
        'fileURL'
    ];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
