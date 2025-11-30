import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
import Colors from "@/constants/colors";

type OwnerGuardProps = {
  isOwner: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export default function OwnerGuard({
  isOwner,
  children,
  fallback,
}: OwnerGuardProps) {
  if (!isOwner) {
    return (
      fallback || (
        <View style={styles.container}>
          <Lock size={48} color={Colors.light.secondaryText} />
          <Text style={styles.title}>Owner Only</Text>
          <Text style={styles.message}>
            Only the list owner can access this section
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    textAlign: "center",
  },
});
