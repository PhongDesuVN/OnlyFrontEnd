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
  getInitIds,
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
  const [initIds, setInitIds] = useState({
    customerIds: [],
    operatorStaffIds: [],
    transportUnitIds: [],
    storageUnitIds: [],
    pickupLocationIds: [],
    deliveryLocationIds: [],
  });

  // Đầy đủ trường theo entity Booking
  const [formData, setFormData] = useState({
    customerId: "",
    deliveryDate: "",
    note: "",
    transportUnitId: "",
    operatorStaffId: "",
    storageUnitId: storageId,
    total: "",
    paymentStatus: "INCOMPLETED",
    pickupLocation: "",
    deliveryLocation: "",
    slotIndex: null
  });

  const [errors, setErrors] = useState({});

  // State cho modal chỉnh sửa
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const loadSlots = () => {
    getSlotsInfo(storageId)
      .then((res) => {
        setSlotCount(res.data.slotCount);
        setBookedSlots(res.data.bookedSlots);
      })
      .catch(console.error);
  };

  useEffect(loadSlots, [storageId]);
  useEffect(() => {
    getInitIds()
      .then(res => setInitIds({
        ...res.data,
        pickupLocationIds: res.data.pickupLocationIds || [],
        deliveryLocationIds: res.data.deliveryLocationIds || [],
      }))
      .catch(() => setInitIds({ customerIds: [], operatorStaffIds: [], transportUnitIds: [], storageUnitIds: [], pickupLocationIds: [], deliveryLocationIds: [] }));
  }, [bookingModalOpen]);

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
    setFormData({
      customerId: "",
      deliveryDate: new Date().toISOString().slice(0, 16),
      note: "",
      transportUnitId: "",
      operatorStaffId: "",
      storageUnitId: storageId,    // tự set storageId từ prop
      total: "",
      paymentStatus: "INCOMPLETED",
      pickupLocation: "",
      deliveryLocation: "",
      slotIndex: slotIndex,        // tự set slotIndex theo slot được click
    });
    setErrors({});
    setBookingModalOpen(true);
  };


  const handleClick = (i) => {
    if (bookedSlots.includes(i)) openDetail(i);
    else openBooking(i);
  };


  const handleDelete = () => {
    deleteBooking(currentDetail.bookingId)
      .then(() => {
        setDetailModalOpen(false);
        loadSlots();
      })
      .catch((err) => alert("Xóa thất bại: " + err.message));
  };

  // Khi ấn "Chỉnh sửa" booking, điền lại form với đủ thông tin và mở modal chỉnh sửa
  const handleEdit = () => {
    setEditFormData({
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
      storageUnitId: storageId,
      slotIndex: currentDetail.slotIndex,
    });
    setEditModalOpen(true);
    setDetailModalOpen(false);
  };

  // Xử lý submit chỉnh sửa booking
  const handleEditSubmit = (e) => {
    e.preventDefault();
    let errs = {};
    if (!editFormData.customerId) errs.customerId = "Bắt buộc";
    if (!editFormData.deliveryDate) errs.deliveryDate = "Bắt buộc";
    if (!editFormData.transportUnitId) errs.transportUnitId = "Bắt buộc";
    if (!editFormData.operatorStaffId) errs.operatorStaffId = "Bắt buộc";
    if (!editFormData.total) errs.total = "Bắt buộc";
    if (!editFormData.pickupLocation) errs.pickupLocation = "Bắt buộc";
    if (!editFormData.deliveryLocation) errs.deliveryLocation = "Bắt buộc";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const payload = {
      ...editFormData,
      status: editFormData.paymentStatus,
      storageUnitId: editFormData.storageUnitId,
      slotIndex: editFormData.slotIndex,
    };
    updateBooking(currentDetail.bookingId, payload)
      .then(() => {
        setEditModalOpen(false);
        setDetailModalOpen(false);
        loadSlots();
      })
      .catch((err) => {
        console.error('❌ Booking update error:', err);
        alert("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
      });
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
      status: "INCOMPLETED",
      storageUnitId: formData.storageUnitId,
      slotIndex: formData.slotIndex,
    };

    console.log('🚀 Submitting booking:', {
      payload: payload
    });

    // Luôn gọi CREATE
    createBooking(payload)
      .then(() => {
        setBookingModalOpen(false);
        setDetailModalOpen(false);
        loadSlots();
      })
      .catch((err) => {
        console.error('❌ Booking error:', err);
        alert("Lưu thất bại: " + (err.response?.data?.message || err.message));
      });
  };

  const cols = Math.ceil(Math.sqrt(slotCount));

  // Xử lý chọn slot nhanh (có thể tuỳ chỉnh cho hợp lý nghiệp vụ)
  const handleConfirmChooseSlot = () => {
    // Hiện tại chỉ có storageUnitId và slotIndex, cần yêu cầu nhập thêm các trường bắt buộc
    const deliveryLocation = prompt('Nhập nơi giao hàng (bắt buộc):');
    if (!deliveryLocation) {
      alert('Bạn phải nhập nơi giao hàng!');
      return;
    }
    const pickupLocation = prompt('Nhập nơi lấy hàng (bắt buộc):');
    if (!pickupLocation) {
      alert('Bạn phải nhập nơi lấy hàng!');
      return;
    }
    const customerId = prompt('Nhập mã khách hàng (bắt buộc):');
    if (!customerId) {
      alert('Bạn phải nhập mã khách hàng!');
      return;
    }
    const operatorStaffId = prompt('Nhập mã nhân viên vận hành (bắt buộc):');
    if (!operatorStaffId) {
      alert('Bạn phải nhập mã nhân viên vận hành!');
      return;
    }
    const transportUnitId = prompt('Nhập mã đơn vị vận chuyển (bắt buộc):');
    if (!transportUnitId) {
      alert('Bạn phải nhập mã đơn vị vận chuyển!');
      return;
    }
    const total = prompt('Nhập tổng tiền (bắt buộc):');
    if (!total) {
      alert('Bạn phải nhập tổng tiền!');
      return;
    }
    const deliveryDate = prompt('Nhập ngày giao (yyyy-MM-ddTHH:mm, bắt buộc):', new Date().toISOString().slice(0, 16));
    if (!deliveryDate) {
      alert('Bạn phải nhập ngày giao!');
      return;
    }
    const payload = {
      storageUnitId: storageId,
      slotIndex: pendingSlot,
      deliveryLocation,
      pickupLocation,
      customerId,
      operatorStaffId,
      transportUnitId,
      total,
      deliveryDate,
      paymentStatus: 'INCOMPLETED',
      status: 'INCOMPLETED',
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

  const getLocationName = (id, locations) => {
    if (!id) return "";
    const found = locations.find(loc => String(loc.id) === String(id));
    return found ? found.name : id; // fallback: nếu không có name thì hiện id
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
            className={`p-4 text-center rounded cursor-pointer select-none transition-colors duration-200 ${bookedSlots.includes(i)
              ? "bg-yellow-200 hover:bg-yellow-300"
              : "bg-green-200 hover:bg-green-300"
              }`}
          >
            {i}
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
                <strong>Nơi giao hàng:</strong> {getLocationName(currentDetail.deliveryLocation, initIds.deliveryLocationIds)}
              </p>
              <p>
                <strong>Nơi lấy hàng:</strong> {getLocationName(currentDetail.pickupLocation, initIds.pickupLocationIds)}
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
        className="modal bg-white rounded-lg shadow-xl p-4 max-w-md w-full mx-auto mt-24 border border-gray-200 flex flex-col"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
      >
        <h4 className="text-lg font-semibold mb-3 text-center">
          Booking slot #{slotToBook}
        </h4>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto max-h-[60vh] space-y-3 pr-1">
          {/* CustomerId */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã khách hàng</label>
            <select
              value={formData.customerId}
              onChange={e =>
                setFormData(f => ({ ...f, customerId: e.target.value }))
              }
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.customerId ? "border-red-500" : ""
                }`}
            >
              <option value="">Chọn khách hàng</option>
              {initIds.customerIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
            )}
          </div>
          {/* OperatorStaffId */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã nhân viên vận hành</label>
            <select
              value={formData.operatorStaffId}
              onChange={e =>
                setFormData(f => ({ ...f, operatorStaffId: e.target.value }))
              }
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.operatorStaffId ? "border-red-500" : ""
                }`}
            >
              <option value="">Chọn nhân viên vận hành</option>
              {initIds.operatorStaffIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            {errors.operatorStaffId && (
              <p className="text-red-500 text-xs mt-1">{errors.operatorStaffId}</p>
            )}
          </div>
          {/* TransportUnitId */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã đơn vị vận chuyển</label>
            <select
              value={formData.transportUnitId}
              onChange={e =>
                setFormData(f => ({ ...f, transportUnitId: e.target.value }))
              }
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.transportUnitId ? "border-red-500" : ""
                }`}
            >
              <option value="">Chọn đơn vị vận chuyển</option>
              {initIds.transportUnitIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            {errors.transportUnitId && (
              <p className="text-red-500 text-xs mt-1">{errors.transportUnitId}</p>
            )}
          </div>
          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Ngày giao</label>
            <input
              type="datetime-local"
              value={formData.deliveryDate}
              onChange={e =>
                setFormData(f => ({ ...f, deliveryDate: e.target.value }))
              }
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.deliveryDate ? "border-red-500" : ""
                }`}
            />
            {errors.deliveryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
            )}
          </div>
          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={e =>
                setFormData(f => ({ ...f, note: e.target.value }))
              }
              className="w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow"
              rows={2}
            />
          </div>
          {/* Tổng tiền */}
          <div>
            <label className="block text-sm font-medium mb-1">Tổng tiền</label>
            <input
              type="number"
              value={formData.total}
              onChange={e =>
                setFormData(f => ({ ...f, total: e.target.value }))
              }
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.total ? "border-red-500" : ""
                }`}
            />
            {errors.total && (
              <p className="text-red-500 text-xs mt-1">{errors.total}</p>
            )}
          </div>
          {/* Trạng thái thanh toán */}
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái thanh toán</label>
            <select
              value={formData.paymentStatus}
              onChange={e =>
                setFormData(f => ({ ...f, paymentStatus: e.target.value }))
              }
              className="w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow"
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="INCOMPLETED">INCOMPLETED</option>
            </select>
          </div>
          {/* Nơi lấy hàng */}
          <div>
            <label className="block text-sm font-medium mb-1">Nơi lấy hàng</label>
            {initIds.pickupLocationIds && initIds.pickupLocationIds.length > 0 ? (
              <select
                value={formData.pickupLocation}
                onChange={e => setFormData(f => ({ ...f, pickupLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.pickupLocation ? "border-red-500" : ""}`}
              >
                <option value="">Chọn nơi lấy hàng</option>
                {initIds.pickupLocationIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={e => setFormData(f => ({ ...f, pickupLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.pickupLocation ? "border-red-500" : ""}`}
              />
            )}
            {errors.pickupLocation && (
              <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>
            )}
          </div>
          {/* Nơi giao hàng */}
          <div>
            <label className="block text-sm font-medium mb-1">Nơi giao hàng</label>
            {initIds.deliveryLocationIds && initIds.deliveryLocationIds.length > 0 ? (
              <select
                value={formData.deliveryLocation}
                onChange={e => setFormData(f => ({ ...f, deliveryLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.deliveryLocation ? "border-red-500" : ""}`}
              >
                <option value="">Chọn nơi giao hàng</option>
                {initIds.deliveryLocationIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.deliveryLocation}
                onChange={e => setFormData(f => ({ ...f, deliveryLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.deliveryLocation ? "border-red-500" : ""}`}
              />
            )}
            {errors.deliveryLocation && (
              <p className="text-red-500 text-xs mt-1">{errors.deliveryLocation}</p>
            )}
          </div>
          <div className="flex gap-2 mt-2 justify-center sticky bottom-0 bg-white py-2 z-10 border-t border-gray-100">
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition"
            >
              Lưu
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300 focus:ring-2 focus:ring-blue-100 transition"
              onClick={() => setBookingModalOpen(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Booking Modal */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        className="modal bg-white rounded-lg shadow-xl p-4 max-w-md w-full mx-auto mt-24 border border-gray-200 flex flex-col"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
      >
        <h4 className="text-lg font-semibold mb-3 text-center">
          Chỉnh sửa Booking slot #{editFormData?.slotIndex + 1}
        </h4>
        <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col overflow-y-auto max-h-[60vh] space-y-3 pr-1">
          {/* Các trường giống như form booking */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã khách hàng</label>
            <select
              value={editFormData?.customerId || ""}
              onChange={e => setEditFormData(f => ({ ...f, customerId: e.target.value }))}
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.customerId ? "border-red-500" : ""}`}
            >
              <option value="">Chọn khách hàng</option>
              {initIds.customerIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mã nhân viên vận hành</label>
            <select
              value={editFormData?.operatorStaffId || ""}
              onChange={e => setEditFormData(f => ({ ...f, operatorStaffId: e.target.value }))}
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.operatorStaffId ? "border-red-500" : ""}`}
            >
              <option value="">Chọn nhân viên vận hành</option>
              {initIds.operatorStaffIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            {errors.operatorStaffId && (
              <p className="text-red-500 text-xs mt-1">{errors.operatorStaffId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mã đơn vị vận chuyển</label>
            <select
              value={editFormData?.transportUnitId || ""}
              onChange={e => setEditFormData(f => ({ ...f, transportUnitId: e.target.value }))}
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.transportUnitId ? "border-red-500" : ""}`}
            >
              <option value="">Chọn đơn vị vận chuyển</option>
              {initIds.transportUnitIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            {errors.transportUnitId && (
              <p className="text-red-500 text-xs mt-1">{errors.transportUnitId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày giao</label>
            <input
              type="datetime-local"
              value={editFormData?.deliveryDate || ""}
              onChange={e => setEditFormData(f => ({ ...f, deliveryDate: e.target.value }))}
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.deliveryDate ? "border-red-500" : ""}`}
            />
            {errors.deliveryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={editFormData?.note || ""}
              onChange={e => setEditFormData(f => ({ ...f, note: e.target.value }))}
              className="w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tổng tiền</label>
            <input
              type="number"
              value={editFormData?.total || ""}
              onChange={e => setEditFormData(f => ({ ...f, total: e.target.value }))}
              className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.total ? "border-red-500" : ""}`}
            />
            {errors.total && (
              <p className="text-red-500 text-xs mt-1">{errors.total}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái thanh toán</label>
            <select
              value={editFormData?.paymentStatus || "INCOMPLETED"}
              onChange={e => setEditFormData(f => ({ ...f, paymentStatus: e.target.value }))}
              className="w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow"
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="INCOMPLETED">INCOMPLETED</option>
            </select>
          </div>
          {/* Nơi lấy hàng */}
          <div>
            <label className="block text-sm font-medium mb-1">Nơi lấy hàng</label>
            {initIds.pickupLocationIds && initIds.pickupLocationIds.length > 0 ? (
              <select
                value={editFormData?.pickupLocation || ""}
                onChange={e => setEditFormData(f => ({ ...f, pickupLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.pickupLocation ? "border-red-500" : ""}`}
              >
                <option value="">Chọn nơi lấy hàng</option>
                {initIds.pickupLocationIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={editFormData?.pickupLocation || ""}
                onChange={e => setEditFormData(f => ({ ...f, pickupLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.pickupLocation ? "border-red-500" : ""}`}
              />
            )}
            {errors.pickupLocation && (
              <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>
            )}
          </div>
          {/* Nơi giao hàng */}
          <div>
            <label className="block text-sm font-medium mb-1">Nơi giao hàng</label>
            {initIds.deliveryLocationIds && initIds.deliveryLocationIds.length > 0 ? (
              <select
                value={editFormData?.deliveryLocation || ""}
                onChange={e => setEditFormData(f => ({ ...f, deliveryLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.deliveryLocation ? "border-red-500" : ""}`}
              >
                <option value="">Chọn nơi giao hàng</option>
                {initIds.deliveryLocationIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={editFormData?.deliveryLocation || ""}
                onChange={e => setEditFormData(f => ({ ...f, deliveryLocation: e.target.value }))}
                className={`w-full border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow ${errors.deliveryLocation ? "border-red-500" : ""}`}
              />
            )}
            {errors.deliveryLocation && (
              <p className="text-red-500 text-xs mt-1">{errors.deliveryLocation}</p>
            )}
          </div>
          <div className="flex gap-2 mt-2 justify-center sticky bottom-0 bg-white py-2 z-10 border-t border-gray-100">
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition"
            >
              Lưu chỉnh sửa
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300 focus:ring-2 focus:ring-blue-100 transition"
              onClick={() => setEditModalOpen(false)}
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
          {pendingSlot !== null ? pendingSlot : ""})?
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