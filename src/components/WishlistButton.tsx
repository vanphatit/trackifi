import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { WishlistService } from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";

interface WishlistButtonProps {
  productId: number;
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

export default function WishlistButton({
  productId,
  variant = "icon",
  size = "md",
  className = "",
  onToggle,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function checkWishlistStatus() {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await WishlistService.getWishlist(1, 100);
        if (response.success) {
          const inWishlist = response.data.some(
            (item) => item.product.id === productId
          );
          setIsInWishlist(inWishlist);
        }
      } catch (error) {
        console.error("Failed to check wishlist status", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkWishlistStatus();
  }, [productId, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích.");
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await WishlistService.removeFromWishlist(productId);
        setIsInWishlist(false);
        onToggle?.(false);
      } else {
        await WishlistService.addToWishlist(productId);
        setIsInWishlist(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      alert("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isChecking) {
    return null;
  }

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`${
          sizeClasses[size]
        } inline-flex items-center justify-center rounded-full transition-all ${
          isInWishlist
            ? "bg-pink-500 text-white hover:bg-pink-600"
            : "bg-white/90 text-gray-600 hover:bg-pink-50 hover:text-pink-500 border border-gray-200"
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
        title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      >
        <Heart
          className={`${iconSizes[size]} ${isInWishlist ? "fill-current" : ""}`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isInWishlist
          ? "bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400"
          : "border-2 border-pink-500 text-pink-500 hover:bg-pink-50 focus:ring-pink-400"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
      {isLoading ? "..." : isInWishlist ? "Đã thích" : "Yêu thích"}
    </button>
  );
}
