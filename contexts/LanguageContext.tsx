import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define translations
const translations = {
  en: {
    // Lists
    "lists.title": "Shopping Lists",
    "lists.noLists": "No Lists Yet",
    "lists.noArchived": "No Archived Lists",
    "lists.emptyStart": "Create your first shopping list to get started",
    "lists.emptyArchived": "You don't have any archived lists",
    "lists.create": "Create New List",
    "lists.listName": "List name",
    "lists.cancel": "Cancel",
    "lists.deleteAlert.title": "Delete List",
    "lists.deleteAlert.message":
      "Are you sure you want to delete this list? This action cannot be undone.",
    "lists.deleteAlert.confirm": "Delete",
    "lists.itemsCount": "{{count}} items",
    "lists.owner": "Owner",
    // Detail
    "detail.loading": "Loading...",
    "detail.error": "Error",
    "detail.notFound": "List not found",
    "detail.filter.all": "All",
    "detail.filter.open": "Open",
    "detail.filter.done": "Done",
    "detail.empty.all": "No Items Yet",
    "detail.empty.open": "No Pending Items",
    "detail.empty.done": "No Completed Items",
    "detail.emptyStart.all": "Add your first item to get started",
    "detail.emptyStart.open": "All items are done!",
    "detail.emptyStart.done": "Complete some items to see them here",
    "detail.newItem": "Add new item...",
    "detail.settings": "List settings",
    "detail.members": "Manage members",
    // Stats
    "stats.resolved": "Resolved",
    "stats.unresolved": "Unresolved",
    "stats.itemsOverview": "Items Overview",
    // Common
    "common.back": "Back",
  },
  cs: {
    // Lists
    "lists.title": "Nákupní seznamy",
    "lists.noLists": "Žádné seznamy",
    "lists.noArchived": "Žádné archivované seznamy",
    "lists.emptyStart": "Vytvořte svůj první nákupní seznam",
    "lists.emptyArchived": "Nemáte žádné archivované seznamy",
    "lists.create": "Vytvořit nový seznam",
    "lists.listName": "Název seznamu",
    "lists.cancel": "Zrušit",
    "lists.deleteAlert.title": "Smazat seznam",
    "lists.deleteAlert.message":
      "Opravdu chcete smazat tento seznam? Tuto akci nelze vrátit.",
    "lists.deleteAlert.confirm": "Smazat",
    "lists.itemsCount": "{{count}} položek",
    "lists.owner": "Vlastník",
    // Detail
    "detail.loading": "Načítání...",
    "detail.error": "Chyba",
    "detail.notFound": "Seznam nenalezen",
    "detail.filter.all": "Vše",
    "detail.filter.open": "K vyřešení",
    "detail.filter.done": "Hotové",
    "detail.empty.all": "Žádné položky",
    "detail.empty.open": "Žádné nevyřešené položky",
    "detail.empty.done": "Žádné hotové položky",
    "detail.emptyStart.all": "Přidejte první položku",
    "detail.emptyStart.open": "Všechny položky jsou hotové!",
    "detail.emptyStart.done": "Dokončete nějaké položky",
    "detail.newItem": "Přidat novou položku...",
    "detail.settings": "Nastavení seznamu",
    "detail.members": "Spravovat členy",
    // Stats
    "stats.resolved": "Vyřešeno",
    "stats.unresolved": "Nevyřešeno",
    "stats.itemsOverview": "Přehled položek",
    // Common
    "common.back": "Zpět",
  },
};

export type Language = "en" | "cs";
export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("cs"); // Default to Czech as per assignment hint
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("user_language").then((storedLang) => {
      if (storedLang === "en" || storedLang === "cs") {
        setLanguageState(storedLang);
      }
      setIsReady(true);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem("user_language", lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    return text;
  };

  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
