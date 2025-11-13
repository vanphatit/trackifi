import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import EditProfileModal from "../components/EditProfileModal";

function MyProfile() {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl border border-gray-200">
        {/* Header với background gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 sm:p-6 mb-6 text-center text-white relative">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">My Profile</p>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition duration-200"
            title="Chỉnh sửa thông tin"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>

        {/* Avatar và thông tin */}
        <div className="text-center space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar
              name={`${user.firstName} ${user.lastName}`}
              size="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
            />
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Họ và tên</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
              <p className="text-sm sm:text-lg font-medium text-gray-800 break-words">
                {user.email}
              </p>
            </div>

            {user.phoneNumber && (
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                <p className="text-lg font-medium text-gray-800">
                  {user.phoneNumber}
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-5">
              <p className="text-sm text-gray-600 mb-1">Giới tính</p>
              <p className="text-lg font-medium text-gray-800">
                {user.gender ? "Nam" : "Nữ"}
              </p>
            </div>

            {user.address && (
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                <p className="text-lg font-medium text-gray-800">
                  {user.address}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold text-sm sm:text-base transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            Đăng xuất
          </button>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Được tạo với ❤️ bằng React + Tailwind CSS
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </div>
  );
}

export default MyProfile;
