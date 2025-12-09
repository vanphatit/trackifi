import apiClient from "../api/config";
import type { Product } from "./productService";

export interface WishlistItem {
  id: number;
  product: Product;
  createdAt: string;
}

export interface WishlistListResponse {
  success: boolean;
  data: WishlistItem[];
  meta?: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface AddToWishlistResponse {
  success: boolean;
  message?: string;
  data?: WishlistItem;
}

export const WishlistService = {
  getWishlist: async (page: number = 1, limit: number = 10): Promise<WishlistListResponse> => {
    try {
      const response = await apiClient.get("/api/wishlist", {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  addToWishlist: async (productId: number): Promise<AddToWishlistResponse> => {
    try {
      const response = await apiClient.post("/api/wishlist", { productId });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  removeFromWishlist: async (productId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/wishlist/${productId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
