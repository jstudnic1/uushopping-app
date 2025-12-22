import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  Plus,
  Filter,
  Users,
  Settings,
  ShoppingBag,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import {
  useList,
  useShoppingLists,
  useIsOwner,
} from "@/contexts/ShoppingListContext";
import ItemRow from "@/components/ItemRow";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { ItemFilter } from "@/types/shopping-list";

export default function ListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const [filter, setFilter] = useState<ItemFilter>("all");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { createItem, updateItem, deleteItem } = useShoppingLists();
  const { data: list, isLoading, error, refetch } = useList(listId!);
  const isOwner = useIsOwner(list);

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !listId) return;

    setIsAddingItem(true);
    try {
      await createItem({ listId, title: newItemTitle.trim() });
      setNewItemTitle("");
      Keyboard.dismiss();
    } catch (err) {
      console.error("Failed to create item:", err);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleToggleItem = async (itemId: string, currentDone: boolean) => {
    if (!listId) return;

    try {
      await updateItem({
        listId,
        itemId,
        updates: { done: !currentDone },
      });
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!listId) return;

    try {
      await deleteItem({ listId, itemId });
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const cycleFilter = () => {
    const filters: ItemFilter[] = ["all", "open", "done"];
    const currentIndex = filters.indexOf(filter);
    const nextIndex = (currentIndex + 1) % filters.length;
    setFilter(filters[nextIndex]);
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <LoadingState />
      </>
    );
  }

  if (error || !list) {
    return (
      <>
        <Stack.Screen options={{ title: "Error" }} />
        <ErrorState
          error={error as Error || new Error("List not found")}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const filteredItems =
    filter === "all"
      ? list.items
      : filter === "open"
      ? list.items.filter((i) => !i.done)
      : list.items.filter((i) => i.done);

  const filterLabel =
    filter === "all" ? "All" : filter === "open" ? "Open" : "Done";

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: list.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={cycleFilter}
                style={styles.headerButton}
                testID="filter-button"
                accessibilityLabel={`Filter items: ${filterLabel}`}
                accessibilityRole="button"
              >
                <Filter
                  size={24}
                  color={
                    filter !== "all" ? Colors.light.tint : Colors.light.text
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/lists/${listId}/members` as never)
                }
                style={styles.headerButton}
                testID="members-button"
                accessibilityLabel="Manage members"
                accessibilityRole="button"
              >
                <Users size={24} color={Colors.light.text} />
              </TouchableOpacity>
              {isOwner && (
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/lists/${listId}/settings` as never)
                  }
                  style={styles.headerButton}
                  testID="settings-button"
                  accessibilityLabel="List settings"
                  accessibilityRole="button"
                >
                  <Settings size={24} color={Colors.light.text} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      <View style={styles.content}>
        {filter !== "all" && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>Filter: {filterLabel}</Text>
          </View>
        )}

        {filteredItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={
              filter === "done"
                ? "No Completed Items"
                : filter === "open"
                ? "No Pending Items"
                : "No Items Yet"
            }
            message={
              filter === "done"
                ? "Complete some items to see them here"
                : filter === "open"
                ? "All items are done!"
                : "Add your first item to get started"
            }
          />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemRow
                item={item}
                onToggle={() => handleToggleItem(item.id, item.done)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
            }
          />
        )}
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new item..."
          value={newItemTitle}
          onChangeText={setNewItemTitle}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
          testID="add-item-input"
          accessibilityLabel="New item title"
          editable={!isAddingItem}
        />
        <TouchableOpacity
          style={[styles.addButton, (!newItemTitle.trim() || isAddingItem) && styles.addButtonDisabled]}
          onPress={handleAddItem}
          disabled={!newItemTitle.trim() || isAddingItem}
          activeOpacity={0.7}
          testID="add-item-button"
          accessibilityLabel="Add item"
          accessibilityRole="button"
        >
          {isAddingItem ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Plus size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  filterBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    margin: 16,
    marginBottom: 8,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addItemContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: Colors.light.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
});
