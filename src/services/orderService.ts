import apiClient from "../api/config";

// Payload for creating an item (request)
export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

// Payload for creating an order (request)
export interface CreateOrderData {
  items: CreateOrderItem[];
  recipientName: string; // New
  shippingAddress: string;
  contactPhone: string; // New
  paymentMethod?: "COD" | "BANK_TRANSFER"; // New, optional with default
  notes?: string; // Changed from note to notes
}

// Item details in a response (includes price)
export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

// Full order object (response)
export interface Order {
  id: number;
  userId: number; // Assuming this is still present in response for order detail
  totalAmount: number; // New in response
  status: string;
  items: OrderItem[];
  recipientName: string; // New
  shippingAddress: string;
  contactPhone: string; // New
  paymentMethod: string; // New
  notes?: string; // Changed from note to notes
  createdAt: string; // Assuming still present
}

// Response for single order creation/detail
export interface OrderResponse {
  success: boolean;
  message?: string;
  data: {
    id: number; // Direct properties of data, not nested under 'order'
    totalAmount: number;
    status: string;
    items: OrderItem[];
    // Other fields that come directly from the order object after creation
    userId: number;
    recipientName: string;
    shippingAddress: string;
    contactPhone: string;
    paymentMethod: string;
    notes?: string;
    createdAt: string;
  };
}

// Response for listing orders
export interface OrderListResponse {
  success: boolean;
  data: {
    orders: Order[];
  };
  meta?: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const OrderService = {
  createOrder: async (data: CreateOrderData): Promise<OrderResponse> => {
    try {
      const response = await apiClient.post("/api/orders", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getMyOrders: async (page: number = 1, limit: number = 10): Promise<OrderListResponse> => {
    try {
      const response = await apiClient.get("/api/orders/my", {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getOrderDetail: async (orderId: number): Promise<OrderResponse> => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Admin/Supporter APIs
  getAllOrders: async (params?: OrderQueryParams): Promise<OrderListResponse> => {
    try {
      const response = await apiClient.get("/api/orders", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
