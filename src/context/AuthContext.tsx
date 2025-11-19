import { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import AuthService, { type User } from "../services/authService";
import type { RegisterData } from "../services/authService";
import { UserService } from "../services/userService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: { user: User } }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload.user,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra authentication khi app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (AuthService.isAuthenticated()) {
      const result = await UserService.getProfile();
      if (result.success && result.user) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: result.user },
        });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    if (result.success && result.user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: result.user },
      });
    }
    return { success: result.success, message: result.message };
  };

  const register = async (userData: RegisterData) => {
    const result = await AuthService.register(userData);
    if (result.success && result.user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: result.user },
      });
    }
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    await AuthService.logout();
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (userData: Partial<User>) => {
    const result = await UserService.updateProfile(userData);
    if (result.success && result.user) {
      dispatch({
        type: "UPDATE_USER",
        payload: { user: result.user },
      });
    }
    return {
      success: result.success,
      message: result.message || "Cập nhật thành công",
    };
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
