import { View, Text, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import Colors from "@/constants/colors";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message: string;
};

export default function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon size={64} color={Colors.light.secondaryText} strokeWidth={1.5} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
  },
});
