import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";

type ErrorStateProps = {
  error: Error;
  onRetry?: () => void;
};

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AlertCircle size={64} color={Colors.light.danger} strokeWidth={1.5} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
