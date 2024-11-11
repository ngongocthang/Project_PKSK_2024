import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const { user, setUser } = useContext(AppContext);
  const [userData, setUserData] = useState({
    name: "",
    image: assets.profile_pic,
    email: "",
    phone: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State lưu trữ thông tin ban đầu khi bắt đầu chỉnh sửa
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/profilePatient", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          setErrorMessage("Có lỗi xảy ra: " + errorText);
          return;
        }

        const data = await response.json();
        setUserData({
          name: data.user.name,
          image: data.user.image || assets.profile_pic,
          email: data.user.email,
          phone: data.user.phone,
        });
        setOriginalData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
        });
        setUser({
          ...data.user,
        });
      } catch (error) {
        setErrorMessage("Có lỗi xảy ra: " + error.message);
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/updateProfilePatient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            oldPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage("Có lỗi xảy ra: " + errorText);
        return;
      }

      // Cập nhật lại user trong context
      setUser({
        ...user,
        name: userData.name, // Cập nhật tên mới trong context
      });

      setSuccessMessage("Thông tin đã được cập nhật thành công!");
      setErrorMessage("");
      setIsEdit(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleCancel = () => {
    // Khôi phục lại giá trị ban đầu và thoát khỏi chế độ chỉnh sửa
    setUserData(originalData);
    setOldPassword("");
    setNewPassword("");
    setErrorMessage("");
    setIsEdit(false);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-lg flex flex-col gap-2 text-sm bg-white shadow-lg rounded-lg p-6">
        <p className="text-lg text-center">Chào mừng, {userData.name}!</p>
        <div className="flex items-center justify-center">
          <img className="w-36 rounded" src={userData.image} alt="Profile" />
        </div>

        {isEdit ? (
          <div className="flex justify-center mt-4">
            <input
              className="bg-gray-50 text-3xl font-medium max-w-60 text-center"
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
        ) : (
          <p className="font-medium text-3xl text-neutral-800 mt-4 text-center">
            {userData.name}
          </p>
        )}

        <hr className="bg-zinc-400 h-[1px] border-none" />

        <div>
          <p className="text-neutral-500 underline mt-3">THÔNG TIN CHI TIẾT:</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-52"
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            ) : (
              <p>{userData.email}</p>
            )}

            <p className="font-medium mr-4">Số điện thoại:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-52"
                type="tel"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            ) : (
              <p>{userData.phone}</p>
            )}

            {isEdit && (
              <>
                {newPassword && (
                  <>
                    <p className="font-medium">Mật khẩu cũ:</p>
                    <div className="relative flex items-center">
                      <input
                        className="bg-gray-100 w-[13rem] border"
                        type="text"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Nhập mật khẩu cũ"
                      />
                    </div>
                  </>
                )}

                <p className="font-medium">Mật khẩu mới:</p>
                <div className="relative flex items-center">
                  <input
                    className="bg-gray-100 w-[13rem] border"
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <small className="text-neutral-500 italic">
                  Nhập mật khẩu cũ chỉ khi muốn đổi mật khẩu.
                </small>
              </>
            )}
          </div>

          {isEdit && errorMessage && (
            <p className="text-red-500">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-green-500 font-bold mt-3 p-2 border border-green-500 rounded bg-green-100">
              {successMessage}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          {isEdit ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Lưu
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setOriginalData(userData);
                setIsEdit(true);
                setSuccessMessage("");
              }}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;