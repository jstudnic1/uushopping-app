import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Edit3, Archive, Trash2, ArchiveRestore } from "lucide-react-native";
import Colors from "@/constants/colors";
import {
  useList,
  useShoppingLists,
  useIsOwner,
} from "@/contexts/ShoppingListContext";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import OwnerGuard from "@/components/OwnerGuard";

export default function SettingsScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [isTogglingArchive, setIsTogglingArchive] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const { updateList, deleteList } = useShoppingLists();
  const { data: list, isLoading, error, refetch } = useList(listId!);
  const isOwner = useIsOwner(list);

  const handleUpdateTitle = async () => {
    if (!newTitle.trim() || !listId) return;

    setIsUpdatingTitle(true);
    try {
      await updateList({ listId, updates: { title: newTitle.trim() } });
      setIsEditingTitle(false);
      setNewTitle("");
      Alert.alert("Success", "List title updated successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to update list title");
      console.error("Failed to update title:", err);
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!listId || !list) return;

    const action = list.archived ? "unarchive" : "archive";
    Alert.alert(
      `${action === "archive" ? "Archive" : "Unarchive"} List`,
      `Are you sure you want to ${action} this list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "archive" ? "Archive" : "Unarchive",
          onPress: async () => {
            setIsTogglingArchive(true);
            try {
              await updateList({
                listId,
                updates: { archived: !list.archived },
              });
              Alert.alert("Success", `List ${action}d successfully`);
              router.back();
            } catch (err) {
              Alert.alert("Error", `Failed to ${action} list`);
              console.error(`Failed to ${action} list:`, err);
            } finally {
              setIsTogglingArchive(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteList = async () => {
    if (!listId) return;

    Alert.alert(
      "Delete List",
      "Are you sure you want to delete this list? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeletingList(true);
            try {
              await deleteList(listId);
              Alert.alert("Success", "List deleted successfully");
              router.replace("/lists" as never);
            } catch (err) {
              Alert.alert("Error", "Failed to delete list");
              console.error("Failed to delete list:", err);
              setIsDeletingList(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Settings" }} />
        <LoadingState />
      </>
    );
  }

  if (error || !list) {
    return (
      <>
        <Stack.Screen options={{ title: "Settings" }} />
        <ErrorState
          error={error as Error || new Error("List not found")}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <OwnerGuard isOwner={isOwner}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Settings" }} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>List Details</Text>
            
            {isEditingTitle ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="List name"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                  onSubmitEditing={handleUpdateTitle}
                  returnKeyType="done"
                  testID="rename-list-input"
                  accessibilityLabel="New list name"
                  editable={!isUpdatingTitle}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonCancel]}
                    onPress={() => {
                      setIsEditingTitle(false);
                      setNewTitle("");
                    }}
                    disabled={isUpdatingTitle}
                    testID="cancel-rename-button"
                    accessibilityLabel="Cancel rename"
                    accessibilityRole="button"
                  >
                    <Text style={styles.buttonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonSave,
                      (!newTitle.trim() || isUpdatingTitle) && styles.buttonDisabled,
                    ]}
                    onPress={handleUpdateTitle}
                    disabled={!newTitle.trim() || isUpdatingTitle}
                    testID="save-rename-button"
                    accessibilityLabel="Save new name"
                    accessibilityRole="button"
                  >
                    {isUpdatingTitle ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonSaveText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.settingCard}
                onPress={() => {
                  setNewTitle(list.title);
                  setIsEditingTitle(true);
                }}
                testID="rename-list-button"
                accessibilityLabel={`Rename list. Current name: ${list.title}`}
                accessibilityRole="button"
              >
                <View style={styles.settingIcon}>
                  <Edit3 size={20} color={Colors.light.tint} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Rename List</Text>
                  <Text style={styles.settingSubtitle}>
                    Current: {list.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity
              style={styles.settingCard}
              onPress={handleToggleArchive}
              disabled={isTogglingArchive}
              testID="archive-list-button"
              accessibilityLabel={list.archived ? "Unarchive this list" : "Archive this list"}
              accessibilityRole="button"
            >
              <View style={styles.settingIcon}>
                {list.archived ? (
                  <ArchiveRestore size={20} color={Colors.light.warning} />
                ) : (
                  <Archive size={20} color={Colors.light.warning} />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  {list.archived ? "Unarchive List" : "Archive List"}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {list.archived
                    ? "Make this list active again"
                    : "Hide this list from the main view"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingCard, styles.dangerCard]}
              onPress={handleDeleteList}
              disabled={isDeletingList}
              testID="delete-list-button"
              accessibilityLabel="Delete this list permanently"
              accessibilityRole="button"
            >
              <View style={[styles.settingIcon, styles.dangerIcon]}>
                <Trash2 size={20} color={Colors.light.danger} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.dangerText]}>
                  Delete List
                </Text>
                <Text style={styles.settingSubtitle}>
                  Permanently delete this list and all items
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Created: {new Date(list.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.infoText}>
              Items: {list.items.length} ({list.items.filter((i) => i.done).length} done)
            </Text>
            <Text style={styles.infoText}>Members: {list.members.length}</Text>
          </View>
        </ScrollView>
      </View>
    </OwnerGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: Colors.light.danger,
  },
  dangerIcon: {
    backgroundColor: `${Colors.light.danger}10`,
  },
  dangerText: {
    color: Colors.light.danger,
  },
  editContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: Colors.light.background,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  buttonSave: {
    backgroundColor: Colors.light.tint,
  },
  buttonSaveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoSection: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
});
