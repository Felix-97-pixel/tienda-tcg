"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import type {
  AdjustmentType,
  TradeInCard,
  TradeInProduct,
  MetaOption,
  StoreCreditUser,
} from "../types/store-credit.types";

interface UseStoreCreditFormOptions {
  preselectedUser: StoreCreditUser | null;
  defaultType: AdjustmentType;
  onSuccess: () => void;
}

/**
 * Custom hook that encapsulates ALL state and logic for the StoreCreditModal.
 *
 * Responsibilities:
 * - User search with debounce
 * - Category/expansion metadata loading
 * - Product search with debounce
 * - Trade-in card management (add, update, remove)
 * - Auto-calculation of total amount
 * - Form submission
 *
 * The component that uses this hook only needs to handle presentation.
 */
export function useStoreCreditForm({
  preselectedUser,
  defaultType,
  onSuccess,
}: UseStoreCreditFormOptions) {
  const { showToast } = useToast();

  // ─── Core Form State ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreCreditUser | null>(preselectedUser);
  const [amount, setAmount] = useState<number | "">(""); 
  const [type, setType] = useState<AdjustmentType>(defaultType);
  const [reference, setReference] = useState("");

  // ─── User Search ────────────────────────────────────────────────────────
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<StoreCreditUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // ─── Product Metadata ───────────────────────────────────────────────────
  const [categories, setCategories] = useState<MetaOption[]>([]);
  const [expansions, setExpansions] = useState<MetaOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");

  // ─── Product Search ─────────────────────────────────────────────────────
  const [cardSearchTerm, setCardSearchTerm] = useState("");
  const [cardSearchResults, setCardSearchResults] = useState<TradeInProduct[]>([]);
  const [searchingCards, setSearchingCards] = useState(false);

  // ─── Trade-in Card List ─────────────────────────────────────────────────
  const [tradeInCards, setTradeInCards] = useState<TradeInCard[]>([]);

  // ─── Card Attribute Metadata ────────────────────────────────────────────
  const [languages, setLanguages] = useState<MetaOption[]>([]);
  const [conditions, setConditions] = useState<MetaOption[]>([]);
  const [finishes, setFinishes] = useState<MetaOption[]>([]);

  // ─── Effects: Load Metadata ─────────────────────────────────────────────

  useEffect(() => {
    const fetchMeta = async (endpoint: string, setter: (data: MetaOption[]) => void) => {
      try {
        const res = await fetch(`${API_URL}/products/meta/${endpoint}`);
        if (res.ok) setter(await res.json());
      } catch {
        // Metadata is non-critical; the form still works without it
      }
    };
    fetchMeta("languages", setLanguages);
    fetchMeta("conditions", setConditions);
    fetchMeta("finishes", setFinishes);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setExpansions([]);
      setSelectedExpansion("");
      return;
    }
    fetch(`${API_URL}/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`)
      .then((r) => r.json())
      .then(setExpansions)
      .catch(() => {});
  }, [selectedCategory]);

  // ─── Effects: User Search (debounced) ───────────────────────────────────

  useEffect(() => {
    if (userSearchTerm.length < 3) {
      setUserSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSearchingUsers(true);
      fetch(`${API_URL}/users/search?query=${encodeURIComponent(userSearchTerm)}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => setUserSearchResults(data || []))
        .finally(() => setSearchingUsers(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [userSearchTerm]);

  // ─── Effects: Product Search (debounced) ────────────────────────────────

  useEffect(() => {
    if (cardSearchTerm.length < 3 && !selectedCategory && !selectedExpansion) {
      setCardSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSearchingCards(true);
      const url = new URL(`${API_URL}/products`);
      url.searchParams.set("search", cardSearchTerm);
      url.searchParams.set("limit", "10");
      url.searchParams.set(
        type === "MANUAL_ADD" ? "adminCatalog" : "inventoryOnly",
        "true"
      );
      if (selectedCategory) url.searchParams.set("category", selectedCategory);
      if (selectedExpansion) url.searchParams.set("expansion", selectedExpansion);

      fetch(url.toString(), { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setCardSearchResults(data.data || []))
        .finally(() => setSearchingCards(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [cardSearchTerm, selectedCategory, selectedExpansion, type]);

  // ─── Effects: Auto-calculate Amount ─────────────────────────────────────

  useEffect(() => {
    if (tradeInCards.length > 0) {
      const total = tradeInCards.reduce(
        (acc, card) => acc + card.quantity * card.price,
        0
      );
      setAmount(total);
    }
  }, [tradeInCards]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const selectUser = useCallback((user: StoreCreditUser) => {
    setSelectedUser(user);
    setUserSearchTerm("");
    setUserSearchResults([]);
  }, []);

  const clearUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const addCard = useCallback(
    (product: TradeInProduct) => {
      const newCard: TradeInCard = {
        product,
        quantity: 1,
        price: 0,
        condition: conditions[0]?.name || "NM",
        language: languages[0]?.name || "EN",
        finish: finishes[0]?.name || "Normal",
      };
      setTradeInCards((prev) => [...prev, newCard]);
      setCardSearchTerm("");
      setCardSearchResults([]);
    },
    [conditions, languages, finishes]
  );

  const updateCard = useCallback(
    <K extends keyof TradeInCard>(index: number, field: K, value: TradeInCard[K]) => {
      setTradeInCards((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const removeCard = useCallback((index: number) => {
    setTradeInCards((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedUser) {
        showToast("Debes seleccionar un usuario", "error");
        return;
      }
      if (!amount || Number(amount) <= 0) {
        showToast("El monto debe ser mayor a 0", "error");
        return;
      }

      setLoading(true);
      const finalAmount = type === "MANUAL_ADD" ? Number(amount) : -Number(amount);

      let finalReference = reference;
      if (tradeInCards.length > 0) {
        const cardsText = tradeInCards
          .map(
            (c) =>
              `${c.quantity}x ${c.product.name} [${c.condition}, ${c.language}, ${c.finish}] ($${c.price})`
          )
          .join(", ");
        finalReference = reference
          ? `${reference} | Productos: ${cardsText}`
          : `${type === "MANUAL_ADD" ? "Trade-in" : "Compra en tienda"}: ${cardsText}`;
      }

      try {
        const res = await fetch(`${API_URL}/store-credit/adjust`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.id,
            amount: finalAmount,
            type:
              tradeInCards.length > 0
                ? type === "MANUAL_ADD"
                  ? "BUYLIST_TRADE"
                  : "STORE_PURCHASE"
                : type,
            reference: finalReference || "Ajuste Manual",
            itemsData: tradeInCards.length > 0 ? tradeInCards : undefined,
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || "Error al ajustar saldo");
        }

        showToast("Saldo ajustado correctamente", "success");
        onSuccess();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [selectedUser, amount, type, reference, tradeInCards, showToast, onSuccess]
  );

  // ─── Return Public API ──────────────────────────────────────────────────

  return {
    // Core
    loading,
    selectedUser,
    amount,
    setAmount,
    type,
    reference,
    setReference,
    preselectedUser,

    // User Search
    userSearchTerm,
    setUserSearchTerm,
    userSearchResults,
    searchingUsers,
    selectUser,
    clearUser,

    // Product Filters
    categories,
    expansions,
    selectedCategory,
    setSelectedCategory,
    selectedExpansion,
    setSelectedExpansion,

    // Product Search
    cardSearchTerm,
    setCardSearchTerm,
    cardSearchResults,
    searchingCards,

    // Trade-in Cards
    tradeInCards,
    addCard,
    updateCard,
    removeCard,

    // Metadata
    conditions,
    languages,
    finishes,

    // Submit
    handleSubmit,
  };
}
