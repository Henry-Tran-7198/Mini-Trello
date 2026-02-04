<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoardDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;
    public $boardTitle;
    public $deletedByUsername;
    public $userId;

    /**
     * Create a new event instance.
     */
    public function __construct($boardId, $boardTitle, $deletedByUsername, $userId)
    {
        $this->boardId = $boardId;
        $this->boardTitle = $boardTitle;
        $this->deletedByUsername = $deletedByUsername;
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        // Send to each user individually
        return new PrivateChannel('notifications.user.' . $this->userId);
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'boardId' => (string) $this->boardId,
            'boardTitle' => $this->boardTitle,
            'deletedByUsername' => $this->deletedByUsername
        ];
    }
}