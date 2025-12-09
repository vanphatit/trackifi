import api from "../api/config";

export interface RecentlyViewedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPercent: number;
  images: string[];
  stock: number;
  ratingAverage: number;
  brand: string;
  viewedAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RecentlyViewedResponse {
  success: boolean;
  message: string;
  data: RecentlyViewedProduct[];
  meta?: {
    totalItems: number;
    limit: number;
  };
}

export interface TrackViewResponse {
  success: boolean;
  message: string;
}

export const RecentlyViewedService = {
  /**
   * Track a product view
   */
  trackView: async (productId: number): Promise<TrackViewResponse> => {
    const response = await api.post("/api/recently-viewed", { productId });
    return response.data;
  },

  /**
   * Get recently viewed products
   */
  getRecentlyViewed: async (
    limit: number = 10
  ): Promise<RecentlyViewedResponse> => {
    const response = await api.get("/api/recently-viewed", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Clear recently viewed history
   */
  clearHistory: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete("/api/recently-viewed");
    return response.data;
  },
};
