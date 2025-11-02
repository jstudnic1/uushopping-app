# Shopping List App - Project Documentation

## Overview

A production-ready React Native shopping list application with multi-user collaboration, permission management, and a clean iOS-inspired design.

## Quick Start

1. Install dependencies with `bun install` (or `npm install`).
2. Optionally create a `.env` file and set `EXPO_PUBLIC_API_URL=mock` to use the bundled mock API.
3. Start the Expo development server with `bunx expo start --tunnel`.
4. Use the Expo CLI prompts to open the app on iOS (`i`), Android (`a`), or a physical device via QR code.

## Features

### ✨ Core Features
- **Multi-List Management**: Create, edit, archive, and delete shopping lists
- **Real-time Item Management**: Add, toggle, and delete items with optimistic updates
- **Member Collaboration**: Invite members to lists with role-based permissions
- **Permission System**: Owner and member roles with appropriate access controls
- **Filter System**: View all items, open items, or completed items
- **Archive System**: Hide completed lists from main view

### 🎨 UI/UX
- Clean, minimal design inspired by iOS Reminders and Things 3
- Responsive card-based layouts with smooth shadows
- Empty, loading, and error states for all screens
- Progress indicators showing completion status
- Bottom sheet modals for create actions

### 🔐 Permission Management
- **List Owner**: Can rename, archive, delete list, and manage all members
- **List Member**: Can manage items and leave the list
- Clear visual indicators for user roles

## Routes

- `/` - Redirects to `/lists`
- `/lists` - Overview of all lists (create new, toggle archived view)
- `/lists/:listId` - List detail page (items with filters, add/delete items)
- `/lists/:listId/members` - Member management (owner: add/remove; member: leave)
- `/lists/:listId/settings` - Owner-only settings (rename, archive, delete)

## Tech Stack

- **React Native** with Expo (v53)
- **TypeScript** for type safety
- **Expo Router** for navigation
- **React Query** (@tanstack/react-query) for server state management
- **createContextHook** (@nkzw/create-context-hook) for local state
- **Lucide React Native** for icons

## Project Structure

```
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Redirect to /lists
│   ├── +not-found.tsx           # 404 page
│   └── lists/
│       ├── _layout.tsx          # Lists stack layout
│       ├── index.tsx            # Lists overview
│       └── [listId]/
│           ├── index.tsx        # List detail
│           ├── members.tsx      # Member management
│           └── settings.tsx     # Owner settings
├── components/                   # Reusable components
│   ├── EmptyState.tsx           # Empty state placeholder
│   ├── ErrorState.tsx           # Error display with retry
│   ├── LoadingState.tsx         # Loading spinner
│   ├── ListCard.tsx             # List preview card
│   ├── ItemRow.tsx              # Shopping item row
│   └── OwnerGuard.tsx           # Permission guard component
├── contexts/                     # State management
│   └── ShoppingListContext.tsx  # Lists & items state
├── lib/                          # Utilities
│   └── api-client.ts            # API client with mock mode
├── types/                        # TypeScript types
│   └── shopping-list.ts         # Domain types
└── constants/                    # App constants
    └── colors.ts                # Color palette
```

## API Client

The app includes a flexible API client (`lib/api-client.ts`) that supports both mock mode and real backend integration.

### Mock Mode (Default)
Set `EXPO_PUBLIC_API_URL=mock` or leave unset to use in-memory mock data. Perfect for development and testing without a backend.

### Backend Mode
Set `EXPO_PUBLIC_API_URL=https://your-api.com` in `.env` file to connect to a real backend.

### Supported Endpoints
```
GET    /auth/me                      # Get current user
GET    /lists?includeArchived=false  # Get user's lists
GET    /lists/:listId                # Get list details
POST   /lists                        # Create list
PATCH  /lists/:listId                # Update list (title, archived)
DELETE /lists/:listId                # Delete list

POST   /lists/:listId/items          # Create item
PATCH  /lists/:listId/items/:itemId  # Update item (title, done)
DELETE /lists/:listId/items/:itemId  # Delete item

POST   /lists/:listId/members        # Add member (email)
DELETE /lists/:listId/members/:userId # Remove member
POST   /lists/:listId/leave          # Leave list
```

## Configuration

Create a `.env` file in the root directory:

```env
# Use mock mode (default)
EXPO_PUBLIC_API_URL=mock

# Or connect to your backend
# EXPO_PUBLIC_API_URL=https://your-api.com
```

## Development

### Key Components

**OwnerGuard**: Protects routes and UI elements requiring owner permissions
```tsx
<OwnerGuard isOwner={isOwner}>
  <SettingsContent />
</OwnerGuard>
```

**EmptyState**: Consistent empty state UI
```tsx
<EmptyState 
  icon={ListIcon}
  title="No Lists Yet"
  message="Create your first shopping list to get started"
/>
```

**React Query Integration**: Automatic refetching and caching
```tsx
const { data, isLoading, error, refetch } = useList(listId);
```

### Best Practices

**TypeScript**
- All components have explicit prop types
- Strict null checking enabled
- No `any` types used

**Performance**
- Optimistic updates for item toggling
- React Query caching
- Memoized context values

**UX**
- Loading states for all async operations
- Error boundaries and error states
- Confirmation dialogs for destructive actions
- Keyboard-friendly forms

## Mock Data

The app starts with sample data:
- 3 lists (2 active, 1 archived)
- User roles (owner and member examples)
- Various item states (done/pending)

## Troubleshooting

**TypeScript Errors**: Run `npx tsc --noEmit` to check types

**Build Errors**: Clear cache with `npx expo start -c`

**Route Navigation**: Ensure all dynamic routes use proper types

**Mock API Not Working**: Check `EXPO_PUBLIC_API_URL` is set to `mock`

## Future Enhancements

- Real-time sync with WebSockets
- Push notifications for list updates
- Item categories/tags
- Shared list templates
- Offline support with sync
- Item images/photos
- Shopping history analytics
- Multiple list sorting options
