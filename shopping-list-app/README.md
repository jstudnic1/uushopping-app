# Shopping List App

React Native shopping list manager built with Expo Router and TypeScript. The app supports multiple shared lists, real-time item updates, role-based permissions, and an iOS-inspired UI.

## Requirements

- Node.js 20 or newer (LTS recommended)
- Bun (preferred) or npm/yarn for installing dependencies
- Expo CLI (bundled with the project, no global install required)

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```
2. Create a `.env` file in the project root if you need to override defaults:
   ```env
   EXPO_PUBLIC_API_URL=mock
   ```
   Leaving the variable unset defaults to the in-memory mock API.
3. Launch the Expo development server:
   ```bash
   bunx expo start --tunnel
   # or
   npx expo start --tunnel
   ```
4. From the Expo CLI:
   - Press `i` to open the iOS Simulator (macOS with Xcode)
   - Press `a` to open an Android emulator (Android Studio)
   - Scan the QR code with the Expo Go app to run on a physical device

## Additional Commands

- `bunx expo start --web` – run a browser preview
- `bunx expo start --clear` – clear Metro cache if you see build issues
- `bunx tsc --noEmit` – type-check the project

## Project Structure

The high-level layout matches a typical Expo Router project:

```
app/            # Route files (lists, list detail, members, settings)
components/     # Shared UI components and guards
contexts/       # React context for shopping list state
lib/            # API client abstraction (mock or backend mode)
types/          # Shared TypeScript definitions
constants/      # Theme and configuration constants
```

## Troubleshooting

- **Expo client cannot connect**: ensure your device and computer share the same network or retry with `--tunnel`.
- **Mock API not updating**: confirm `EXPO_PUBLIC_API_URL=mock` (or unset) and restart the dev server.
- **Type errors**: run `bunx tsc --noEmit` to get detailed diagnostics.
