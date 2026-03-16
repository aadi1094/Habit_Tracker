## Backend data models and REST API design

### MongoDB / Mongoose models

#### User

- **Collection**: `users`
- **Fields**:
  - `email: string` – unique, required, trimmed, lowercase
  - `passwordHash: string` – bcrypt-hashed password
  - `createdAt: Date`
  - `updatedAt: Date`

This maps to a Mongoose schema roughly like:

```ts
email: { type: String, required: true, unique: true, lowercase: true, trim: true }
passwordHash: { type: String, required: true }
```

#### Habit

- **Collection**: `habits`
- **Fields**:
  - `userId: ObjectId` – reference to `User._id`, required, indexed
  - `name: string` – habit name, required
  - `description?: string` – optional details
  - `frequency: 'daily' | 'weekly' | 'custom'` – how often the habit is expected
  - `completedDates: string[]` – ISO date strings (e.g. `"2026-03-16"`) when the habit was completed
  - `streak: number` – current streak length
  - `longestStreak: number` – longest streak ever
  - `isArchived: boolean` – soft delete / hide
  - `createdAt: Date`
  - `updatedAt: Date`

Key indexes:

- Index on `userId` to quickly fetch habits for the current user.

---

### REST API endpoints

All endpoints will be prefixed with `/api`.

#### Auth

- `POST /api/auth/register`
  - **Body**: `{ email: string; password: string }`
  - **Response 201**: `{ id: string; email: string }`

- `POST /api/auth/login`
  - **Body**: `{ email: string; password: string }`
  - **Response 200**: `{ token: string; user: { id: string; email: string } }`

- `GET /api/auth/me` (protected)
  - **Headers**: `Authorization: Bearer <JWT>`
  - **Response 200**: `{ id: string; email: string }`

#### Habits (all protected with JWT)

Base path: `/api/habits`

- `GET /api/habits`
  - Returns all non-archived habits for the logged-in user.
  - **Response 200**: `Habit[]`

- `POST /api/habits`
  - **Body**: `{ name: string; description?: string; frequency?: 'daily' | 'weekly' | 'custom' }`
  - **Response 201**: `Habit`

- `PUT /api/habits/:id`
  - Updates a habit the user owns.
  - **Body**: Partial habit fields, e.g. `{ name?: string; description?: string; frequency?: 'daily' | 'weekly' | 'custom'; isArchived?: boolean }`
  - **Response 200**: `Habit`

- `DELETE /api/habits/:id`
  - Deletes (or hard-removes) a habit the user owns.
  - **Response 204**: no content

- `POST /api/habits/:id/complete`
  - Marks the habit as completed for a specific date (defaults to today on server).
  - **Body (optional)**: `{ date?: string }` (ISO date)
  - **Response 200**: updated `Habit` with recalculated `streak` and `longestStreak`.

These shapes will be mirrored on the frontend in a small API client so the React app can call them directly.

