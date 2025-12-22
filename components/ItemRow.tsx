import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ShoppingListItem } from "@/types/shopping-list";
import { CheckCircle2, Circle, Trash2 } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

type ItemRowProps = {
  item: ShoppingListItem;
  onToggle: () => void;
  onDelete: () => void;
};

export default function ItemRow({ item, onToggle, onDelete }: ItemRowProps) {
  const { colors, theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: theme === "light" ? "#000" : "transparent",
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.itemContent}
        onPress={onToggle}
        activeOpacity={0.7}
        testID={`item-toggle-${item.id}`}
        accessibilityLabel={`${
          item.done ? "Mark as pending" : "Mark as done"
        }: ${item.title}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.done }}
      >
        <View style={styles.checkbox}>
          {item.done ? (
            <CheckCircle2 size={24} color={colors.success} />
          ) : (
            <Circle size={24} color={colors.border} />
          )}
        </View>
        <Text
          style={[
            styles.title,
            { color: colors.text },
            item.done && {
              color: colors.secondaryText,
              textDecorationLine: "line-through",
            },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        activeOpacity={0.7}
        testID={`item-delete-${item.id}`}
        accessibilityLabel={`Delete ${item.title}`}
        accessibilityRole="button"
      >
        <Trash2 size={20} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
        borderWidth: 1,
        borderStyle: "solid" as const,
      },
    }),
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
