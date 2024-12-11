import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";

const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const AddSpecialty = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { aToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!docImg) {
      return toast.error("Ảnh không được trống!");
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];

    if (!validImageTypes.includes(docImg.type)) {
      return toast.error("Tệp tải lên phải là một ảnh.");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", docImg);
    formData.append("name", name);
    formData.append("description", description);

    try {
      const { data } = await axios.post(
        `${VITE_BACKEND_URI}/specialization/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Thêm chuyên khoa thành công!");
        resetForm();
        navigate("/specialty-list"); 
      } else {
        toast.error("Thêm chuyên khoa thất bại!");
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
    setDescription("");
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-3xl font-bold text-[#0091a1]">Thêm Chuyên Khoa</p>
      </div>
      <div className="overflow-x-auto bg-white p-4 rounded-md shadow-md">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-24 h-24 object-cover bg-gray-100 rounded-full border border-gray-300 shadow-md"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Specialty preview"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          {!docImg && (
            <p className="text-base font-medium">Tải lên ảnh chuyên khoa</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-500">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-bold">Tên Chuyên Khoa</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Tên"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 text-gray-500">
          <p className="mt-4 mb-2 font-bold">Mô Tả</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full border rounded px-4 pt-2"
            placeholder="Mô tả về chuyên khoa"
            rows={5}
          />
        </div>

        <div className="flex justify-center items-center md:justify-start">
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
              "Thêm Chuyên Khoa"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddSpecialty;
