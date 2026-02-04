<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MemberRemovedFromBoard implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;
    public $userId;
    public $boardTitle;
    public $removedByUsername;

    /**
     * Create a new event instance.
     */
    public function __construct($boardId, $userId, $boardTitle, $removedByUsername)
    {
        $this->boardId = $boardId;
        $this->userId = $userId;
        $this->boardTitle = $boardTitle;
        $this->removedByUsername = $removedByUsername;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        // Private channel for the removed user
        return new PrivateChannel('board.' . $this->boardId . '.user.' . $this->userId);
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'boardId' => (string) $this->boardId,
            'userId' => (string) $this->userId,
            'boardTitle' => $this->boardTitle,
            'removedByUsername' => $this->removedByUsername,
            'message' => "Bạn đã bị xoá khỏi board \"{$this->boardTitle}\" bởi {$this->removedByUsername}"
        ];
    }
}