import { ShoppingList, ShoppingListItem, User } from "@/types/shopping-list";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "mock";
const MOCK_MODE = BASE_URL === "mock";

const MOCK_USER: User = {
  id: "user-1",
  name: "Demo User",
  email: "demo@example.com",
};

let mockLists: ShoppingList[] = [
  {
    id: "list-1",
    title: "Groceries",
    archived: false,
    createdAt: new Date().toISOString(),
    members: [
      { userId: "user-1", role: "owner", addedAt: new Date().toISOString() },
    ],
    items: [
      {
        id: "item-1",
        listId: "list-1",
        title: "Milk",
        done: false,
        createdAt: new Date().toISOString(),
        createdBy: "user-1",
      },
      {
        id: "item-2",
        listId: "list-1",
        title: "Bread",
        done: true,
        createdAt: new Date().toISOString(),
        createdBy: "user-1",
      },
      {
        id: "item-3",
        listId: "list-1",
        title: "Eggs",
        done: false,
        createdAt: new Date().toISOString(),
        createdBy: "user-1",
      },
    ],
  },
  {
    id: "list-2",
    title: "Hardware Store",
    archived: false,
    createdAt: new Date().toISOString(),
    members: [
      { userId: "user-1", role: "member", addedAt: new Date().toISOString() },
      { userId: "user-2", role: "owner", addedAt: new Date().toISOString() },
    ],
    items: [
      {
        id: "item-4",
        listId: "list-2",
        title: "Screws",
        done: false,
        createdAt: new Date().toISOString(),
        createdBy: "user-2",
      },
    ],
  },
  {
    id: "list-3",
    title: "Holiday Shopping",
    archived: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    members: [
      { userId: "user-1", role: "owner", addedAt: new Date().toISOString() },
    ],
    items: [
      {
        id: "item-5",
        listId: "list-3",
        title: "Gift for Mom",
        done: true,
        createdAt: new Date().toISOString(),
        createdBy: "user-1",
      },
    ],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = {
  async getCurrentUser(): Promise<User> {
    if (MOCK_MODE) {
      await delay(300);
      return MOCK_USER;
    }
    const response = await fetch(`${BASE_URL}/auth/me`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  async getLists(includeArchived: boolean = false): Promise<ShoppingList[]> {
    if (MOCK_MODE) {
      await delay(400);
      return mockLists.filter(
        (list) =>
          (includeArchived || !list.archived) &&
          list.members.some((m) => m.userId === MOCK_USER.id)
      );
    }
    const response = await fetch(
      `${BASE_URL}/lists?includeArchived=${includeArchived}`
    );
    if (!response.ok) throw new Error("Failed to fetch lists");
    return response.json();
  },

  async getList(listId: string): Promise<ShoppingList> {
    if (MOCK_MODE) {
      await delay(300);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      if (!list.members.some((m) => m.userId === MOCK_USER.id)) {
        throw new Error("Access denied");
      }
      return list;
    }
    const response = await fetch(`${BASE_URL}/lists/${listId}`);
    if (!response.ok) throw new Error("Failed to fetch list");
    return response.json();
  },

  async createList(title: string): Promise<ShoppingList> {
    if (MOCK_MODE) {
      await delay(400);
      const newList: ShoppingList = {
        id: `list-${Date.now()}`,
        title,
        archived: false,
        createdAt: new Date().toISOString(),
        members: [
          {
            userId: MOCK_USER.id,
            role: "owner",
            addedAt: new Date().toISOString(),
          },
        ],
        items: [],
      };
      mockLists = [...mockLists, newList];
      return newList;
    }
    const response = await fetch(`${BASE_URL}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error("Failed to create list");
    return response.json();
  },

  async updateList(
    listId: string,
    updates: { title?: string; archived?: boolean }
  ): Promise<ShoppingList> {
    if (MOCK_MODE) {
      await delay(300);
      const listIndex = mockLists.findIndex((l) => l.id === listId);
      if (listIndex === -1) throw new Error("List not found");
      mockLists[listIndex] = { ...mockLists[listIndex], ...updates };
      return mockLists[listIndex];
    }
    const response = await fetch(`${BASE_URL}/lists/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update list");
    return response.json();
  },

  async deleteList(listId: string): Promise<void> {
    if (MOCK_MODE) {
      await delay(300);
      mockLists = mockLists.filter((l) => l.id !== listId);
      return;
    }
    const response = await fetch(`${BASE_URL}/lists/${listId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete list");
  },

  async createItem(listId: string, title: string): Promise<ShoppingListItem> {
    if (MOCK_MODE) {
      await delay(300);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      const newItem: ShoppingListItem = {
        id: `item-${Date.now()}`,
        listId,
        title,
        done: false,
        createdAt: new Date().toISOString(),
        createdBy: MOCK_USER.id,
      };
      list.items.push(newItem);
      return newItem;
    }
    const response = await fetch(`${BASE_URL}/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error("Failed to create item");
    return response.json();
  },

  async updateItem(
    listId: string,
    itemId: string,
    updates: { title?: string; done?: boolean }
  ): Promise<ShoppingListItem> {
    if (MOCK_MODE) {
      await delay(200);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      const itemIndex = list.items.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) throw new Error("Item not found");
      list.items[itemIndex] = { ...list.items[itemIndex], ...updates };
      return list.items[itemIndex];
    }
    const response = await fetch(
      `${BASE_URL}/lists/${listId}/items/${itemId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );
    if (!response.ok) throw new Error("Failed to update item");
    return response.json();
  },

  async deleteItem(listId: string, itemId: string): Promise<void> {
    if (MOCK_MODE) {
      await delay(300);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      list.items = list.items.filter((i) => i.id !== itemId);
      return;
    }
    const response = await fetch(
      `${BASE_URL}/lists/${listId}/items/${itemId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete item");
  },

  async addMember(
    listId: string,
    email: string
  ): Promise<{ userId: string; name: string }> {
    if (MOCK_MODE) {
      await delay(400);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      const newUserId = `user-${Date.now()}`;
      list.members.push({
        userId: newUserId,
        role: "member",
        addedAt: new Date().toISOString(),
      });
      return { userId: newUserId, name: email.split("@")[0] };
    }
    const response = await fetch(`${BASE_URL}/lists/${listId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to add member");
    return response.json();
  },

  async removeMember(listId: string, userId: string): Promise<void> {
    if (MOCK_MODE) {
      await delay(300);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      list.members = list.members.filter((m) => m.userId !== userId);
      return;
    }
    const response = await fetch(
      `${BASE_URL}/lists/${listId}/members/${userId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to remove member");
  },

  async leaveList(listId: string): Promise<void> {
    if (MOCK_MODE) {
      await delay(300);
      const list = mockLists.find((l) => l.id === listId);
      if (!list) throw new Error("List not found");
      list.members = list.members.filter((m) => m.userId !== MOCK_USER.id);
      return;
    }
    const response = await fetch(`${BASE_URL}/lists/${listId}/leave`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to leave list");
  },
};
