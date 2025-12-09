import apiClient from "../api/config";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  discountPercent: string;
  stock: number;
  images: string[];
  category: Category;
  description?: string;
  shortDescription?: string;
  specs?: any;
  isActive?: boolean;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

export interface BestSellerProduct {
  id: number;
  name: string;
  soldCount: number;
  price: string;
  category: Category;
  images?: string[];
}

export interface BestSellersResponse {
  success: boolean;
  message: string;
  data: BestSellerProduct[];
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string | number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "name" | "sold" | "createdAt";
  sortDir?: "ASC" | "DESC";
}

export interface CreateProductData {
  name: string;
  brand: string;
  price: number;
  categoryId: number;
  stock: number;
  images?: string[];
  description?: string;
  shortDescription?: string;
  specs?: any;
  discountPercent?: number;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const ProductService = {
  // Public APIs
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    try {
      const response = await apiClient.get("/api/products", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getBestSellers: async (limit?: number): Promise<BestSellersResponse> => {
    try {
      const params = limit ? { limit } : {};
      const response = await apiClient.get("/api/products/best-sellers", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getProductDetail: async (idOrSlug: string | number): Promise<ProductDetailResponse> => {
    try {
      const response = await apiClient.get(`/api/products/${idOrSlug}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Admin/Supporter APIs
  createProduct: async (data: CreateProductData): Promise<ProductDetailResponse> => {
    try {
      const response = await apiClient.post("/api/products", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateProduct: async (id: number, data: UpdateProductData): Promise<ProductDetailResponse> => {
    try {
      const response = await apiClient.put(`/api/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  deleteProduct: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
