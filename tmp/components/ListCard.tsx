import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ShoppingList } from "@/types/shopping-list";
import { ShoppingBag, Archive, Users } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { useShoppingLists } from "@/contexts/ShoppingListContext";

type ListCardProps = {
  list: ShoppingList;
};

export default function ListCard({ list }: ListCardProps) {
  const router = useRouter();
  const { user } = useShoppingLists();
  
  const isOwner = list.members.some((m) => m.userId === user?.id && m.role === "owner");
  const itemsCount = list.items.length;
  const doneCount = list.items.filter((i) => i.done).length;
  const pendingCount = itemsCount - doneCount;

  return (
    <TouchableOpacity
      style={[styles.card, list.archived && styles.archivedCard]}
      onPress={() => router.push(`/lists/${list.id}` as never)}
      activeOpacity={0.7}
      testID={`list-card-${list.id}`}
      accessibilityLabel={`${list.title}. ${itemsCount} items, ${doneCount} completed. You are ${isOwner ? 'owner' : 'member'}`}
      accessibilityRole="button"
      accessibilityHint="Tap to open list details"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {list.archived ? (
            <Archive size={24} color={Colors.light.secondaryText} />
          ) : (
            <ShoppingBag size={24} color={Colors.light.tint} />
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {list.title}
          </Text>
          <View style={styles.metadata}>
            <View style={styles.metaItem}>
              <Users size={14} color={Colors.light.secondaryText} />
              <Text style={styles.metaText}>{list.members.length}</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>
              {isOwner ? "Owner" : "Member"}
            </Text>
          </View>
        </View>
      </View>
      
      {itemsCount > 0 && (
        <View style={styles.stats}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(doneCount / itemsCount) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.statsText}>
            {doneCount} of {itemsCount} items done
            {pendingCount > 0 && ` • ${pendingCount} pending`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  archivedCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  metaDivider: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  stats: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.background,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.success,
    borderRadius: 2,
  },
  statsText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
});
