import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import apiClient from "../api/config";
import { useAuth } from "./AuthContext";

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  stock: number;
  slug?: string;
}

export interface CartItem {
  id: number; // Cart Item ID
  quantity: number;
  isSelected: boolean;
  subtotal: number;
  product: CartProduct;
}

export interface Cart {
  id: number;
  total: number;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  toggleSelection: (itemIds: number[], isSelected: boolean) => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// GraphQL Queries and Mutations
const GET_CART_QUERY = `
  query GetCart {
    cart {
      id
      total
      items {
        id
        quantity
        isSelected
        subtotal
        product {
          id
          name
          price
          images
          stock
        }
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      total
      items {
        id
        quantity
        isSelected
        subtotal
        product {
          id
          name
          price
          images
          stock
        }
      }
    }
  }
`;

const UPDATE_ITEM_MUTATION = `
  mutation UpdateItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      id
      total
      items {
        id
        quantity
        subtotal
      }
    }
  }
`;

const REMOVE_ITEM_MUTATION = `
  mutation RemoveItem($itemId: ID!) {
    removeFromCart(itemId: $itemId) {
      id
      items {
        id
      }
    }
  }
`;

const SELECT_ITEMS_MUTATION = `
  mutation SelectItems($itemIds: [ID!]!, $isSelected: Boolean!) {
    selectCartItems(itemIds: $itemIds, isSelected: $isSelected) {
      id
      total
      items {
        id
        isSelected
      }
    }
  }
`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const fetchGraphQL = async (query: string, variables: any = {}) => {
    try {
      const response = await apiClient.post("/graphql", {
        query,
        variables,
      });
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }
      return response.data.data;
    } catch (error) {
      console.error("GraphQL Error:", error);
      throw error;
    }
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchGraphQL(GET_CART_QUERY);
      setCart(data.cart);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
        // Optionally handle guest cart or redirect to login
        // For now, we assume only authenticated users can use the cart
        return; 
    }
    try {
      const data = await fetchGraphQL(ADD_TO_CART_MUTATION, {
        productId: productId.toString(),
        quantity,
      });
      setCart(data.addToCart);
    } catch (error) {
      console.error("Failed to add to cart", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
     try {
      const data = await fetchGraphQL(UPDATE_ITEM_MUTATION, {
        itemId: itemId.toString(),
        quantity,
      });
      // Partial update might be tricky, so we might want to refetch or merge
      // The mutation returns the cart structure, so we can update state.
      // However, the response in docs is partial cart. Let's assumed it returns full structure or we refetch.
      // Actually the docs showing partial return for updateItem. Let's assume it returns enough or we trigger refresh.
      // To be safe, let's refreshCart to ensure consistency or merge if response is full enough.
      // The docs sample: { id, total, items: { id, quantity, subtotal } }
      // This is good for updating totals.
      setCart((prev) => {
          if(!prev) return null;
          // Merge logic could be complex, simplest is to refetch or trust the return if complete.
          // Given the response format, we might need to merge manually or just refetch.
          // Let's try to merge the changed items.
          return {
              ...prev,
              total: data.updateCartItem.total,
              items: prev.items.map(item => {
                  const updatedItem = data.updateCartItem.items.find((i: any) => i.id === item.id.toString()); // GQL IDs are strings usually
                  if (updatedItem) {
                      return { ...item, quantity: updatedItem.quantity, subtotal: updatedItem.subtotal };
                  }
                  return item;
              })
          }
      });
    } catch (error) {
      console.error("Failed to update item", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const data = await fetchGraphQL(REMOVE_ITEM_MUTATION, {
        itemId: itemId.toString(),
      });
      // data.removeFromCart contains { id, items: { id } } (remaining items maybe?)
      // Or maybe it returns the list of remaining items? 
      // The docs say: items { id }
      // Let's manually filter out the removed item from state to be snappy
      setCart((prev) => {
          if(!prev) return null;
          return {
              ...prev,
              items: prev.items.filter(item => item.id !== itemId)
          };
      });
      // Optional: refreshCart() to sync totals
      refreshCart();
    } catch (error) {
      console.error("Failed to remove item", error);
      throw error;
    }
  };

  const toggleSelection = async (itemIds: number[], isSelected: boolean) => {
    try {
      const data = await fetchGraphQL(SELECT_ITEMS_MUTATION, {
        itemIds: itemIds.map(id => id.toString()),
        isSelected,
      });
      
      setCart((prev) => {
          if(!prev) return null;
           return {
              ...prev,
              total: data.selectCartItems.total,
              items: prev.items.map(item => {
                   const updatedItem = data.selectCartItems.items.find((i: any) => i.id === item.id.toString());
                   if(updatedItem) {
                       return { ...item, isSelected: updatedItem.isSelected };
                   }
                   return item;
              })
           }
      });
    } catch (error) {
      console.error("Failed to toggle selection", error);
      throw error;
    }
  };

  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const value = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelection,
    refreshCart,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
