import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Users as UsersIcon, UserMinus, LogOut, Crown } from "lucide-react-native";
import Colors from "@/constants/colors";
import {
  useList,
  useShoppingLists,
  useIsOwner,
} from "@/contexts/ShoppingListContext";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

export default function MembersScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { addMember, removeMember, leaveList, user } = useShoppingLists();
  const { data: list, isLoading, error, refetch } = useList(listId!);
  const isOwner = useIsOwner(list);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleAddMember = async () => {
    if (!email.trim() || !listId) return;

    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsAddingMember(true);
    try {
      await addMember({ listId, email: email.trim() });
      setEmail("");
      setEmailError("");
      Alert.alert("Success", "Member added successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to add member. Please try again.");
      console.error("Failed to add member:", err);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!listId) return;

    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember({ listId, userId });
            } catch (err) {
              Alert.alert("Error", "Failed to remove member");
              console.error("Failed to remove member:", err);
            }
          },
        },
      ]
    );
  };

  const handleLeaveList = async () => {
    if (!listId) return;

    Alert.alert(
      "Leave List",
      "Are you sure you want to leave this list? You will lose access to all items.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveList(listId);
              router.replace("/lists" as never);
            } catch (err) {
              Alert.alert("Error", "Failed to leave list");
              console.error("Failed to leave list:", err);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Members" }} />
        <LoadingState />
      </>
    );
  }

  if (error || !list) {
    return (
      <>
        <Stack.Screen options={{ title: "Members" }} />
        <ErrorState
          error={error as Error || new Error("List not found")}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Members" }} />

      {isOwner && (
        <View style={styles.addMemberSection}>
          <Text style={styles.sectionTitle}>Add Member</Text>
          <View style={styles.addMemberContainer}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Enter email address"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                onSubmitEditing={handleAddMember}
                returnKeyType="done"
                testID="add-member-input"
                accessibilityLabel="Member email address"
                editable={!isAddingMember}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                (!email.trim() || isAddingMember) && styles.addButtonDisabled,
              ]}
              onPress={handleAddMember}
              disabled={!email.trim() || isAddingMember}
              testID="add-member-button"
              accessibilityLabel="Add member"
              accessibilityRole="button"
            >
              {isAddingMember ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Members ({list.members.length})</Text>
        {list.members.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No Members"
            message="This list has no members"
          />
        ) : (
          <FlatList
            data={list.members}
            keyExtractor={(item) => item.userId}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
            }
            renderItem={({ item }) => {
              const isCurrentUser = item.userId === user?.id;
              const canRemove = isOwner && !isCurrentUser;

              return (
                <View style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberIconContainer}>
                      {item.role === "owner" ? (
                        <Crown size={20} color={Colors.light.warning} />
                      ) : (
                        <UsersIcon size={20} color={Colors.light.tint} />
                      )}
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>
                        User {item.userId}
                        {isCurrentUser && " (You)"}
                      </Text>
                      <Text style={styles.memberRole}>
                        {item.role === "owner" ? "Owner" : "Member"}
                      </Text>
                    </View>
                  </View>
                  {canRemove && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveMember(item.userId)}
                      testID={`remove-member-${item.userId}`}
                      accessibilityLabel={`Remove User ${item.userId}`}
                      accessibilityRole="button"
                    >
                      <UserMinus size={20} color={Colors.light.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {!isOwner && (
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveList}
          testID="leave-list-button"
          accessibilityLabel="Leave this list"
          accessibilityRole="button"
        >
          <LogOut size={20} color={Colors.light.danger} />
          <Text style={styles.leaveButtonText}>Leave List</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  addMemberSection: {
    padding: 16,
    backgroundColor: Colors.light.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  addMemberContainer: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.light.danger,
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
    minHeight: 48,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  membersSection: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingTop: 8,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
      },
    }),
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  memberIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  removeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.danger,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.danger,
  },
});
