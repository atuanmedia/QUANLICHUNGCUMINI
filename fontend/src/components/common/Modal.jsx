import React from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const ReportDetailModal = ({ report, isOpen, onClose, onUpdateStatus }) => {
  if (!report) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết phản ánh">
      <div className="report-modal-content">
        {/* 🧾 Thông tin cơ bản */}
        <div className="report-info">
          <h3 className="report-title">{report.title}</h3>
          <p className="report-meta">
            <strong>Người gửi:</strong> {report.resident?.fullName || "N/A"} <br />
            <strong>Căn hộ:</strong> {report.resident?.apartment?.apartmentCode || "N/A"} <br />
            <strong>Ngày gửi:</strong>{" "}
            {new Date(report.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>

        {/* 💬 Nội dung phản ánh */}
        <div className="report-description">
          <h4>Nội dung phản ánh:</h4>
          <p>{report.description || "(Không có nội dung)"}</p>
        </div>

        {/* 📌 Trạng thái */}
        <div className="report-status">
          <strong>Trạng thái hiện tại: </strong>
          <span
            className={`badge ${
              report.status === "resolved"
                ? "badge-green"
                : report.status === "in_progress"
                ? "badge-blue"
                : report.status === "cancelled"
                ? "badge-red"
                : "badge-yellow"
            }`}
          >
            {report.status === "pending"
              ? "Chờ xử lý"
              : report.status === "in_progress"
              ? "Đang xử lý"
              : report.status === "resolved"
              ? "Đã giải quyết"
              : "Đã hủy"}
          </span>
        </div>

        {/* 📍 Nút hành động */}
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          {report.status !== "resolved" && report.status !== "cancelled" && (
            <>
              <Button
                onClick={() => onUpdateStatus(report._id, "resolved")}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Đánh dấu đã giải quyết
              </Button>
              <Button
                onClick={() => onUpdateStatus(report._id, "cancelled")}
                className="bg-red-600 hover:bg-red-700 flex items-center"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Hủy báo cáo
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailModal;
