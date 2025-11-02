import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import Constants from "expo-constants";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const explicit = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (explicit) {
    return explicit;
  }

  // Allow configuring the value via expo extras so we work in EAS + Expo Go.
  const configBaseUrl =
    Constants.expoConfig?.extra?.apiBaseUrl ??
    Constants.manifest?.extra?.apiBaseUrl;
  if (configBaseUrl) {
    return configBaseUrl as string;
  }

  // When developing locally fall back to the host Expo is running on.
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    Constants.manifest?.hostUri ??
    Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    const [host] = debuggerHost.split(":");
    return `http://${host}:3000`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  console.warn(
    "EXPO_PUBLIC_RORK_API_BASE_URL is not set; defaulting trpc baseUrl to http://localhost:3000"
  );
  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
