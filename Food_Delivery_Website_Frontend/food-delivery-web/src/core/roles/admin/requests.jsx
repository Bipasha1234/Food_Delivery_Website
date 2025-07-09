import axios from "axios";
import { useEffect, useState } from "react";
import { FaBox, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import Sidebar from "./sidebar";

export default function Request() {
  const [requests, setRequests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/get-listed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`http://localhost:5000/api/admin/accept-request/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Accept failed:", err);
      alert("Failed to accept request.");
    }
  };

  const openRejectModal = (id) => {
    setSelectedRejectId(id);
    setShowModal(true);
  };

  const confirmReject = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/delete-request/${selectedRejectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests((prev) => prev.filter((r) => r._id !== selectedRejectId));
      setShowModal(false);
      setSelectedRejectId(null);
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject request.");
    }
  };

  return (
    <div className="flex bg-[#F7F6FB] min-h-screen">
      <Sidebar />
      <div className="flex-1 px-8 py-10">
        <div className="flex justify-end pr-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hello, Admin</span>
          </div>
        </div>

        <h2 className="text-base font-semibold mb-6">Requests</h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading requests...</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="bg-white shadow rounded-lg px-6 py-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleToggle(req._id)}
                >
                  <div className="flex items-center gap-4">
                    <FaBox className="text-xl text-gray-600" />
                    <div>
                      <h4 className="font-semibold text-sm">{req.restaurantName}</h4>
                      <p className="text-[10px] text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {expandedId === req._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {expandedId === req._id && (
                  <div className="mt-4 text-xs text-gray-700 space-y-1">
                    <p><strong>Owner Name:</strong> {req.ownerName}</p>
                    <p><strong>Email:</strong> {req.ownerEmail}</p>
                    <p><strong>Contact:</strong> {req.phone1}</p>
                    <p><strong>Details:</strong> {req.details}</p>

                    <div className="flex justify-end gap-4 mt-4">
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => openRejectModal(req._id)}
                        className="text-gray-700 hover:text-red-500 text-lg font-bold"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {requests.length === 0 && !loading && (
              <div className="text-center text-gray-500 mt-10 text-sm">
                No new requests.
              </div>
            )}
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-[#da4668] text-white rounded px-10 py-8 text-center relative shadow-lg w-96">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-white text-2xl font-bold"
            >
              <FaTimes size={16} />
            </button>
            <p className="text-sm font-medium">
              Are you sure you want to reject this request? This action cannot be undone.
            </p>
             <div className="mt-6 flex justify-center gap-6">
              
              <button
                onClick={() => setShowModal(false)}
                className="bg-white text-black hover:bg-gray-100 font-medium text-sm h-10 w-32 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="bg-gray-900 hover:bg-black text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
