// src/Components/HungStorage/SlotGrid.jsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { motion } from "framer-motion";
import {
  getSlotsInfo,
  getSlotDetail,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../../api/bookingApi";

Modal.setAppElement("#root");

export default function SlotGrid({ storageId }) {
  const [slotCount, setSlotCount] = useState(0);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [slotToBook, setSlotToBook] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  // Đầy đủ trường theo entity Booking
  const [formData, setFormData] = useState({
    customerId: "",
    deliveryDate: "",
    note: "",
    transportUnitId: "",
    operatorStaffId: "",
    total: "",
    paymentStatus: "PENDING",
    pickupLocation: "",
    deliveryLocation: "",
  });

  const [errors, setErrors] = useState({});

  const loadSlots = () => {
    getSlotsInfo(storageId)
      .then((res) => {
        setSlotCount(res.data.slotCount);
        setBookedSlots(res.data.bookedSlots);
      })
      .catch(console.error);
  };

  useEffect(loadSlots, [storageId]);

  const openDetail = (slotIndex) => {
    getSlotDetail(storageId, slotIndex)
      .then((res) => {
        setCurrentDetail(res.data);
        setDetailModalOpen(true);
      })
      .catch(console.error);
  };

  const openBooking = (slotIndex) => {
    setSlotToBook(slotIndex);
    // Reset form
    setFormData({
      customerId: "",
      deliveryDate: new Date().toISOString().slice(0, 16),
      note: "",
      transportUnitId: "",
      operatorStaffId: "",
      total: "",
      paymentStatus: "PENDING",
      pickupLocation: "",
      deliveryLocation: "",
    });
    setErrors({});
    setBookingModalOpen(true);
  };

  const handleClick = (i) => {
    if (bookedSlots.includes(i)) openDetail(i);
    else {
      setPendingSlot(i);
      setConfirmModalOpen(true);
    }
  };

  const handleDelete = () => {
    deleteBooking(currentDetail.bookingId)
      .then(() => {
        setDetailModalOpen(false);
        loadSlots();
      })
      .catch((err) => alert("Xóa thất bại: " + err.message));
  };

  // Khi ấn "Chỉnh sửa" booking, điền lại form với đủ thông tin
  const handleEdit = () => {
    setFormData({
      customerId: currentDetail.customerId,
      deliveryDate: currentDetail.deliveryDate
        ? currentDetail.deliveryDate.slice(0, 16)
        : "",
      note: currentDetail.note,
      transportUnitId: currentDetail.transportUnitId,
      operatorStaffId: currentDetail.operatorStaffId,
      total: currentDetail.total,
      paymentStatus: currentDetail.paymentStatus,
      pickupLocation: currentDetail.pickupLocation || "",
      deliveryLocation: currentDetail.deliveryLocation || "",
    });
    setSlotToBook(currentDetail.slotIndex);
    setDetailModalOpen(false);
    setBookingModalOpen(true);
  };

  // Validate & submit
  const handleSubmit = (e) => {
    e.preventDefault();
    let errs = {};
    if (!formData.customerId) errs.customerId = "Bắt buộc";
    if (!formData.deliveryDate) errs.deliveryDate = "Bắt buộc";
    if (!formData.transportUnitId) errs.transportUnitId = "Bắt buộc";
    if (!formData.operatorStaffId) errs.operatorStaffId = "Bắt buộc";
    if (!formData.total) errs.total = "Bắt buộc";
    if (!formData.pickupLocation) errs.pickupLocation = "Bắt buộc";
    if (!formData.deliveryLocation) errs.deliveryLocation = "Bắt buộc";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      ...formData,
      status: currentDetail ? formData.paymentStatus : "PENDING",
      storageUnitId: storageId,
      slotIndex: slotToBook,
    };

    const action = currentDetail
      ? updateBooking(currentDetail.bookingId, payload)
      : createBooking(payload);

    action
      .then(() => {
        setBookingModalOpen(false);
        setDetailModalOpen(false);
        loadSlots();
      })
      .catch(() => alert("Lưu thất bại"));
  };

  const cols = Math.ceil(Math.sqrt(slotCount));

  // Xử lý chọn slot nhanh (có thể tuỳ chỉnh cho hợp lý nghiệp vụ)
  const handleConfirmChooseSlot = () => {
    const payload = {
      storageUnitId: storageId,
      slotIndex: pendingSlot,
      // Có thể truyền thêm default customerId hoặc yêu cầu form chi tiết sau
    };

    createBooking(payload)
      .then(() => {
        setConfirmModalOpen(false);
        setPendingSlot(null);
        loadSlots();
      })
      .catch((err) => {
        alert(
          "Không thể chọn slot: " +
            (err.response?.data?.message || err.message)
        );
      });
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Slots ({slotCount})</h3>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}
      >
        {Array.from({ length: slotCount }, (_, i) => (
          <motion.div
            key={i}
            onClick={() => handleClick(i)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 text-center rounded cursor-pointer select-none transition-colors duration-200 ${
              bookedSlots.includes(i)
                ? "bg-yellow-200 hover:bg-yellow-300"
                : "bg-green-200 hover:bg-green-300"
            }`}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onRequestClose={() => setDetailModalOpen(false)}
        className="modal p-6 bg-white rounded shadow-lg"
      >
        {currentDetail && (
          <>
            <h4 className="text-xl mb-4">
              Booking #{currentDetail.bookingId}
            </h4>
            <div className="space-y-2">
              <p>
                <strong>Khách hàng:</strong>{" "}
                {currentDetail.customerFullName}
              </p>
              <p>
                <strong>Slot:</strong> {currentDetail.slotIndex + 1}
              </p>
              <p>
                <strong>Ngày giao:</strong> {currentDetail.deliveryDate}
              </p>
              <p>
                <strong>Ghi chú:</strong> {currentDetail.note}
              </p>
              <p>
                <strong>Tổng tiền:</strong> {currentDetail.total}
              </p>
              <p>
                <strong>Trạng thái:</strong> {currentDetail.paymentStatus}
              </p>
              <p>
                <strong>Nơi lấy hàng:</strong>{" "}
                {currentDetail.pickupLocation}
              </p>
              <p>
                <strong>Nơi giao hàng:</strong>{" "}
                {currentDetail.deliveryLocation}
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded"
                onClick={handleEdit}
              >
                Chỉnh sửa
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDelete}
              >
                Xóa
              </button>
              <button
                className="px-4 py-2 bg-gray-300"
                onClick={() => setDetailModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Booking Modal: Chỉ dùng 1 modal duy nhất này! */}
      <Modal
        isOpen={bookingModalOpen}
        onRequestClose={() => setBookingModalOpen(false)}
        className="modal p-6 bg-white rounded shadow-lg"
      >
        <h4 className="text-xl mb-4">
          {currentDetail
            ? "Cập nhật Booking"
            : `Book slot #${slotToBook + 1}`}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Mã khách hàng</label>
            <input
              type="number"
              value={formData.customerId}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  customerId: e.target.value,
                }))
              }
              className={`w-full border p-2 rounded ${
                errors.customerId ? "border-red-500" : ""
              }`}
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm">
                {errors.customerId}
              </p>
            )}
          </div>
          <div>
            <label className="block">Ngày giao</label>
            <input
              type="datetime-local"
              value={formData.deliveryDate}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  deliveryDate: e.target.value,
                }))
              }
              className="w-full border p-2 rounded"
            />
            {errors.deliveryDate && (
              <p className="text-red-500 text-sm">
                {errors.deliveryDate}
              </p>
            )}
          </div>
          <div>
            <label className="block">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((f) => ({ ...f, note: e.target.value }))
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block">Mã đơn vị vận chuyển</label>
            <input
              type="number"
              value={formData.transportUnitId}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  transportUnitId: e.target.value,
                }))
              }
              className={`w-full border p-2 rounded ${
                errors.transportUnitId ? "border-red-500" : ""
              }`}
            />
            {errors.transportUnitId && (
              <p className="text-red-500 text-sm">
                {errors.transportUnitId}
              </p>
            )}
          </div>
          <div>
            <label className="block">Mã nhân viên vận hành</label>
            <input
              type="number"
              value={formData.operatorStaffId}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  operatorStaffId: e.target.value,
                }))
              }
              className={`w-full border p-2 rounded ${
                errors.operatorStaffId ? "border-red-500" : ""
              }`}
            />
            {errors.operatorStaffId && (
              <p className="text-red-500 text-sm">
                {errors.operatorStaffId}
              </p>
            )}
          </div>
          <div>
            <label className="block">Tổng tiền</label>
            <input
              type="number"
              value={formData.total}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  total: e.target.value,
                }))
              }
              className={`w-full border p-2 rounded ${
                errors.total ? "border-red-500" : ""
              }`}
            />
            {errors.total && (
              <p className="text-red-500 text-sm">
                {errors.total}
              </p>
            )}
          </div>
          <div>
            <label className="block">Trạng thái thanh toán</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  paymentStatus: e.target.value,
                }))
              }
              className="w-full border p-2 rounded"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div>
            <label className="block">Nơi lấy hàng</label>
            <input
              type="text"
              value={formData.pickupLocation}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  pickupLocation: e.target.value,
                }))
              }
              className={`w-full border p-2 rounded ${
                errors.pickupLocation ? "border-red-500" : ""
              }`}
            />
            {errors.pickupLocation && (
              <p className="text-red-500 text-sm">
                {errors.pickupLocation}
              </p>
            )}
          </div>
          <div>
            <label className="block">Nơi giao hàng</label>
            <input
              type="text"
              value={formData.deliveryLocation}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  deliveryLocation: e.target.value,
                }))
              }
              className={`w-full border p-2 rounded ${
                errors.deliveryLocation ? "border-red-500" : ""
              }`}
            />
            {errors.deliveryLocation && (
              <p className="text-red-500 text-sm">
                {errors.deliveryLocation}
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Lưu
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setBookingModalOpen(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm chọn slot nhanh */}
      <Modal
        isOpen={confirmModalOpen}
        onRequestClose={() => setConfirmModalOpen(false)}
        className="modal p-6 bg-white rounded shadow-lg"
      >
        <h4 className="text-xl mb-4">
          Bạn có muốn chọn vị trí này (Slot #
          {pendingSlot !== null ? pendingSlot + 1 : ""})?
        </h4>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleConfirmChooseSlot}
          >
            Lưu
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => setConfirmModalOpen(false)}
          >
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
}
