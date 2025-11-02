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
} from "react-native";

import { Plus, Archive, List as ListIcon } from "lucide-react-native";
import { Stack } from "expo-router";
import Colors from "@/constants/colors";
import { useLists, useShoppingLists } from "@/contexts/ShoppingListContext";
import ListCard from "@/components/ListCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

export default function ListsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const { createList } = useShoppingLists();
  const { data: lists, isLoading, error, refetch } = useLists(showArchived);

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

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Shopping Lists" }} />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: "Shopping Lists" }} />
        <ErrorState error={error as Error} onRetry={() => refetch()} />
      </>
    );
  }

  const filteredLists = lists || [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Shopping Lists",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowArchived(!showArchived)}
              style={styles.headerButton}
              testID="toggle-archived-button"
              accessibilityLabel={showArchived ? "Hide archived lists" : "Show archived lists"}
              accessibilityRole="button"
            >
              <Archive
                size={24}
                color={showArchived ? Colors.light.tint : Colors.light.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        {filteredLists.length === 0 ? (
          <EmptyState
            icon={ListIcon}
            title={showArchived ? "No Archived Lists" : "No Lists Yet"}
            message={
              showArchived
                ? "You don't have any archived lists"
                : "Create your first shopping list to get started"
            }
          />
        ) : (
          <FlatList
            data={filteredLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListCard list={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.8}
        testID="create-list-fab"
        accessibilityLabel="Create new shopping list"
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.input}
              placeholder="List name"
              value={newListTitle}
              onChangeText={setNewListTitle}
              autoFocus
              onSubmitEditing={handleCreateList}
              returnKeyType="done"
              testID="create-list-input"
              accessibilityLabel="New list name"
              editable={!isCreatingList}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewListTitle("");
                }}
                disabled={isCreatingList}
                testID="cancel-create-button"
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.buttonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonCreate,
                  (!newListTitle.trim() || isCreatingList) && styles.buttonDisabled,
                ]}
                onPress={handleCreateList}
                disabled={!newListTitle.trim() || isCreatingList}
                testID="confirm-create-button"
                accessibilityLabel="Create list"
                accessibilityRole="button"
              >
                {isCreatingList ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonCreateText}>Create</Text>
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
    backgroundColor: Colors.light.background,
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
    padding: 16,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.tint,
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
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.background,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  buttonCreate: {
    backgroundColor: Colors.light.tint,
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
