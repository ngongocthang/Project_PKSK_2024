import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, Clock, User } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const MedicalHistory = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Đang chờ xác nhận";
      case "canceled":
        return "Đã huỷ";
      case "completed":
        return "Đã hoàn thành";
      default:
        return "Đã xác nhận";
    }
  };

  const fetchMedicalHistory = async () => {
    const token = user?.token;
    setLoading(true);
    setError(null);

    if (!token) {
      navigate("/account");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/medical-history/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.historyAppointments && Array.isArray(data.historyAppointments)) {
        setMedicalRecords(data.historyAppointments);
      } else {
        throw new Error("Dữ liệu từ server không hợp lệ");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Có lỗi xảy ra khi tải dữ liệu: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="sm:text-4xl text-3xl font-semibold text-center">
            Lịch sử lịch hẹn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center text-sm mb-6">
            Xem lại thông tin các lần khám của bạn
          </p>

          {medicalRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                Chưa có lịch sử lịch hẹn nào.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {medicalRecords.map((record, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <User className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium">
                        Bs. {record.history.doctor_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                      <span>
                        {new Date(record.history.work_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <Clock className="w-5 h-5 text-gray-500 mr-2" />
                      <span>
                        {record.history.work_shift === "morning"
                          ? "Buổi sáng"
                          : "Buổi chiều"}
                      </span>
                    </div>

                    <Badge
                      className={`${getStatusColor(
                        record.history.status
                      )} px-3 py-1 rounded-full text-sm font-medium`}
                    >
                      {getStatusText(record.history.status)}
                    </Badge>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      Ngày xác nhận:{" "}
                      {new Date(record.history.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          timeZone: "Asia/Ho_Chi_Minh",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalHistory;