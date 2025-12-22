import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { FileQuestion } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Not Found" }} />
      <FileQuestion size={64} color={Colors.light.secondaryText} />
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.message}>
        The page you&apos;re looking for doesn&apos;t exist
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/lists" as never)}
      >
        <Text style={styles.buttonText}>Go to Lists</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.light.background,
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
