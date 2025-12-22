import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ShoppingList } from "@/types/shopping-list";
import { ShoppingBag, Archive, Users, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useShoppingLists } from "@/contexts/ShoppingListContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

type ListCardProps = {
  list: ShoppingList;
  onDelete?: (id: string) => void;
};

export default function ListCard({ list, onDelete }: ListCardProps) {
  const router = useRouter();
  const { user } = useShoppingLists();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();

  const isOwner = list.members.some(
    (m) => m.userId === user?.id && m.role === "owner"
  );
  const itemsCount = list.items.length;
  const doneCount = list.items.filter((i) => i.done).length;
  const pendingCount = itemsCount - doneCount;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(list.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: theme === "light" ? "#000" : "transparent",
          borderColor: colors.border,
        },
        list.archived && styles.archivedCard,
      ]}
      onPress={() => router.push(`/lists/${list.id}` as never)}
      activeOpacity={0.7}
      testID={`list-card-${list.id}`}
      accessibilityLabel={`${list.title}. ${itemsCount} items, ${doneCount} completed.`}
      accessibilityRole="button"
      accessibilityHint="Tap to open list details"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.background },
            ]}
          >
            {list.archived ? (
              <Archive size={24} color={colors.secondaryText} />
            ) : (
              <ShoppingBag size={24} color={colors.tint} />
            )}
          </View>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {list.title}
            </Text>
            <View style={styles.metadata}>
              <View style={styles.metaItem}>
                <Users size={14} color={colors.secondaryText} />
                <Text
                  style={[styles.metaText, { color: colors.secondaryText }]}
                >
                  {list.members.length}
                </Text>
              </View>
              <Text
                style={[styles.metaDivider, { color: colors.secondaryText }]}
              >
                •
              </Text>
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {isOwner ? t("lists.owner") : "Member"}
              </Text>
            </View>
          </View>
        </View>

        {isOwner && onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`delete-list-${list.id}`}
            accessibilityLabel="Delete list"
            accessibilityRole="button"
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {itemsCount > 0 && (
        <View style={styles.stats}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.background }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(doneCount / itemsCount) * 100}%`,
                  backgroundColor: colors.success,
                },
              ]}
            />
          </View>
          <Text style={[styles.statsText, { color: colors.secondaryText }]}>
            {doneCount}/{itemsCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        borderWidth: 1,
        borderStyle: "solid" as const,
      },
    }),
  },
  archivedCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  metaDivider: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  stats: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  statsText: {
    fontSize: 12,
  },
});
