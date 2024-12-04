import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization_id, setSpecialization_id] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl, aToken, spec, getAllSpecialists } =
    useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSpecialists();
  }, [getAllSpecialists]);

  const formatPrice = (value) => {
    // Loại bỏ tất cả ký tự không phải là số
    const numberValue = value.replace(/\D/g, "");

    // Định dạng số với dấu chấm
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!docImg) {
      return toast.error("Ảnh không được trống!");
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
      "image/webp",
    ];

    if (!validImageTypes.includes(docImg.type)) {
      return toast.error("Tệp tải lên phải là một ảnh.");
    }

    // Kiểm tra giá
    const numericPrice = price.replace(/\./g, ""); 
    const priceValue = Number(numericPrice); 

    if (isNaN(priceValue) || priceValue < 0) {
      return toast.error(
        "Giá khám phải là một số hợp lệ và không được nhỏ hơn 0!"
      );
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", docImg);
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("specialization_id", specialization_id);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("description", description);
    formData.append("price", priceValue);

    try {
      const { data } = await axios.post(
        `${backendUrl}/doctor/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Thêm bác sĩ thành công!");
        resetForm();
        navigate("/doctor-list");
      } else {
        toast.error("Thêm bác sĩ thất bại!");
      }
    } catch (error) {
      toast.error(error.response?.data.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDocImg(null);
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setPrice("");
    setDescription("");
    setSpecialization_id("");
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="md:text-3xl text-xl font-bold text-[#0091a1]">Thêm bác sĩ</p>
      </div>
      <div className="overflow-x-auto bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-24 h-24 object-cover bg-gray-100 rounded-full border border-gray-300 shadow-md"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Doctor's preview"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          {!docImg && (
            <p className="text-base font-medium">Tải lên ảnh bác sĩ</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-500">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Tên bác sĩ</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Tên"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Số điện thoại bác sĩ</p>
              <input
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                className="border rounded px-3 py-2"
                type="tel"
                placeholder="Số điện thoại"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Chuyên khoa</p>
              <select
                onChange={(e) => setSpecialization_id(e.target.value)}
                value={specialization_id}
                className="border rounded px-3 py-2"
                required
              >
                <option value="" disabled>
                  Chọn chuyên khoa
                </option>
                {spec.map((specialization) => (
                  <option key={specialization._id} value={specialization._id}>
                    {specialization.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Email bác sĩ</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border rounded px-3 py-2"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Mật khẩu</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border rounded px-3 py-2"
                type="password"
                placeholder="Mật khẩu"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Giá khám:</p>
              <input
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                value={price}
                className="border rounded px-3 py-2"
                type="text" // Đổi thành text để có thể nhập dấu chấm
                placeholder="Giá khám"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 text-gray-500">
          <p className="mt-4 mb-2 font-bold">Giới thiệu</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full border rounded px-4 pt-2"
            placeholder="Mô tả về bác sĩ"
            rows={5}
          />
        </div>

        <button
          type="submit"
          className={`bg-primary px-10 py-3 mt-4 text-white rounded-full ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            </div>
          ) : (
            "Thêm bác sĩ"
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
