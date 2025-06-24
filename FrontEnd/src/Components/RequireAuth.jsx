import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {
  Eye,
  Edit,
  MessageSquare,
  Ban,
  Trash2
} from "lucide-react"

export default function StaffManagement() {
  const [managerId, setManagerId] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [editStaff, setEditStaff] = useState(null)
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", address: "" })
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [confirmAction, setConfirmAction] = useState({ type: "", staffId: null })

  useEffect(() => {
    const token = Cookies.get("authToken")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log("🔑 Decoded payload:", payload)
        if (payload.managerId) {
          setManagerId(payload.managerId)
        }
      } catch (err) {
        console.error("❌ Token decode failed", err)
      }
    } else {
      console.warn("⚠️ Token not found in cookies")
    }
  }, [])

  useEffect(() => {
    if (managerId) fetchStaffList()
  }, [managerId])

  const fetchStaffList = async (page = 0) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/v1/manager/${managerId}/staff`, {
        params: { page, size: 5 }
      })
      setStaffList(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
      setCurrentPage(res.data.data.pageNumber)
    } catch (err) {
      console.error(err)
      alert("Cannot fetch staff list")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm) return fetchStaffList()
    setLoading(true)
    try {
      const res = await axios.get(`/api/v1/manager/${managerId}/staff/search`, {
        params: { searchTerm, page: 0, size: 5 }
      })
      setStaffList(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
      setCurrentPage(res.data.data.pageNumber)
    } catch (err) {
      console.error(err)
      alert("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async () => {
    try {
      await axios.post(`/api/v1/manager/${managerId}/staff/${selectedStaff.operatorId}/feedback`, {
        message: feedback
      })
      alert("Feedback sent successfully")
      setFeedback("")
      setSelectedStaff(null)
    } catch (err) {
      console.error(err)
      alert("Failed to send feedback")
    }
  }

  const handleBlock = async () => {
    try {
      await axios.patch(`/api/v1/manager/${managerId}/staff/${confirmAction.staffId}/block`)
      alert("Staff blocked")
      fetchStaffList(currentPage)
    } catch (err) {
      console.error(err)
      alert("Failed to block staff")
    } finally {
      setConfirmAction({ type: "", staffId: null })
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/manager/${managerId}/staff/${confirmAction.staffId}`)
      alert("Staff deleted")
      fetchStaffList(currentPage)
    } catch (err) {
      console.error(err)
      alert("Failed to delete staff")
    } finally {
      setConfirmAction({ type: "", staffId: null })
    }
  }

  const handleEdit = async () => {
    try {
      await axios.put(`/api/v1/manager/${managerId}/staff/${editStaff.operatorId}`, editForm)
      alert("Staff updated")
      fetchStaffList(currentPage)
    } catch (err) {
      console.error(err)
      alert("Update failed")
    } finally {
      setEditStaff(null)
    }
  }

  if (!managerId) {
    return <div className="text-center text-gray-500 mt-10">Loading manager info...</div>
  }

  return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <input
              className="border border-gray-300 px-4 py-2 rounded-lg w-full max-w-sm"
              placeholder="Search by name, email, or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >Search</button>
        </div>

        {loading ? (
            <p className="text-center text-gray-500">Loading staff...</p>
        ) : staffList.length === 0 ? (
            <p className="text-center text-gray-500">No staff found.</p>
        ) : (
            <div className="space-y-4">
              {staffList.map((staff) => (
                  <div key={staff.operatorId} className="border p-4 rounded-lg shadow-sm">
                    <div className="font-semibold text-lg">{staff.fullName}</div>
                    <div className="text-sm text-gray-500">{staff.email}</div>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => setSelectedStaff(staff)} className="px-3 py-1 border rounded">Feedback</button>
                      <button onClick={() => {
                        setEditStaff(staff)
                        setEditForm({
                          fullName: staff.fullName || "",
                          phone: staff.phone || "",
                          address: staff.address || ""
                        })
                      }} className="px-3 py-1 border rounded">Edit</button>
                      <button onClick={() => setConfirmAction({ type: "block", staffId: staff.operatorId })} className="px-3 py-1 border border-yellow-500 text-yellow-700 rounded">Block</button>
                      <button onClick={() => setConfirmAction({ type: "delete", staffId: staff.operatorId })} className="px-3 py-1 border border-red-500 text-red-700 rounded">Delete</button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          {[...Array(totalPages)].map((_, i) => (
              <button
                  key={i}
                  onClick={() => fetchStaffList(i)}
                  className={`px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >{i + 1}</button>
          ))}
        </div>

        {/* Feedback Modal */}
        {selectedStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Send Feedback to {selectedStaff.fullName}</h2>
                <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                ></textarea>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setSelectedStaff(null)} className="px-4 py-2 border rounded-md">Cancel</button>
                  <button onClick={handleFeedback} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Send</button>
                </div>
              </div>
            </div>
        )}

        {/* Edit Modal */}
        {editStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Staff - {editStaff.fullName}</h2>
                <input className="w-full border px-3 py-2 rounded mb-2" placeholder="Full Name" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
                <input className="w-full border px-3 py-2 rounded mb-2" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                <input className="w-full border px-3 py-2 rounded mb-4" placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditStaff(null)} className="px-4 py-2 border rounded-md">Cancel</button>
                  <button onClick={handleEdit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Update</button>
                </div>
              </div>
            </div>
        )}

        {/* Confirm Dialog */}
        {confirmAction.type && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
                <h2 className="text-lg font-semibold mb-4">Confirm {confirmAction.type === "delete" ? "Delete" : "Block"}?</h2>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setConfirmAction({ type: "", staffId: null })} className="px-4 py-2 border rounded">Cancel</button>
                  <button
                      onClick={confirmAction.type === "delete" ? handleDelete : handleBlock}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                  >Confirm</button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}