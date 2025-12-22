import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  useWindowDimensions,
} from "react-native";

import {
  Plus,
  Archive,
  List as ListIcon,
  Moon,
  Sun,
  Globe,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { useLists, useShoppingLists } from "@/contexts/ShoppingListContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ListCard from "@/components/ListCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ListsOverview from "@/components/Charts/ListsOverview";

export default function ListsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const { createList, deleteList } = useShoppingLists();
  const { data: lists, isLoading, error, refetch } = useLists(showArchived);

  const { colors, theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { width } = useWindowDimensions();

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;

    setIsCreatingList(true);
    try {
      await createList(newListTitle.trim());
      setNewListTitle("");
      setCreateModalVisible(false);
    } catch (err) {
      console.error("Failed to create list:", err);
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(t("lists.deleteAlert.message"))) {
        try {
          await deleteList(listId);
        } catch (err) {
          console.error("Failed to delete list:", err);
          // Simple alert for web if needed, or rely on console
          alert("Failed to delete list");
        }
      }
      return;
    }

    Alert.alert(t("lists.deleteAlert.title"), t("lists.deleteAlert.message"), [
      { text: t("lists.cancel"), style: "cancel" },
      {
        text: t("lists.deleteAlert.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteList(listId);
          } catch (err) {
            Alert.alert(t("detail.error"), "Failed to delete list");
            console.error("Failed to delete list:", err);
          }
        },
      },
    ]);
  };

  const toggleLanguage = () => {
    setLanguage(language === "cs" ? "en" : "cs");
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t("lists.title") }} />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: t("lists.title") }} />
        <ErrorState error={error as Error} onRetry={() => refetch()} />
      </>
    );
  }

  const filteredLists = lists || [];

  // Responsive columns
  const numColumns = width > 900 ? 3 : width > 600 ? 2 : 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t("lists.title"),
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={toggleLanguage}
                style={styles.headerButton}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: colors.tint,
                  }}
                >
                  {language === "cs" ? "EN" : "CS"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleTheme}
                style={styles.headerButton}
              >
                {theme === "light" ? (
                  <Moon size={24} color={colors.text} />
                ) : (
                  <Sun size={24} color={colors.text} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowArchived(!showArchived)}
                style={styles.headerButton}
                testID="toggle-archived-button"
                accessibilityLabel={
                  showArchived ? "Hide archived lists" : "Show archived lists"
                }
                accessibilityRole="button"
              >
                <Archive
                  size={24}
                  color={showArchived ? colors.tint : colors.text}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.content}>
        <ListsOverview lists={lists || []} />

        {filteredLists.length === 0 ? (
          <EmptyState
            icon={ListIcon}
            title={showArchived ? t("lists.noArchived") : t("lists.noLists")}
            message={
              showArchived ? t("lists.emptyArchived") : t("lists.emptyStart")
            }
          />
        ) : (
          <FlatList
            key={numColumns} // Force re-render on column change
            data={filteredLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListCard list={item} onDelete={handleDeleteList} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => refetch()}
              />
            }
            numColumns={numColumns}
            columnWrapperStyle={
              numColumns > 1 ? styles.columnWrapper : undefined
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.8}
        testID="create-list-fab"
        accessibilityLabel={t("lists.create")}
        accessibilityRole="button"
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("lists.create")}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              placeholder={t("lists.listName")}
              placeholderTextColor={colors.secondaryText}
              value={newListTitle}
              onChangeText={setNewListTitle}
              autoFocus
              onSubmitEditing={handleCreateList}
              returnKeyType="done"
              testID="create-list-input"
              accessibilityLabel={t("lists.listName")}
              editable={!isCreatingList}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonCancel,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewListTitle("");
                }}
                disabled={isCreatingList}
                testID="cancel-create-button"
                accessibilityLabel={t("lists.cancel")}
                accessibilityRole="button"
              >
                <Text style={[styles.buttonCancelText, { color: colors.text }]}>
                  {t("lists.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonCreate,
                  { backgroundColor: colors.tint },
                  (!newListTitle.trim() || isCreatingList) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleCreateList}
                disabled={!newListTitle.trim() || isCreatingList}
                testID="confirm-create-button"
                accessibilityLabel={t("lists.create")}
                accessibilityRole="button"
              >
                {isCreatingList ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonCreateText}>
                    {t("lists.create")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 12, // Ensure gap between columns
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginBottom: 20,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonCancel: {
    // bg color set dynamically
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  buttonCreate: {
    // bg color set dynamically
  },
  buttonCreateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
