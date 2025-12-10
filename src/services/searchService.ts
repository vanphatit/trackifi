import apiClient from "../api/config";
import type { Product } from "./productService";

export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  inStock?: boolean;
  sortBy?:
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "newest"
    | "rating"
    | "name_asc";
  page?: number;
  limit?: number;
}

export interface AggregationItem {
  key: string;
  doc_count: number;
}

export interface Aggregations {
  brands: AggregationItem[];
  categories: AggregationItem[];
  priceRanges: AggregationItem[];
}

export interface SearchResponse {
  success: boolean;
  data: {
    products: Product[];
    aggregations: Aggregations;
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    total: number;
  };
}

export interface AutocompleteResponse {
  success: boolean;
  data: string[];
}

export interface RelatedProductsResponse {
  success: boolean;
  data: Product[];
}

export interface SearchFilterRange {
  min: number;
  max: number;
  label: string;
}

export interface SearchFiltersResponse {
  success: boolean;
  data: {
    brands: string[];
    categories: { id: number; name: string; slug: string }[];
    priceRanges: SearchFilterRange[];
  };
}

export const SearchService = {
  searchProducts: async (params: SearchParams): Promise<SearchResponse> => {
    try {
      // API docs specify POST with Query Params
      const response = await apiClient.post(
        "/api/search/products",
        {},
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  autocomplete: async (
    q: string,
    limit: number = 5
  ): Promise<AutocompleteResponse> => {
    try {
      const response = await apiClient.get("/api/search/autocomplete", {
        params: { q, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getRelatedProducts: async (
    productId: number,
    limit: number = 6
  ): Promise<RelatedProductsResponse> => {
    try {
      const response = await apiClient.get(`/api/search/related/${productId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getSearchFilters: async (): Promise<SearchFiltersResponse> => {
    try {
      const response = await apiClient.get("/api/search/filters");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
