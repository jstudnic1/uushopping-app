import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ShoppingList } from "@/types/shopping-list";

export const [ShoppingListProvider, useShoppingLists] = createContextHook(() => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: Infinity,
  });

  const createListMutation = useMutation({
    mutationFn: (title: string) => apiClient.createList(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({
      listId,
      updates,
    }: {
      listId: string;
      updates: { title?: string; archived?: boolean };
    }) => apiClient.updateList(listId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["list", variables.listId] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => apiClient.deleteList(listId),
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.removeQueries({ queryKey: ["list", listId] });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) =>
      apiClient.createItem(listId, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list", variables.listId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      listId,
      itemId,
      updates,
    }: {
      listId: string;
      itemId: string;
      updates: { title?: string; done?: boolean };
    }) => apiClient.updateItem(listId, itemId, updates),
    onMutate: async ({ listId, itemId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["list", listId] });
      const previousList = queryClient.getQueryData<ShoppingList>([
        "list",
        listId,
      ]);

      if (previousList) {
        queryClient.setQueryData<ShoppingList>(["list", listId], {
          ...previousList,
          items: previousList.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        });
      }

      return { previousList };
    },
    onError: (_, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          ["list", variables.listId],
          context.previousList
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list", variables.listId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      apiClient.deleteItem(listId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list", variables.listId] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ listId, email }: { listId: string; email: string }) =>
      apiClient.addMember(listId, email),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list", variables.listId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ listId, userId }: { listId: string; userId: string }) =>
      apiClient.removeMember(listId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list", variables.listId] });
    },
  });

  const leaveListMutation = useMutation({
    mutationFn: (listId: string) => apiClient.leaveList(listId),
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
    },
  });

  return {
    user: userQuery.data,
    userLoading: userQuery.isLoading,
    userError: userQuery.error,
    createList: createListMutation.mutateAsync,
    updateList: updateListMutation.mutateAsync,
    deleteList: deleteListMutation.mutateAsync,
    createItem: createItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    addMember: addMemberMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    leaveList: leaveListMutation.mutateAsync,
  };
});

export function useLists(includeArchived: boolean = false) {
  return useQuery({
    queryKey: ["lists", includeArchived],
    queryFn: () => apiClient.getLists(includeArchived),
  });
}

export function useList(listId: string) {
  return useQuery({
    queryKey: ["list", listId],
    queryFn: () => apiClient.getList(listId),
    enabled: !!listId,
  });
}

export function useIsOwner(list: ShoppingList | undefined): boolean {
  const { user } = useShoppingLists();
  if (!list || !user) return false;
  return list.members.some((m) => m.userId === user.id && m.role === "owner");
}
