# Mini Trello - Copilot Instructions

A full-stack Trello clone with Laravel backend and React frontend. Real-time updates via Server-Sent Events.

## Architecture Overview

**Backend**: Laravel 12 REST API with token-based auth (`Bearer` tokens in `Authorization` header)
**Frontend**: React 18 + Vite with Material-UI, axios client, dnd-kit for drag-drop
**Real-time**: Server-Sent Events stream (no WebSockets) — check [EventStreamController.php](../_Backend/app/Http/Controllers/Api/EventStreamController.php) and [eventStream.js](../Mini-Trello/src/api/eventStream.js)
**Auth Storage**: `localStorage` for token persistence (fallback to `sessionStorage`)

## Critical Workflows

### Backend Setup & Running

```bash
cd _Backend
composer install
cp .env.example .env          # Configure DB: mini_trello, adjust DB_HOST/DB_PASSWORD
php artisan key:generate
php artisan migrate
php artisan db:seed            # Optional test data
php artisan serve              # Runs on http://localhost:8000
```

### Frontend Setup & Running

```bash
cd Mini-Trello/Mini-Trello
npm install
npm run dev                     # Runs on http://localhost:5173
npm run build                   # Production build to dist/
npm run lint                    # ESLint checks
```

### Database

MySQL with tables: `users`, `boards`, `columns` (note spelling), `cards`, `attachments`, `board_users`, `card_members`, `comments`, `invitations`, `notifications`, `user_tokens`
Key relationships: Board hasMany Columns → Columns hasMany Cards; Board belongsToMany Users via `board_users` pivot table

## Authentication Pattern

**Custom Token System** (not Sanctum):

- Users have `UserToken` records stored separately from `users`
- `AuthToken` middleware extracts token from `Authorization: Bearer <token>` header
- Token attached to request via `$request->attributes->set('auth_user', $userToken->user)` (access as `$request->auth_user` in controllers)
- Multiple tokens per user allowed (max 5 concurrent logins before oldest deleted)

**Frontend**: Token stored via `localStorage.setItem('token', token)` and auto-injected by axios interceptor in [axios.js](../Mini-Trello/src/api/axios.js). On 401 response, tokens cleared and user redirected to `/login`.

## API Routes Structure

All routes under `/api` prefix (see [routes/api.php](../_Backend/routes/api.php)):

- Public: `/register`, `/login`, `/events/stream` (token in query param or header)
- Protected (require `auth.token` middleware): boards, columns, cards, members, invitations, notifications, attachments, comments

Resource controllers follow Laravel RESTful conventions: `index`, `store`, `show`, `update`, `destroy`. Special actions: `inviteMember`, `removeMember`, `move` (cards), `updateOrder` (columns).

## Real-time Events

**Server → Client**: EventStream broadcasts `NotificationCreated` events as Server-Sent Events
**Client**: Subscribes via `eventStreamService.connect(token)` — establishes persistent `EventSource` connection with exponential backoff reconnect (max 5 attempts, starting 1s delay)
Event types: `notification_created`, `board_deleted`, `member_removed_from_board`

## Frontend State & Context

**AuthContext** (`src/contexts/AuthContext.jsx`): Manages `user` (object with id, email, username, avatar), `login()`, `logout()`, token refresh in useEffect
**Redux** (`src/redux/store.js`): Likely manages global board/card data (check store structure for reducers)
**API Clients**: Separate modules per resource (`authApi.js`, `boardApi.js`, `cardApi.js`, etc.) wrapping axios calls — pattern: `const response = await axiosInstance.post('/route', data)`

## Key Conventions & Patterns

### Backend

- Controllers in `app/Http/Controllers/Api/` extend `Controller`
- Models use custom `$timestamps = false` (manual `created_at`/`updated_at`)
- Relationships use `hasMany()`, `belongsToMany()` with pivot table
- Validation via `$request->validate([...])` inline
- File uploads stored in `storage/app/public/` via `Storage::disk('public')->put()`

### Frontend

- Components in `src/components/`, pages in `src/pages/`, routes in `src/routes/`
- Material-UI for styling; dnd-kit for drag-drop (check imports for `@dnd-kit/core`, `@dnd-kit/sortable`)
- API calls wrapped in separate `src/api/*.js` modules, not inline in components
- Token checked on app mount in `AuthContext` useEffect

## Testing & Utilities

**Backend Tests**: PHPUnit in `tests/Feature/` and `tests/Unit/` (see `phpunit.xml` config)
**Test Helpers**: `test-api.php` and `seed-test-data.php` in root for manual testing

## Card Movement (Optimized)

**Backend** ([CardController::move()](../_Backend/app/Http/Controllers/Api/CardController.php)): Uses `DB::transaction()` for atomic operations:

1. Re-sequence old column cards (shift up)
2. Move card to new column with temp order 999
3. Shift new column cards down from target position
4. Set card to final position

Returns minimal response:

```json
{
  "message": "Card moved successfully",
  "card": {
    "_id": "123",
    "boardId": "456",
    "columnId": "789",
    "orderCard": 2
  }
}
```

**Frontend** ([BoardContent.jsx handleDragEnd](../Mini-Trello/src/pages/Boards/BoardContent/BoardContent.jsx)):

- **Optimistic update**: UI updates immediately in drag handler
- **Response sync**: When server responds with moved card:
  1. Remove card from old column
  2. Re-sequence old column (orderCard 0, 1, 2...)
  3. Insert into new column at target position
  4. Update `cardOrderIds` in target column
- **Error recovery**: Reverts to previous state if API fails
- **Optional real-time**: Listen to Server-Sent Events for concurrent multi-user moves

Result: ✅ Fast UI + ✅ Correct DB state + ✅ Race condition safe

## Common Gotchas

- **Column table spelling**: Named `columns` in migrations, but `Column` model uses `protected $table = 'columns'` — beware model references
- **Board members**: Added via `board_users` pivot table, not direct relationship
- **Card members**: Separate `card_members` table, distinct from board membership
- **Real-time delay**: EventStream polls every 2 seconds (check EventStreamController), not true push — acceptable for this app scale
- **Token revocation**: Logout deletes `UserToken` record, but tokens can be manually created for testing via `create-token.php`
- **CORS**: Configured for `localhost:5173/5174` and `192.168.100.124:5173/5174` in `config/cors.php`
- **Card move response**: Minimal response format (only moved card) — frontend handles state update optimistically

## Files to Understand First

- [\_Backend/routes/api.php](../_Backend/routes/api.php) — all endpoints
- [\_Backend/app/Models/Board.php](../_Backend/app/Models/Board.php) — data structure & relationships
- [\_Backend/app/Http/Middleware/AuthToken.php](../_Backend/app/Http/Middleware/AuthToken.php) — token validation
- [Mini-Trello/src/api/axios.js](../Mini-Trello/src/api/axios.js) — API client setup
- [Mini-Trello/src/contexts/AuthContext.jsx](../Mini-Trello/src/contexts/AuthContext.jsx) — user state
