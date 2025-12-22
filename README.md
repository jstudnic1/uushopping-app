
1. Launch the Expo development server:
   ```bash
   bunx expo start --web
   # will start the web
   bunx expo start --tunnel
   # or
   npx expo start --tunnel
   ```
2. From the Expo CLI:
   - Press `i` to open the iOS Simulator (macOS with Xcode)
   - Press `w` to open an web app
   - Scan the QR code with the Expo Go app to run on a physical device


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

