export type User = {
  id: string;
  name: string;
  email: string;
};

export type ShoppingListItem = {
  id: string;
  listId: string;
  title: string;
  done: boolean;
  createdAt: string;
  createdBy: string;
};

export type ShoppingListMember = {
  userId: string;
  role: "owner" | "member";
  addedAt: string;
};

export type ShoppingList = {
  id: string;
  title: string;
  archived: boolean;
  createdAt: string;
  members: ShoppingListMember[];
  items: ShoppingListItem[];
};

export type ItemFilter = "all" | "open" | "done";
