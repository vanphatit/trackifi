import apiClient from "../api/config";
import type { User } from "./authService";

export interface Review {
  id: number;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  meta?: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  message?: string;
  data?: Review;
}

export const ReviewService = {
  getReviews: async (productId: number, page: number = 1, limit: number = 10): Promise<ReviewListResponse> => {
    try {
      const response = await apiClient.get(`/api/products/${productId}/reviews`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  createReview: async (productId: number, data: CreateReviewData): Promise<ReviewResponse> => {
    try {
      const response = await apiClient.post(`/api/products/${productId}/reviews`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  deleteReview: async (reviewId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
