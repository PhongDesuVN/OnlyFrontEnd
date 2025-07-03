// src/Components/HungStorage/SlotGrid.jsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { motion } from "framer-motion";

import {
  getSlotsInfo,
  getSlotDetail,
  createBooking,
  updateBooking,
  deleteBooking
} from "../../api/bookingApi";

Modal.setAppElement("#root");

export default function SlotGrid({ storageId }) {
  const [slotCount, setSlotCount] = useState(0);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [slotToBook, setSlotToBook] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    deliveryDate: "",
    note: "",
    transportUnitId: "",
    operatorStaffId: "",
    total: "",
    paymentStatus: "PENDING",
  });
  const [errors, setErrors] = useState({});

  const loadSlots = () => {
    getSlotsInfo(storageId)
      .then(res => {
        setSlotCount(res.data.slotCount);
        setBookedSlots(res.data.bookedSlots);
      })
      .catch(console.error);
  };

  useEffect(loadSlots, [storageId]);

  const openDetail = (slotIndex) => {
    getSlotDetail(storageId, slotIndex)
      .then(res => {
        setCurrentDetail(res.data);
        setDetailModalOpen(true);
      })
      .catch(console.error);
  };

  const openBooking = (slotIndex) => {
    setSlotToBook(slotIndex);
    setFormData({
      customerId: "",
      deliveryDate: new Date().toISOString().slice(0,16),
      note: "",
      transportUnitId: "",
      operatorStaffId: "",
      total: "",
      paymentStatus: "PENDING",
    });
    setErrors({});
    setBookingModalOpen(true);
  };

  const handleClick = i => {
    if (bookedSlots.includes(i)) openDetail(i);
    else openBooking(i);
  };

 const handleDelete = () => {
   deleteBooking(currentDetail.bookingId)
     .then(() => {
       setDetailModalOpen(false);
       loadSlots();
     })
     .catch(err => alert("Xóa thất bại: " + err.message));
 };

  const handleSubmit = e => {
    e.preventDefault();
    let errs = {};
    if (!formData.customerId) errs.customerId = "Bắt buộc";
    if (!formData.deliveryDate) errs.deliveryDate = "Bắt buộc";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      ...formData,
      status: currentDetail ? formData.paymentStatus : "PENDING",
      storageUnitId: storageId,
      slotIndex: slotToBook
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
                      className={`
                        p-4 text-center rounded cursor-pointer select-none
                        transition-colors duration-200
                        ${bookedSlots.includes(i)
                          ? "bg-yellow-200 hover:bg-yellow-300"
                          : "bg-green-200 hover:bg-green-300"}
                      `}
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
            <h4 className="text-xl mb-4">Booking #{currentDetail.bookingId}</h4>
            <div className="space-y-2">
              <p><strong>Khách hàng:</strong> {currentDetail.customerFullName}</p>
              <p><strong>Slot:</strong> {currentDetail.slotIndex + 1}</p>
              <p><strong>Ngày giao:</strong> {currentDetail.deliveryDate}</p>
              <p><strong>Ghi chú:</strong> {currentDetail.note}</p>
              <p><strong>Tổng tiền:</strong> {currentDetail.total}</p>
              <p><strong>Trạng thái:</strong> {currentDetail.paymentStatus}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded"
                onClick={() => {
                  // khởi formData cho update
                  setFormData({
                    customerId: currentDetail.customerId,
                    deliveryDate: currentDetail.deliveryDate.slice(0,16),
                    note: currentDetail.note,
                    transportUnitId: currentDetail.transportUnitId,
                    operatorStaffId: currentDetail.operatorStaffId,
                    total: currentDetail.total,
                    paymentStatus: currentDetail.paymentStatus,
                  });
                  setSlotToBook(currentDetail.slotIndex);
                  setDetailModalOpen(false);
                  setBookingModalOpen(true);
                }}
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

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onRequestClose={() => setBookingModalOpen(false)}
        className="modal p-6 bg-white rounded shadow-lg"
      >
        <h4 className="text-xl mb-4">
          {currentDetail ? "Cập nhật Booking" : `Book slot #${slotToBook + 1}`}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Mã khách hàng</label>
            <input
              type="number"
              value={formData.customerId}
              onChange={e =>
                setFormData(f => ({ ...f, customerId: e.target.value }))
              }
              className={`w-full border p-2 rounded ${
                errors.customerId ? "border-red-500" : ""
              }`}
            />
            {errors.customerId && (
              <p className="text-red-500 text-sm">{errors.customerId}</p>
            )}
          </div>
          <div>
            <label className="block">Ngày giao</label>
            <input
              type="datetime-local"
              value={formData.deliveryDate}
              onChange={e =>
                setFormData(f => ({ ...f, deliveryDate: e.target.value }))
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={e =>
                setFormData(f => ({ ...f, note: e.target.value }))
              }
              className="w-full border p-2 rounded"
            />
          </div>
          {/* Tương tự thêm các input transportUnitId, operatorStaffId, total, paymentStatus */}
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
    </div>
  );
}
